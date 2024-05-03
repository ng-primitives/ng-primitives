import { formatFiles, generateFiles, names, Tree } from '@nx/devkit';
import { print, replace } from '@phenomnomnominal/tsquery';
import * as path from 'path';
import * as ts from 'typescript';
import { ExampleGeneratorSchema } from './schema';
import { addRoute } from './utils';

export async function exampleGenerator(tree: Tree, options: ExampleGeneratorSchema) {
  const projectRoot = `apps/examples/src/app/examples`;

  const nameVariants = names(options.directive);

  generateFiles(tree, path.join(__dirname, 'files'), projectRoot, {
    ...options,
    ...nameVariants,
  });

  // modifiy the app.routes.ts file to add a new route
  const appRoutesPath = `apps/examples/src/app/app.routes.ts`;

  addRoute(
    tree,
    appRoutesPath,
    `{
    path: 'examples/${options.directive}',
    loadComponent: () => import('./examples/${options.primitive}/${options.primitive}.example')
  }`,
  );

  // add a link to the home page
  const homePagePath = `apps/examples/src/app/pages/home/home.page.ts`;

  const homePage = tree.read(homePagePath).toString('utf-8');
  const output = replace(
    homePage,
    `PropertyDeclaration:has(Identifier[name="pages"]) ArrayLiteralExpression`,
    node => {
      if (ts.isArrayLiteralExpression(node)) {
        // get the existing elements as strings
        const elements: string[] = [options.directive];

        for (const element of node.elements) {
          if (ts.isStringLiteral(element)) {
            elements.push(element.text);
          }
        }

        // sort the elements alphabetically
        elements.sort();

        return print(
          ts.factory.createArrayLiteralExpression(
            elements.map(element => ts.factory.createStringLiteral(element)),
          ),
        );
      }

      return node.getText();
    },
  );

  tree.write(homePagePath, output);

  await formatFiles(tree);
}

export default exampleGenerator;
