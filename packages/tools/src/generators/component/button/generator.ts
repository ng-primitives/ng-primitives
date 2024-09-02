import { formatFiles, generateFiles, names, Tree } from '@nx/devkit';
import * as path from 'path';
import { ButtonGeneratorSchema } from './schema';

export async function componentGenerator(tree: Tree, options: ButtonGeneratorSchema) {
  generateFiles(tree, path.join(__dirname, 'files'), options.directory, {
    ...options,
    names: names(options.name),
  });
  await formatFiles(tree);

  if (options.inlineStyle) {
    tree.delete(path.join(options.directory, `${options.name}.component.${options.style}`));
  }
  if (options.inlineTemplate) {
    tree.delete(path.join(options.directory, `${options.name}.component.html`));
  }
}

export default componentGenerator;
