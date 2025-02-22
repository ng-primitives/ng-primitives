/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { formatFiles, generateFiles, names, Tree } from '@nx/devkit';
import * as path from 'path';
import { RadioGeneratorSchema } from './schema';

const radioItemStyles = `
:host {}

:host[data-hover] {}

:host[data-focus-visible] {}

:host[data-press] {}

:host[data-checked] {}

[ngpRadioIndicator] {}

:host[data-checked] [ngpRadioIndicator] {}
`;

export async function radioGenerator(tree: Tree, options: RadioGeneratorSchema) {
  const { fileName } = names(options.name);

  generateFiles(tree, path.join(__dirname, `files/radio-group`), options.directory, {
    ...options,
    ...names(`${options.name}-group`),
    selector: `${options.prefix}-${fileName}-group`,
    styles: `:host { }`,
    template: `<ng-content />`,
  });

  generateFiles(tree, path.join(__dirname, `files/radio-item`), options.directory, {
    ...options,
    ...names(`${options.name}-item`),
    selector: `${options.prefix}-${fileName}-item`,
    styles: radioItemStyles,
    template: `
      <div ngpRadioIndicator></div>
      <ng-content />
    `,
  });

  if (options.inlineStyle) {
    tree.delete(path.join(options.directory, `${fileName}-item.component.${options.style}`));
    tree.delete(path.join(options.directory, `${fileName}-group.component.${options.style}`));
  }

  if (options.inlineTemplate) {
    tree.delete(path.join(options.directory, `${fileName}-item.component.html`));
    tree.delete(path.join(options.directory, `${fileName}-group.component.html`));
  }

  await formatFiles(tree);
}

export default radioGenerator;
