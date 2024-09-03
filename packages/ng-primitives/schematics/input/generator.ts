/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { formatFiles, generateFiles, names, Tree } from '@nx/devkit';
import * as path from 'path';
import { InputGeneratorSchema } from './schema';

export async function inputGenerator(tree: Tree, options: InputGeneratorSchema) {
  generateFiles(tree, path.join(__dirname, 'files'), options.directory, {
    ...options,
    names: names(options.name),
  });
  await formatFiles(tree);

  if (options.inlineStyle) {
    tree.delete(path.join(options.directory, `${options.name}.component.${options.style}`));
  }
  if (options.inlineTemplate) {
    tree.delete(path.join(options.directory, `${options.name}.component.html`));
  }
}

export default inputGenerator;
