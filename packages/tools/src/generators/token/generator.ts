import { formatFiles, generateFiles, names, Tree } from '@nx/devkit';
import * as path from 'path';
import { addExportToIndex, getPrimitiveSourceRoot } from '../../utils';
import { TokenGeneratorSchema } from './schema';

export async function tokenGenerator(tree: Tree, options: TokenGeneratorSchema) {
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
    `export { Ngp${names(options.directive).className}Token, inject${names(options.directive).className} } from './${options.directive}/${options.directive}.token';`,
  );

  await formatFiles(tree);
}

export default tokenGenerator;
