/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { formatFiles, generateFiles, names, Tree } from '@nx/devkit';
import * as path from 'path';
import { FormFieldGeneratorSchema } from './schema';

export async function formFieldGenerator(tree: Tree, options: FormFieldGeneratorSchema) {
  generateFiles(tree, path.join(__dirname, 'files'), options.directory, {
    ...options,
    ...names(options.name),
  });

  if (options.inlineStyle) {
    tree.delete(path.join(options.directory, `${options.name}.component.${options.style}`));
  }

  if (options.inlineTemplate) {
    tree.delete(path.join(options.directory, `${options.name}.component.html`));
  }

  await formatFiles(tree);
}

export default formFieldGenerator;
