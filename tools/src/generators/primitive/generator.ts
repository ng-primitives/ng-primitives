import { librarySecondaryEntryPointGenerator } from '@nx/angular/generators';
import { formatFiles, Tree } from '@nx/devkit';
import { getPrimitiveIndex } from '../../utils';
import { PrimitiveGeneratorSchema } from './schema';

export async function primitiveGenerator(tree: Tree, options: PrimitiveGeneratorSchema) {
  await librarySecondaryEntryPointGenerator(tree, {
    library: 'ng-primitives',
    name: options.name,
    skipFormat: true,
    skipModule: true,
  });

  tree.write(getPrimitiveIndex(tree, options.name), '');

  await formatFiles(tree);
}

export default primitiveGenerator;
