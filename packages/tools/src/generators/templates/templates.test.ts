import { Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { templatesGenerator } from './templates';

const SOURCES = 'apps/components/src/app/pages/reusable-components';
const TEMPLATES = 'packages/ng-primitives/schematics/ng-generate/templates';

describe('templates generator', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  /** Write a single file primitive to the source directory the generator reads. */
  function writePrimitive(primitive: string, content: string): void {
    tree.write(`${SOURCES}/${primitive}/${primitive}.ts`, content);
  }

  /** Read the template the generator produced for a single file primitive. */
  function readTemplate(primitive: string): string {
    return (
      tree.read(
        `${TEMPLATES}/${primitive}/${primitive}.__fileSuffix@dasherize__.ts.template`,
        'utf-8',
      ) ?? ''
    );
  }

  it('should drop the separator with the prefix in a dashed selector', async () => {
    writePrimitive(
      'thing',
      `import { Directive } from '@angular/core';

@Directive({ selector: 'button[app-thing]' })
export class Thing {}`,
    );

    await templatesGenerator(tree);

    // the conditional is what keeps an empty prefix from leaving `[-thing]`
    expect(readTemplate('thing')).toContain(
      `selector: 'button[<% if (prefix) { %><%= prefix %>-<% } %>thing]'`,
    );
  });

  it('should rewrite a camelCase selector, input alias and host directive inputs', async () => {
    writePrimitive(
      'thing',
      `import { Directive, input } from '@angular/core';
import { NgpThing } from 'ng-primitives/thing';

@Directive({
  selector: '[appThing]',
  hostDirectives: [{ directive: NgpThing, inputs: ['ngpThingDisabled:appThingDisabled'] }],
})
export class Thing {
  readonly content = input.required<string>({ alias: 'appThing' });
}`,
    );

    await templatesGenerator(tree);

    const template = readTemplate('thing');

    expect(template).toContain(`selector: '[<%= camelize(prefix + "Thing") %>]'`);
    expect(template).toContain(`'ngpThingDisabled:<%= camelize(prefix + "ThingDisabled") %>'`);
    expect(template).toContain(`alias: '<%= camelize(prefix + "Thing") %>'`);
  });

  it('should rewrite model and output aliases and host directive outputs', async () => {
    writePrimitive(
      'thing',
      `import { Directive, model, output } from '@angular/core';
import { NgpThing } from 'ng-primitives/thing';

@Directive({
  selector: '[appThing]',
  hostDirectives: [{ directive: NgpThing, outputs: ['ngpThingChange:appThingChange'] }],
})
export class Thing {
  readonly value = model<string>('', { alias: 'appThingValue' });
  readonly done = output<void>({ alias: 'appThingDone' });
}`,
    );

    await templatesGenerator(tree);

    const template = readTemplate('thing');

    expect(template).toContain(`'ngpThingChange:<%= camelize(prefix + "ThingChange") %>'`);
    expect(template).toContain(`alias: '<%= camelize(prefix + "ThingValue") %>'`);
    expect(template).toContain(`alias: '<%= camelize(prefix + "ThingDone") %>'`);
  });

  it('should reject a prefix it does not know how to rewrite', async () => {
    // `exportAs` is not one of the nodes the rewrite reaches, so the prefix would otherwise
    // be baked into the template and quietly ignore --prefix
    writePrimitive(
      'thing',
      `import { Directive } from '@angular/core';

@Directive({ selector: '[appThing]', exportAs: 'appThing' })
export class Thing {}`,
    );

    await expect(templatesGenerator(tree)).rejects.toThrow(
      /thing\/thing\.ts: the "app" prefix survived in appThing/,
    );
  });
});
