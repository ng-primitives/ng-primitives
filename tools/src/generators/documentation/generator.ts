import { formatFiles, generateFiles, names, Tree } from '@nx/devkit';
import * as path from 'path';
import { exampleGenerator } from '../example/generator';
import { DocumentationGeneratorSchema } from './schema';

export async function documentationGenerator(tree: Tree, options: DocumentationGeneratorSchema) {
  const projectRoot = `apps/documentation/src/app/pages/primitives`;

  generateFiles(tree, path.join(__dirname, 'files'), projectRoot, {
    ...options,
    globalConfig: options.globalConfig ?? false,
    ...names(options.name),
  });

  if (options.example) {
    await exampleGenerator(tree, {
      directive: options.name,
      primitive: options.primitive,
    });
  }

  await formatFiles(tree);
}

export default documentationGenerator;
