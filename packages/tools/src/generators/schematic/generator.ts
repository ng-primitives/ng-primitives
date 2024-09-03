import { formatFiles, generateFiles, joinPathFragments, names, Tree, updateJson } from '@nx/devkit';
import { generatorGenerator } from '@nx/plugin/generators';
import { SchematicGeneratorSchema } from './schema';

export async function schematicGenerator(tree: Tree, options: SchematicGeneratorSchema) {
  const projectRoot = 'packages/ng-primitives';
  const { fileName } = names(options.name);

  await generatorGenerator(tree, {
    name: options.name,
    unitTestRunner: 'none',
    description: `Add a ${options.name} component to the project.`,
    directory: joinPathFragments(projectRoot, 'schematics', fileName),
    nameAndDirectoryFormat: 'as-provided',
    skipFormat: true,
  });

  generateFiles(
    tree,
    joinPathFragments(__dirname, 'files'),
    joinPathFragments(projectRoot, 'schematics', fileName),
    {
      ...options,
      ...names(options.name),
    },
  );

  // delete the default files that are generated by the generator generator
  tree.delete(
    joinPathFragments(projectRoot, 'schematics', fileName, 'files', 'src', 'index.ts.template'),
  );

  updateJson(tree, joinPathFragments(projectRoot, 'generators.json'), json => {
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
