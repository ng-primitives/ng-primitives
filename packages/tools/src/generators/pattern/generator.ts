import { formatFiles, generateFiles, names, Tree } from '@nx/devkit';
import { tsquery } from '@phenomnomnominal/tsquery';
import * as path from 'path';
import * as ts from 'typescript';
import { addExportToIndex, getPrimitiveSourceRoot } from '../../utils';
import { PatternGeneratorSchema } from './schema';

export async function patternGenerator(tree: Tree, options: PatternGeneratorSchema) {
  // normalize the directive name - for example someone might pass in NgpAvatar, but we want to use avatar
  options.directive = options.directive.replace('Ngp', '').toLowerCase();

  const sourceRoot = getPrimitiveSourceRoot(tree, options.primitive);
  const directiveNames = names(options.directive);

  // Generate pattern file
  generateFiles(tree, path.join(__dirname, 'files'), sourceRoot, {
    ...options,
    ...directiveNames,
  });

  // Update the existing directive file to add the pattern provider
  const directivePath = `${sourceRoot}/${options.directive}/${options.directive}.ts`;

  if (tree.exists(directivePath)) {
    let directiveContent = tree.read(directivePath, 'utf-8');
    const ast = tsquery.ast(directiveContent);

    // Add import for pattern
    if (!directiveContent.includes(`from './${options.directive}-pattern'`)) {
      // Find the last import statement
      const importDeclarations = tsquery(ast, 'ImportDeclaration');

      if (importDeclarations.length > 0) {
        const lastImport = importDeclarations[importDeclarations.length - 1];
        const importToAdd = `\nimport { ngp${directiveNames.className}Pattern, provide${directiveNames.className}Pattern } from './${options.directive}-pattern';`;
        directiveContent =
          directiveContent.slice(0, lastImport.getEnd()) +
          importToAdd +
          directiveContent.slice(lastImport.getEnd());
      }
    }

    // Update the AST with new content
    const updatedAst = tsquery.ast(directiveContent);

    // Add provider to providers array in @Directive decorator
    const decorators = tsquery(updatedAst, 'Decorator:has(Identifier[name=Directive])');

    if (decorators.length > 0) {
      const decorator = decorators[0];
      const decoratorText = decorator.getText();

      // Check if provider is already in the decorator
      if (!decoratorText.includes(`provide${directiveNames.className}Pattern`)) {
        // Check if providers array exists
        const providersProperty = tsquery(
          decorator,
          'PropertyAssignment:has(Identifier[name=providers])',
        );

        if (providersProperty.length > 0) {
          // Add to existing providers array
          const providersArray = tsquery(
            providersProperty[0],
            'ArrayLiteralExpression',
          )[0] as ts.ArrayLiteralExpression;
          const providerToAdd = `provide${directiveNames.className}Pattern(Ngp${directiveNames.className}, instance => instance.pattern)`;

          // Insert at the beginning of the array
          const insertPosition = providersArray.getStart() + 1;
          directiveContent =
            directiveContent.slice(0, insertPosition) +
            providerToAdd +
            (providersArray.elements.length > 0 ? ', ' : '') +
            directiveContent.slice(insertPosition);
        } else {
          // Add providers array to decorator
          const objectLiteral = tsquery(
            decorator,
            'ObjectLiteralExpression',
          )[0] as ts.ObjectLiteralExpression;

          if (objectLiteral) {
            const providerToAdd = `\n  providers: [provide${directiveNames.className}Pattern(Ngp${directiveNames.className}, instance => instance.pattern)]`;

            // Find the position to insert (before the closing brace)
            const properties = objectLiteral.properties;
            if (properties.length > 0) {
              // Insert after the last property
              const lastProperty = properties[properties.length - 1];
              const insertPosition = lastProperty.getEnd();
              directiveContent =
                directiveContent.slice(0, insertPosition) +
                ',' +
                providerToAdd +
                directiveContent.slice(insertPosition);
            } else {
              // Empty object, insert after opening brace
              const insertPosition = objectLiteral.getStart() + 1;
              directiveContent =
                directiveContent.slice(0, insertPosition) +
                providerToAdd +
                '\n' +
                directiveContent.slice(insertPosition);
            }
          }
        }
      }
    }

    // Add pattern property to class if it doesn't exist
    if (!directiveContent.includes('readonly pattern =')) {
      const updatedAst2 = tsquery.ast(directiveContent);
      const classDeclarations = tsquery(
        updatedAst2,
        `ClassDeclaration:has(Identifier[name=Ngp${directiveNames.className}])`,
      );

      if (classDeclarations.length > 0) {
        const classDeclaration = classDeclarations[0] as ts.ClassDeclaration;

        // Find the class body (not the decorator)
        if (classDeclaration.members) {
          // Get the position right after the opening brace of the class
          const classStart = classDeclaration.members.pos;
          const patternProperty = `\n  /**\n   * The pattern instance.\n   */\n  protected readonly pattern = ngp${directiveNames.className}Pattern({\n    // Pass inputs to pattern\n  });\n`;
          directiveContent =
            directiveContent.slice(0, classStart) +
            patternProperty +
            directiveContent.slice(classStart);
        }
      }
    }

    tree.write(directivePath, directiveContent);
  }

  // Add pattern exports to index.ts
  addExportToIndex(
    tree,
    options.primitive,
    `export {\n  ngp${directiveNames.className}Pattern,\n  provide${directiveNames.className}Pattern,\n  inject${directiveNames.className}Pattern,\n  type Ngp${directiveNames.className}State,\n  type Ngp${directiveNames.className}Props,\n} from './${options.directive}/${options.directive}-pattern';`,
  );

  await formatFiles(tree);
}

export default patternGenerator;
