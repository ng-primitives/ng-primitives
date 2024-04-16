import { addRoute } from '@nx/angular/src/utils/nx-devkit/route-utils';
import { formatFiles, generateFiles, names, Tree } from '@nx/devkit';
import * as path from 'path';
import { ExampleGeneratorSchema } from './schema';

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
    path: '${options.primitive}/${options.directive}',
    loadChildren: () => import('./examples/${options.primitive}/${options.primitive}.example')
  }`,
  );

  await formatFiles(tree);
}

export default exampleGenerator;
