import { librarySecondaryEntryPointGenerator } from '@nx/angular/generators';
import { formatFiles, Tree } from '@nx/devkit';
import { PrimitiveGeneratorSchema } from './schema';

export async function primitiveGenerator(tree: Tree, options: PrimitiveGeneratorSchema) {
  await librarySecondaryEntryPointGenerator(tree, {
    library: 'ng-primitives',
    name: options.name,
    skipFormat: true,
    skipModule: true,
  });

  const indexPath = `libs/ng-primitives/${options.name}/src/index.ts`;
  tree.write(indexPath, '');

  await formatFiles(tree);
}

export default primitiveGenerator;
