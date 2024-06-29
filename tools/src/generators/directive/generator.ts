import { formatFiles, generateFiles, joinPathFragments, names, Tree } from '@nx/devkit';
import { addExportToIndex } from '../../utils';
import configGenerator from '../config/generator';
import documentationGenerator from '../documentation/generator';
import examplesGenerator from '../example/generator';
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
    `export { Ngp${names(options.name).className} } from './${options.name}/${options.name}.directive';`,
  );

  if (options.addExample) {
    await examplesGenerator(tree, {
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

  if (options.documentation && options.documentation !== 'None') {
    await documentationGenerator(tree, {
      name: options.name,
      primitive: options.primitive,
      description: 'Enter a description here',
      section: options.documentation,
    });
  }

  await formatFiles(tree);
}

export default directiveGenerator;
