import { formatFiles, Tree } from '@nx/devkit';
import { query } from '@phenomnomnominal/tsquery';
import * as ts from 'typescript';

export async function templatesGenerator(tree: Tree) {
  const templatesPath = 'apps/components/src/app';

  // delete the existing templates
  tree.delete('packages/ng-primitives/schematics/ng-generate/templates');

  // each folder in this directory is a primitive that can be used as a template
  for (const primitive of tree.children(templatesPath)) {
    // if this is a file, skip it - we only care about files in directories
    if (tree.isFile(`${templatesPath}/${primitive}`)) {
      continue;
    }

    // read the files in the primitive folder
    const files = tree.children(`${templatesPath}/${primitive}`);

    for (const file of files) {
      // skip any app.ts files as they are for example purposes only
      if (file.endsWith('app.ts')) {
        continue;
      }

      // read the file contents
      let content = tree.read(`${templatesPath}/${primitive}/${file}`, 'utf-8');

      // process the template
      content = processTemplate(content);

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
 * - Replace .ts with .<%= componentSuffix %>.ts. in the import paths
 */
function processTemplate(content: string): string {
  // find the component selector
  const selectors = query<ts.StringLiteral>(
    content,
    'ClassDeclaration > Decorator > CallExpression ObjectLiteralExpression PropertyAssignment:has(Identifier[name="selector"]) > StringLiteral',
  );

  if (!selectors) {
    throw new Error('Component selector not found');
  }

  for (const selector of selectors) {
    // replace the prefix with the <%= prefix %> placeholder
    const selectorValue = selector.getText();

    // determine the new selector value
    const newSelectorValue = selectorValue.replace('app-', '<%= prefix %>-');

    // replace the string exactly based on the position, not text matching
    const start = selector.getStart();
    const end = selector.getEnd();

    content = content.substring(0, start) + newSelectorValue + content.substring(end);
  }

  // replace import paths with the <%= componentSuffix %> placeholder
  const imports = query(content, 'ImportDeclaration > StringLiteral');

  for (const importPath of imports) {
    // if the import path is not relative, skip it
    if (!importPath.getText().startsWith('.')) {
      continue;
    }

    const importValue = importPath.getText();
    // append the <%= fileSuffix %> placeholder to the end
    const newImportValue = importValue + '.<%= fileSuffix %>';

    const start = importPath.getStart();
    const end = importPath.getEnd();

    content = content.substring(0, start) + newImportValue + content.substring(end);
  }

  // find all class identifiers in imports from relative paths
  const importDeclarations = query<ts.ImportDeclaration>(content, 'ImportDeclaration');

  for (const importDeclaration of importDeclarations) {
    // if this is a type import, skip it
    if (importDeclaration.importClause?.isTypeOnly) {
      continue;
    }

    // get the import path
    const importPath = query(importDeclaration, 'StringLiteral')[0].getText();

    // if the import path is not relative, skip it
    if (!importPath.startsWith('.')) {
      continue;
    }

    // get the named imports
    const namedImports = query(importDeclaration, 'NamedImports');

    if (namedImports.length === 0) {
      continue;
    }

    // get the class identifiers - they are identifiers that are upper camel case and not type imports
    const classIdentifiers = query<ts.Identifier>(importDeclaration, 'Identifier').filter(
      identifier => {
        const text = identifier.getText();
        const isUpperCamelCase = /^[A-Z]/.test(text);

        // Ensure it's not from a type-only import
        const isTypeImport =
          ts.isImportDeclaration(identifier.parent) && identifier.parent.importClause?.isTypeOnly;

        return isUpperCamelCase && !isTypeImport;
      },
    );

    for (const classIdentifier of classIdentifiers) {
      // get the class name
      const className = classIdentifier.getText();

      // determine the new class name
      const newClassName = `${className}<%= suffix %>`;
      const start = classIdentifier.getStart();
      const end = classIdentifier.getEnd();

      content = content.substring(0, start) + newClassName + content.substring(end);
    }
  }

  // find any Angular component class names in the file and append the <%= componentSuffix %> placeholder
  const componentClassNames = query(
    content,
    'ClassDeclaration:has(Decorator > CallExpression > Identifier[name="Component"]) > Identifier',
  );

  for (const className of componentClassNames) {
    // find all the matching identifiers in the file
    const identifiers = query<ts.Identifier>(content, `Identifier[name="${className.getText()}"]`);

    // Sort identifiers in reverse order (by start position)
    identifiers.sort((a, b) => b.getStart() - a.getStart());

    for (const identifier of identifiers) {
      // determine the new class name
      const newClassName = `${className.getText()}<%= componentSuffix %>`;
      const start = identifier.getStart();
      const end = identifier.getEnd();

      content = content.substring(0, start) + newClassName + content.substring(end);
    }
  }

  return content;
}
