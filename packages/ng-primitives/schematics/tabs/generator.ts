/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { formatFiles, generateFiles, names, Tree } from '@nx/devkit';
import * as path from 'path';
import { TabsGeneratorSchema } from './schema';

const panel = 'panel';
const tab = 'tab';
const list = 'list';
const button = 'button';

const panelStyles = `
:host { }

:host:not([data-active]) {
display: none;
}
`;
const buttonStyles = `
:host { }
:host[data-focus-visible] {}
:host[data-active] {}
:host {}
`;

export async function tabsGenerator(tree: Tree, options: TabsGeneratorSchema) {
  const { fileName } = names(options.name);

  generateFiles(tree, path.join(__dirname, `files/${tab}`), options.directory, {
    ...options,
    ...names(options.name),
    selector: `${options.prefix}-${fileName}`,
    styles: `:host { }`,
    template: `<ng-content />`,
  });

  generateFiles(tree, path.join(__dirname, `files/${panel}`), options.directory, {
    ...options,
    ...names(`${options.name}-${panel}`),
    selector: `${options.prefix}-${fileName}-${panel}`,
    styles: panelStyles,
    template: `<ng-content />`,
  });

  generateFiles(tree, path.join(__dirname, `files/${list}`), options.directory, {
    ...options,
    ...names(`${options.name}-${list}`),
    selector: `${options.prefix}-${fileName}-${list}`,
    styles: `:host { }`,
    template: `<ng-content />`,
  });

  generateFiles(tree, path.join(__dirname, `files/${button}`), options.directory, {
    ...options,
    ...names(`${options.name}-${button}`),
    selector: `button[${options.prefix}-${fileName}-${button}]`,
    styles: buttonStyles,
    template: `<ng-content />`,
  });

  if (options.inlineStyle) {
    tree.delete(path.join(options.directory, `${fileName}.component.${options.style}`));
    tree.delete(path.join(options.directory, `${fileName}-${panel}.component.${options.style}`));
    tree.delete(path.join(options.directory, `${fileName}-${list}.component.${options.style}`));
    tree.delete(path.join(options.directory, `${fileName}-${button}.component.${options.style}`));
  }

  if (options.inlineTemplate) {
    tree.delete(path.join(options.directory, `${fileName}.component.html`));
    tree.delete(path.join(options.directory, `${fileName}-${panel}.component.html`));
    tree.delete(path.join(options.directory, `${fileName}-${list}.component.html`));
    tree.delete(path.join(options.directory, `${fileName}-${button}.component.html`));
  }

  await formatFiles(tree);
}

export default tabsGenerator;
