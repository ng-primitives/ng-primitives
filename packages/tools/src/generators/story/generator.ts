import { formatFiles, generateFiles, names, Tree } from '@nx/devkit';
import * as path from 'path';
import { getPrimitiveSourceRoot } from '../../utils';
import { StoryGeneratorSchema } from './schema';

export async function storyGenerator(tree: Tree, options: StoryGeneratorSchema) {
  const projectRoot = getPrimitiveSourceRoot(tree, options.primitive);
  generateFiles(tree, path.join(__dirname, 'files'), projectRoot, {
    ...options,
    ...names(options.primitive),
    package: `../${names(options.directive).fileName}/${names(options.directive).fileName}.directive`,
    directive: `Ngp${names(options.directive).className}Directive`,
    selector: `ngp${names(options.directive).className}`,
  });
  await formatFiles(tree);
}

export default storyGenerator;
