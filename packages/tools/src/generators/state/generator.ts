import { formatFiles, generateFiles, names, Tree } from '@nx/devkit';
import * as path from 'path';
import { addExportToIndex, getPrimitiveSourceRoot } from '../../utils';
import { StateGeneratorSchema } from './schema';

export async function stateGenerator(tree: Tree, options: StateGeneratorSchema) {
  // normalize the directive name - for example someone might pass in NgpAvatarDirective, but we want to use avatar
  // so we need to remove the Ngp and the Directive
  options.directive = options.directive.replace('Directive', '').replace('Ngp', '').toLowerCase();

  const sourceRoot = getPrimitiveSourceRoot(tree, options.primitive);
  generateFiles(tree, path.join(__dirname, 'files'), sourceRoot, {
    ...options,
    ...names(options.directive),
  });

  addExportToIndex(
    tree,
    options.primitive,
    `export { provide${names(options.directive).className}State, inject${names(options.directive).className}State } from './${options.directive}/${options.directive}-state';`,
  );

  await formatFiles(tree);
}

export default stateGenerator;
