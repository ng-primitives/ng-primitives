import { formatFiles, generateFiles, joinPathFragments, names, Tree } from '@nx/devkit';
import { DirectiveGeneratorSchema } from './schema';

export async function directiveGenerator(tree: Tree, options: DirectiveGeneratorSchema) {
  generateFiles(
    tree,
    joinPathFragments(__dirname, './files'),
    joinPathFragments('packages', 'ng-primitives', options.primitive, 'src', options.name),
    {
      ...options,
      ...names(options.name),
    },
  );

  await formatFiles(tree);
}

export default directiveGenerator;
