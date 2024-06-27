import { formatFiles, generateFiles, names, Tree } from '@nx/devkit';
import * as path from 'path';
import { ExampleGeneratorSchema } from './schema';

export async function exampleGenerator(tree: Tree, options: ExampleGeneratorSchema) {
  const nameVariants = names(options.directive);
  const projectRoot = `apps/documentation/src/app/examples`;

  generateFiles(tree, path.join(__dirname, 'files'), projectRoot, {
    ...options,
    ...nameVariants,
  });

  await formatFiles(tree);
}

export default exampleGenerator;
