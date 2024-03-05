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

  const indexPath = joinPathFragments(
    'packages',
    'ng-primitives',
    options.primitive,
    'src',
    'index.ts',
  );

  const indexContent = tree.read(indexPath).toString('utf-8');
  const newContent = `${indexContent}\nexport * from './${options.name}/${options.name}.directive';`;
  tree.write(indexPath, newContent);

  await formatFiles(tree);
}

export default directiveGenerator;
