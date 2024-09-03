import { formatFiles, generateFiles, Tree } from '@nx/devkit';
import * as path from 'path';
import { getPrimitiveSourceRoot } from '../../utils';
import { SchematicGeneratorSchema } from './schema';

export async function schematicGenerator(tree: Tree, options: SchematicGeneratorSchema) {
  const projectRoot = getPrimitiveSourceRoot(tree, options.name);
  generateFiles(tree, path.join(__dirname, 'files'), projectRoot, options);
  await formatFiles(tree);
}

export default schematicGenerator;
