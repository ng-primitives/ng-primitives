/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { formatFiles, generateFiles, names, Tree } from '@nx/devkit';
import * as path from 'path';
import { AccordionGeneratorSchema } from './schema';

const item = 'item';
const accordionItemPath = 'accordion-item';
const accordionPath = 'accordion';
const accordionItemStyles = `
    :host {}

    [ngpAccordionContent] {}

    [ngpAccordionContent][data-open] {}

    [ngpAccordionTrigger][data-focus-visible] {}
`;

export async function accordionGenerator(tree: Tree, options: AccordionGeneratorSchema) {
  const { fileName } = names(options.name);

  generateFiles(tree, path.join(__dirname, `files/${accordionPath}`), options.directory, {
    ...options,
    ...names(options.name),
    selector: `${options.prefix}-${fileName}`,
    styles: `:host { }`,
    template: `<ng-content />`,
  });

  generateFiles(tree, path.join(__dirname, `files/${accordionItemPath}`), options.directory, {
    ...options,
    ...names(`${options.name}-${item}`),
    selector: `${options.prefix}-${fileName}-${item}`,
    styles: accordionItemStyles,
    template: `<ng-content />`,
  });

  if (options.inlineStyle) {
    tree.delete(path.join(options.directory, `${fileName}-${item}.component.${options.style}`));
    tree.delete(path.join(options.directory, `${fileName}.component.${options.style}`));
  }

  if (options.inlineTemplate) {
    tree.delete(path.join(options.directory, `${fileName}-${item}.component.html`));
    tree.delete(path.join(options.directory, `${fileName}.component.html`));
  }

  await formatFiles(tree);
}

export default accordionGenerator;
