import { formatFiles, generateFiles, names, Tree, updateJson } from '@nx/devkit';
import * as path from 'path';
import { exampleGenerator } from '../example/generator';
import { DocumentationGeneratorSchema } from './schema';

export async function documentationGenerator(tree: Tree, options: DocumentationGeneratorSchema) {
  const projectRoot = `apps/documentation/primitives`;

  generateFiles(tree, path.join(__dirname, 'files'), projectRoot, {
    ...options,
    ...names(options.name),
  });

  updateJson(tree, 'apps/documentation/mint.json', json => {
    json.navigation[1].pages.push(`primitives/${names(options.name).fileName}`);
    json.navigation[1].pages.sort();
    return json;
  });

  if (options.example) {
    await exampleGenerator(tree, {
      directive: options.name,
      primitive: options.name,
    });
  }

  await formatFiles(tree);
}

export default documentationGenerator;
