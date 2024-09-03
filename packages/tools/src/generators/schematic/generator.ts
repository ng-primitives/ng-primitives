import { formatFiles, generateFiles, joinPathFragments, names, Tree, updateJson } from '@nx/devkit';
import { generatorGenerator } from '@nx/plugin/generators';
import * as path from 'path';
import { getPrimitiveSourceRoot } from '../../utils';
import { SchematicGeneratorSchema } from './schema';

export async function schematicGenerator(tree: Tree, options: SchematicGeneratorSchema) {
  const projectRoot = getPrimitiveSourceRoot(tree, options.name);
  const { fileName } = names(options.name);

  await generatorGenerator(tree, {
    name: options.name,
    unitTestRunner: 'none',
    description: `Add a ${options.name} component to the project.`,
    directory: joinPathFragments(projectRoot, 'schematics', fileName),
    nameAndDirectoryFormat: 'as-provided',
    skipFormat: true,
  });

  generateFiles(tree, path.join(__dirname, 'files'), projectRoot, {
    ...options,
    ...names(options.name),
  });

  updateJson(tree, path.join(projectRoot, 'generators.json'), json => {
    json.generators[fileName] = {
      factory: `./schematics/${fileName}/generator`,
      schema: `./schematics/${fileName}/schema.json`,
      description: `Add a ${options.name} component to the project.`,
    };

    json.schematics[fileName] = {
      factory: `./schematics/${fileName}/compat`,
      schema: `./schematics/${fileName}/schema.json`,
      description: `Add a ${options.name} component to the project.`,
    };
    return json;
  });

  await formatFiles(tree);
}

export default schematicGenerator;
