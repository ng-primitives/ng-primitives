import { formatFiles, Tree } from '@nx/devkit';
import { query } from '@phenomnomnominal/tsquery';
import * as ts from 'typescript';
import { generateTailwindComponentVariant } from '../../tailwind-variant';

export async function templatesGenerator(tree: Tree) {
  const templatesPath = 'apps/components/src/app/pages/reusable-components';

  // delete the existing templates
  tree.delete('packages/ng-primitives/schematics/ng-generate/templates');
  tree.delete('packages/ng-primitives/schematics/ng-generate/templates-tailwind');

  // each folder in this directory is a primitive that can be used as a template
  for (const primitive of tree.children(templatesPath)) {
    // if this is a file, skip it - we only care about files in directories
    if (tree.isFile(`${templatesPath}/${primitive}`)) {
      continue;
    }

    // read the files in the primitive folder, skipping index.page.ts files as they are
    // for example purposes only
    const files = tree
      .children(`${templatesPath}/${primitive}`)
      .filter(file => file.endsWith('.ts') && !file.endsWith('index.page.ts'));

    // Collect the component classes declared across the whole primitive first. A part
    // that imports one of them from a sibling file has to refer to it by its suffixed
    // name, and it cannot know that by looking at its own source alone.
    const componentClasses = new Set<string>();

    for (const file of files) {
      const content = tree.read(`${templatesPath}/${primitive}/${file}`, 'utf-8');

      if (content) {
        for (const className of findComponentClasses(content)) {
          componentClasses.add(className);
        }
      }
    }

    for (const file of files) {
      const filePath = `${templatesPath}/${primitive}/${file}`;

      if (!tree.exists(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }

      // read the file contents
      const source = tree.read(filePath, 'utf-8');

      if (source === null) {
        throw new Error(`File could not be read: ${filePath}`);
      }

      // process the template
      const content = processTemplate(source, componentClasses);

      assertPrefixReplaced(content, filePath);

      // write the new file to packages/ng-primitives/schematics/ng-generate/templates
      const templateFileName = `${file.replace('.ts', '.__fileSuffix@dasherize__.ts')}.template`;
      tree.write(
        `packages/ng-primitives/schematics/ng-generate/templates/${primitive}/${templateFileName}`,
        content,
      );

      // the tailwind variant: utility classes on the elements, raw CSS only for
      // what Tailwind cannot express (keyframes, combinators, ordered cascades)
      const tailwindContent = processTemplate(
        generateTailwindComponentVariant(source).source,
        componentClasses,
      );

      assertPrefixReplaced(tailwindContent, filePath);

      tree.write(
        `packages/ng-primitives/schematics/ng-generate/templates-tailwind/${primitive}/${templateFileName}`,
        tailwindContent,
      );
    }
  }

  await formatFiles(tree);
}

export default templatesGenerator;

/**
 * Convert the template into Angular schematics format
 * This does the following:
 * - Replace the prefix in the component selector, in the input/output aliases, and in the
 *   host directive input/output mappings with the <%= prefix %> placeholder
 * - Append any component class names with the <%= componentSuffix %> placeholder
 * - Append the <%= fileSuffix %> placeholder to relative import paths, so a part still
 *   resolves its siblings once they are generated under the consumer's own suffixes
 * - Prefix the styles with a note about the theme variables they rely on
 */
function processTemplate(content: string, componentClasses: ReadonlySet<string>): string {
  // Every rewrite is collected against a single parse and applied afterwards, right to
  // left. Splicing as we go would invalidate the positions of every node we had not
  // visited yet, and re-parsing a partially rewritten file silently matches fewer nodes.
  const edits: Edit[] = [];

  // find the component selector
  const selectors = query<ts.StringLiteral>(
    content,
    'ClassDeclaration > Decorator > CallExpression ObjectLiteralExpression PropertyAssignment:has(Identifier[name="selector"]) > StringLiteral',
  );

  if (selectors.length === 0) {
    throw new Error('Component selector not found');
  }

  // replace the prefix with the <%= prefix %> placeholder
  for (const selector of selectors) {
    edits.push({
      start: selector.getStart(),
      end: selector.getEnd(),
      text: replacePrefix(selector.getText()),
    });
  }

  // The prefix is not confined to the selector: a trigger directive also carries it in its
  // input aliases (`alias: 'appPopoverTrigger'`) and in the input/output mappings of its host
  // directives (`'ngpPopoverTriggerDisabled:appPopoverTriggerDisabled'`). `model` takes the
  // same `alias` option as `input`/`output`, so it is covered even though nothing uses it yet.
  const aliases = query<ts.StringLiteral>(
    content,
    'CallExpression:has(Identifier[name=/^(input|output|model)$/]) ObjectLiteralExpression PropertyAssignment:has(Identifier[name="alias"]) > StringLiteral',
  );

  const hostDirectiveMappings = query<ts.StringLiteral>(
    content,
    'PropertyAssignment:has(Identifier[name="hostDirectives"]) PropertyAssignment:has(Identifier[name=/^(inputs|outputs)$/]) ArrayLiteralExpression > StringLiteral',
  );

  for (const literal of [...aliases, ...hostDirectiveMappings]) {
    const text = literal.getText();
    const replaced = replacePrefix(text);

    // most parts alias nothing that carries the prefix - do not queue a no-op edit
    if (replaced !== text) {
      edits.push({ start: literal.getStart(), end: literal.getEnd(), text: replaced });
    }
  }

  // point relative imports at the sibling file's generated name
  for (const specifier of query<ts.StringLiteral>(content, 'ImportDeclaration > StringLiteral')) {
    // `.text` rather than `.getText()` - the latter keeps the surrounding quotes, so a
    // relative path would never look relative
    if (!specifier.text.startsWith('.')) {
      continue;
    }

    edits.push({
      start: specifier.getStart(),
      end: specifier.getEnd(),
      // the sibling file is named with the `__fileSuffix@dasherize__` placeholder, so the
      // path has to be dasherized to match, and an absent suffix must not leave a dot
      text: `'${specifier.text}<% if (fileSuffix) { %>.<%= dasherize(fileSuffix) %><% } %>'`,
    });
  }

  // append the suffix to every component class in this primitive, at its declaration and
  // at every usage - including the files that import it from a sibling
  for (const className of componentClasses) {
    for (const identifier of query<ts.Identifier>(content, `Identifier[name="${className}"]`)) {
      edits.push({
        start: identifier.getStart(),
        end: identifier.getEnd(),
        text: `${className}<%= componentSuffix %>`,
      });
    }
  }

  // find any styles in the component and add a leading comment explaining that the example styles
  // rely on css variables that can be imported from ng-primitives/example-theme/index.css in their
  // global styles
  const styles = query<ts.PropertyAssignment>(
    content,
    'ClassDeclaration Decorator > CallExpression:has(Identifier[name="Component"]) ObjectLiteralExpression > PropertyAssignment:has(Identifier[name="styles"])',
  );

  // the styles may be a no substitution template string or a string literal
  for (const style of styles) {
    // strip the surrounding quotes or backticks from the raw text
    const styleValue = style.initializer.getText().replace(/^['"`]|['"`]$/g, '');

    edits.push({
      // offset by one to sit inside the opening quote
      start: style.initializer.getStart() + 1,
      end: style.initializer.getEnd() - 1,
      text: `\n/* These styles rely on CSS variables that can be imported from ng-primitives/example-theme/index.css in your global styles */\n${styleValue}`,
    });
  }

  return applyEdits(content, edits);
}

/**
 * Swap the `app` prefix the source components are written with for the `<%= prefix %>`
 * placeholder, in both the forms it takes:
 *
 * - dashed - `app-popover`, `[app-separator]`, `button[app-button]`
 * - camelCase - `[appPopoverTrigger]`, `alias: 'appPopoverTrigger'`
 *
 * The schema explicitly permits an empty prefix, and both forms have to survive it. The
 * dashed form drops the separator with it, so `app-popover` gives `popover` rather than a
 * leading dash - `-popover` is not a name the schema's own `html-selector` format would
 * accept. The camelCase form runs the prefix and the rest of the name back through
 * `camelize`, which lowercases the leading character for the same reason (`popoverTrigger`,
 * not `PopoverTrigger`) and as a bonus reads a multi word prefix correctly (`my-app` gives
 * `myAppPopoverTrigger`).
 *
 * Both patterns are anchored on a word boundary, and the camelCase one requires an
 * uppercase letter to follow, so ordinary words like `appearance` are left alone. Both
 * replace globally: no selector here is a comma separated list today, but a
 * `String.prototype.replace` with a string pattern would silently rewrite only the first
 * entry of one.
 */
function replacePrefix(text: string): string {
  return text
    .replace(/\bapp-/g, '<% if (prefix) { %><%= prefix %>-<% } %>')
    .replace(/\bapp([A-Z]\w*)/g, '<%= camelize(prefix + "$1") %>');
}

/**
 * Fail the build if any `app` prefix survived the rewrite.
 *
 * `replacePrefix` is only applied to the nodes the queries above reach - the selector, the
 * `alias` of an `input`/`output`/`model`, and the input/output mappings of a host directive.
 * Anything else that spells the prefix out (an `exportAs`, a decorator style `@Input('appX')`,
 * an `<app-thing>` in an inline template, an `app-thing` selector in a `styles` block) would
 * otherwise be baked into the template verbatim and quietly ignore `--prefix`, and the
 * generated templates are build output that nothing else reviews. Better to stop here and
 * teach `processTemplate` about the new shape.
 */
function assertPrefixReplaced(content: string, filePath: string): void {
  const leftovers = content.match(/\bapp-[\w-]*|\bapp[A-Z]\w*/g);

  if (leftovers) {
    throw new Error(
      `${filePath}: the "app" prefix survived in ${[...new Set(leftovers)].join(', ')}. ` +
        'processTemplate only rewrites the selector, input/output/model aliases and host ' +
        'directive input/output mappings - teach it about this location as well.',
    );
  }
}

/** The names of the classes in a file that Angular treats as components. */
function findComponentClasses(content: string): string[] {
  return query<ts.Identifier>(
    content,
    'ClassDeclaration:has(Decorator > CallExpression > Identifier[name="Component"]) > Identifier',
  ).map(identifier => identifier.text);
}

interface Edit {
  readonly start: number;
  readonly end: number;
  readonly text: string;
}

/** Apply edits from the end of the file backwards, so earlier offsets stay valid. */
function applyEdits(content: string, edits: readonly Edit[]): string {
  return [...edits]
    .sort((a, b) => b.start - a.start)
    .reduce(
      (result, edit) => result.slice(0, edit.start) + edit.text + result.slice(edit.end),
      content,
    );
}
