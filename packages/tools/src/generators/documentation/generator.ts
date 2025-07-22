import { formatFiles, generateFiles, names, Tree } from '@nx/devkit';
import * as path from 'path';
import { exampleGenerator } from '../example/generator';
import { DocumentationGeneratorSchema } from './schema';

export async function documentationGenerator(tree: Tree, options: DocumentationGeneratorSchema) {
  const projectRoot = `apps/documentation/src/app/pages/(documentation)/${names(options.section).fileName}`;

  generateFiles(tree, path.join(__dirname, 'files'), projectRoot, {
    ...options,
    globalConfig: options.globalConfig ?? false,
    ...names(options.name),
    title: options.name
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' '),
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
