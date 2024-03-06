import { formatFiles, generateFiles, names, Tree } from '@nx/devkit';
import * as path from 'path';
import { addExportToIndex, getPrimitivePath } from '../../utils';
import { ConfigGeneratorSchema } from './schema';

export async function configGenerator(tree: Tree, options: ConfigGeneratorSchema) {
  const sourceRoot = getPrimitivePath(tree, options.primitive);
  generateFiles(tree, path.join(__dirname, 'files'), sourceRoot, {
    ...options,
    ...names(options.primitive),
  });

  addExportToIndex(
    tree,
    options.primitive,
    `export * from './config/${names(options.primitive).fileName}.config';`,
  );

  await formatFiles(tree);
}

export default configGenerator;
