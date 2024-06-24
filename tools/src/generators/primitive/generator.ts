import { librarySecondaryEntryPointGenerator } from '@nx/angular/generators';
import { formatFiles, Tree } from '@nx/devkit';
import { getPrimitiveIndex } from '../../utils';
import { documentationGenerator } from '../documentation/generator';
import { PrimitiveGeneratorSchema } from './schema';

export async function primitiveGenerator(tree: Tree, options: PrimitiveGeneratorSchema) {
  await librarySecondaryEntryPointGenerator(tree, {
    library: 'ng-primitives',
    name: options.name,
    skipFormat: true,
    skipModule: true,
  });

  tree.write(getPrimitiveIndex(tree, options.name), '');

  if (options.addDocumentation) {
    await documentationGenerator(tree, {
      name: options.name,
      description: '',
      example: true,
    });
  }

  await formatFiles(tree);
}

export default primitiveGenerator;
