import { formatFiles, generateFiles, names, Tree } from '@nx/devkit';
import * as path from 'path';
import { getPrimitiveSourceRoot } from '../../utils';
import { StoryExampleGeneratorSchema } from './schema';

export async function storyExampleGenerator(tree: Tree, options: StoryExampleGeneratorSchema) {
  const projectRoot = getPrimitiveSourceRoot(tree, options.primitive);
  generateFiles(tree, path.join(__dirname, 'files'), projectRoot, {
    ...options,
    selector: 'app-' + names(options.name).fileName + '-example',
    package: `@ng-primitives/ng-primitives/${options.primitive}`,
    directive: `Ngp${names(options.name).className}Directive`,
    component: `${names(options.name).className}ExampleComponent`,
  });
  await formatFiles(tree);
}

export default storyExampleGenerator;
