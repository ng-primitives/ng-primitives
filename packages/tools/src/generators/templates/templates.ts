import { formatFiles, Tree } from '@nx/devkit';
import { query } from '@phenomnomnominal/tsquery';
import * as ts from 'typescript';

export async function templatesGenerator(tree: Tree) {
  const templatesPath = 'apps/components/src/app/pages/reusable-components';

  // delete the existing templates
  tree.delete('packages/ng-primitives/schematics/ng-generate/templates');

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

      // write the new file to packages/ng-primitives/schematics/ng-generate/templates
      tree.write(
        `packages/ng-primitives/schematics/ng-generate/templates/${primitive}/${file.replace('.ts', '.__fileSuffix@dasherize__.ts')}.template`,
        content,
      );
    }
  }

  await formatFiles(tree);
}

export default templatesGenerator;

/**
 * Convert the template into Angular schematics format
 * This does the following:
 * - Replace the prefix in the component selector with the <%= prefix %> placeholder
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
      text: selector.getText().replace('app-', '<%= prefix %>-'),
    });
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
