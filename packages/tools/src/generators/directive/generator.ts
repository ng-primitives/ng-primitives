import { formatFiles, generateFiles, joinPathFragments, names, Tree } from '@nx/devkit';
import { addExportToIndex } from '../../utils';
import configGenerator from '../config/generator';
import storyGenerator from '../story/generator';
import tokenGenerator from '../token/generator';
import { DirectiveGeneratorSchema } from './schema';

export async function directiveGenerator(tree: Tree, options: DirectiveGeneratorSchema) {
  generateFiles(
    tree,
    joinPathFragments(__dirname, './files'),
    joinPathFragments('packages', 'ng-primitives', options.primitive, 'src', options.name),
    {
      ...options,
      ...names(options.name),
      configName: `inject${names(options.primitive).className}Config`,
      configFile: names(options.primitive).fileName + '.config',
    },
  );

  addExportToIndex(
    tree,
    options.primitive,
    `export * from './${options.name}/${options.name}.directive';`,
  );

  if (options.addStories) {
    await storyGenerator(tree, {
      directive: options.name,
      primitive: options.primitive,
    });
  }

  if (options.addToken) {
    await tokenGenerator(tree, {
      directive: options.name,
      primitive: options.primitive,
    });
  }

  if (options.addConfig) {
    await configGenerator(tree, {
      primitive: options.primitive,
    });
  }

  await formatFiles(tree);
}

export default directiveGenerator;
