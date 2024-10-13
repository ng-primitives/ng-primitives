/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { formatFiles, generateFiles, names, Tree } from '@nx/devkit';
import * as path from 'path';
import { AvatarGeneratorSchema } from './schema';

const styles = `
:host { }

:host:before {}
`;
export async function avatarGenerator(tree: Tree, options: AvatarGeneratorSchema) {
  const { fileName } = names(options.name);

  generateFiles(tree, path.join(__dirname, 'files'), options.directory, {
    ...options,
    ...names(options.name),
    selector: `${options.prefix}-${fileName}`,
    styles: styles,
    template: `<ng-content />`,
  });

  if (options.inlineStyle) {
    tree.delete(path.join(options.directory, `${fileName}.component.${options.style}`));
  }

  if (options.inlineTemplate) {
    tree.delete(path.join(options.directory, `${fileName}.component.html`));
  }

  await formatFiles(tree);
}

export default avatarGenerator;
