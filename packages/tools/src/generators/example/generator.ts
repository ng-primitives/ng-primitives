import { formatFiles, generateFiles, Tree } from '@nx/devkit';
import * as path from 'path';
import { ExampleGeneratorSchema } from './schema';

export async function exampleGenerator(tree: Tree, options: ExampleGeneratorSchema) {
  const projectRoot = `apps/examples/src/app/examples`;

  generateFiles(tree, path.join(__dirname, 'files'), projectRoot, options);
  await formatFiles(tree);
}

export default exampleGenerator;
