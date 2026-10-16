import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { Schema as ApplicationOptions } from '@schematics/angular/application/schema';
import { Schema as WorkspaceOptions } from '@schematics/angular/workspace/schema';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { beforeEach, describe, expect, it } from 'vitest';
import { AngularPrimitivesComponentSchema } from './schema';

describe('Component Schematic', () => {
  const workspaceRoot = resolve(fileURLToPath(new URL('../../../../', import.meta.url)));
  const schematicRunner = new SchematicTestRunner(
    'ng-primitives',
    resolve(workspaceRoot, 'dist/ng-primitives-schematics-test/collection.json'),
  );

  const workspaceOptions: WorkspaceOptions = {
    name: 'workspace',
    newProjectRoot: 'projects',
    version: '6.0.0',
  };

  const appOptions: ApplicationOptions = {
    name: 'bar',
    inlineStyle: false,
    inlineTemplate: false,
    routing: false,
    skipTests: false,
    skipPackageJson: false,
  };

  let appTree: UnitTestTree;

  beforeEach(async () => {
    appTree = await schematicRunner.runExternalSchematic(
      '@schematics/angular',
      'workspace',
      workspaceOptions,
    );
    appTree = await schematicRunner.runExternalSchematic(
      '@schematics/angular',
      'application',
      appOptions,
      appTree,
    );
  });

  it('should create a primitive with the correct file suffix', async () => {
    const options: AngularPrimitivesComponentSchema = {
      primitive: 'button',
      path: 'projects/bar/src/app/button',
      fileSuffix: 'ng',
    };

    const tree = await schematicRunner.runSchematic('primitive', options, appTree);
    expect(tree.files).toContain('/projects/bar/src/app/button/button.ng.ts');
  });

  it('should allow a primitive to be created with no file suffix', async () => {
    const options: AngularPrimitivesComponentSchema = {
      primitive: 'button',
      path: 'projects/bar/src/app/button',
      fileSuffix: '',
    };

    const tree = await schematicRunner.runSchematic('primitive', options, appTree);
    expect(tree.files).toContain('/projects/bar/src/app/button/button.ts');
  });

  it('should create a primitive with the correct prefix', async () => {
    const options: AngularPrimitivesComponentSchema = {
      primitive: 'button',
      path: 'projects/bar/src/app/button',
      prefix: 'foo',
    };

    const tree = await schematicRunner.runSchematic('primitive', options, appTree);
    expect(tree.files).toContain('/projects/bar/src/app/button/button.component.ts');
    const content = tree.readContent('/projects/bar/src/app/button/button.component.ts');
    expect(content).toContain("selector: 'button[foo-button]'");
  });

  it('should drop the separator with the prefix when it is empty', async () => {
    const options: AngularPrimitivesComponentSchema = {
      primitive: 'button',
      path: 'projects/bar/src/app/button',
      prefix: '',
    };

    const tree = await schematicRunner.runSchematic('primitive', options, appTree);
    const content = tree.readContent('/projects/bar/src/app/button/button.component.ts');
    expect(content).toContain("selector: 'button[button]'");
  });

  describe('camelCase selectors and aliases', () => {
    // The trigger directives use an attribute selector in camelCase, and carry the prefix
    // in their input aliases too - none of which look like the dashed `app-` form.
    const triggerPath = '/projects/bar/src/app/popover/popover-trigger.component.ts';

    it('should fall back to the app prefix when none is given', async () => {
      // the default is the path almost every consumer takes, and a broken placeholder here
      // still type-checks - only an assertion catches it
      const options: AngularPrimitivesComponentSchema = {
        primitive: 'popover',
        path: 'projects/bar/src/app/popover',
      };

      const tree = await schematicRunner.runSchematic('primitive', options, appTree);
      const content = tree.readContent(triggerPath);

      expect(content).toContain("selector: '[appPopoverTrigger]'");
      expect(content).toContain("'ngpPopoverTriggerDisabled:appPopoverTriggerDisabled'");
      expect(content).toContain("alias: 'appPopoverTrigger'");
    });

    it('should apply the prefix to a camelCase selector and its aliases', async () => {
      const options: AngularPrimitivesComponentSchema = {
        primitive: 'popover',
        path: 'projects/bar/src/app/popover',
        prefix: 'foo',
      };

      const tree = await schematicRunner.runSchematic('primitive', options, appTree);
      const content = tree.readContent(triggerPath);

      expect(content).toContain("selector: '[fooPopoverTrigger]'");
      expect(content).toContain("'ngpPopoverTriggerDisabled:fooPopoverTriggerDisabled'");
      expect(content).toContain("alias: 'fooPopoverTrigger'");
    });

    it('should camelize a multi word prefix', async () => {
      const options: AngularPrimitivesComponentSchema = {
        primitive: 'popover',
        path: 'projects/bar/src/app/popover',
        prefix: 'my-app',
      };

      const tree = await schematicRunner.runSchematic('primitive', options, appTree);
      const content = tree.readContent(triggerPath);

      expect(content).toContain("selector: '[myAppPopoverTrigger]'");
      expect(content).toContain("'ngpPopoverTriggerDisabled:myAppPopoverTriggerDisabled'");
      expect(content).toContain("alias: 'myAppPopoverTrigger'");
    });

    it('should drop the prefix entirely when it is empty, keeping the name camelCase', async () => {
      const options: AngularPrimitivesComponentSchema = {
        primitive: 'popover',
        path: 'projects/bar/src/app/popover',
        prefix: '',
      };

      const tree = await schematicRunner.runSchematic('primitive', options, appTree);
      const content = tree.readContent(triggerPath);

      // a leading capital (`[PopoverTrigger]`) would be a legal but bizarre selector
      expect(content).toContain("selector: '[popoverTrigger]'");
      expect(content).toContain("'ngpPopoverTriggerDisabled:popoverTriggerDisabled'");
      expect(content).toContain("alias: 'popoverTrigger'");

      // the sibling part is generated in the same run, and its dashed selector has to come
      // out just as clean - a leading `-popover` is not a name Angular would accept
      const sibling = tree.readContent('/projects/bar/src/app/popover/popover.component.ts');
      expect(sibling).toContain("selector: 'popover'");
    });

    it('should apply the prefix to the tooltip trigger too', async () => {
      const options: AngularPrimitivesComponentSchema = {
        primitive: 'tooltip',
        path: 'projects/bar/src/app/tooltip',
        prefix: 'foo',
      };

      const tree = await schematicRunner.runSchematic('primitive', options, appTree);
      const content = tree.readContent(
        '/projects/bar/src/app/tooltip/tooltip-trigger.component.ts',
      );

      expect(content).toContain("selector: '[fooTooltipTrigger]'");
      expect(content).toContain("'ngpTooltipTriggerDisabled:fooTooltipTriggerDisabled'");
      expect(content).toContain("alias: 'fooTooltipTrigger'");
    });
  });

  it('should create a primitive with the correct component suffix', async () => {
    const options: AngularPrimitivesComponentSchema = {
      primitive: 'button',
      path: 'projects/bar/src/app/button',
      componentSuffix: '',
    };

    const tree = await schematicRunner.runSchematic('primitive', options, appTree);
    expect(tree.files).toContain('/projects/bar/src/app/button/button.component.ts');
    const content = tree.readContent('/projects/bar/src/app/button/button.component.ts');
    expect(content).toContain('export class Button {');
  });

  it('should create a button primitive', async () => {
    const options: AngularPrimitivesComponentSchema = {
      primitive: 'button',
      path: 'projects/bar/src/app/button',
    };

    const tree = await schematicRunner.runSchematic('primitive', options, appTree);
    expect(tree.files).toContain('/projects/bar/src/app/button/button.component.ts');
    const content = tree.readContent('/projects/bar/src/app/button/button.component.ts');
    expect(content).toMatchSnapshot();
  });

  it('should create an input primitive', async () => {
    const options: AngularPrimitivesComponentSchema = {
      primitive: 'input',
      path: 'projects/bar/src/app/input',
    };

    const tree = await schematicRunner.runSchematic('primitive', options, appTree);
    expect(tree.files).toContain('/projects/bar/src/app/input/input.component.ts');
    const content = tree.readContent('/projects/bar/src/app/input/input.component.ts');
    expect(content).toMatchSnapshot();
  });

  it('should create an accordion primitive', async () => {
    const options: AngularPrimitivesComponentSchema = {
      primitive: 'accordion',
      path: 'projects/bar/src/app/accordion',
    };

    const tree = await schematicRunner.runSchematic('primitive', options, appTree);
    expect(tree.files).toContain('/projects/bar/src/app/accordion/accordion.component.ts');
    const content = tree.readContent('/projects/bar/src/app/accordion/accordion.component.ts');
    expect(content).toMatchSnapshot();
  });

  it('should use OnPush change detection by default', async () => {
    const options: AngularPrimitivesComponentSchema = {
      primitive: 'button',
      path: 'projects/bar/src/app/button',
    };

    const tree = await schematicRunner.runSchematic('primitive', options, appTree);
    const content = tree.readContent('/projects/bar/src/app/button/button.component.ts');
    expect(content).toContain('ChangeDetectionStrategy');
    expect(content).toContain('changeDetection: ChangeDetectionStrategy.OnPush');
  });

  it('should not use OnPush change detection when set to Default', async () => {
    const options: AngularPrimitivesComponentSchema = {
      primitive: 'button',
      path: 'projects/bar/src/app/button',
      changeDetection: 'Default',
    };

    const tree = await schematicRunner.runSchematic('primitive', options, appTree);
    const content = tree.readContent('/projects/bar/src/app/button/button.component.ts');
    expect(content).not.toContain('ChangeDetectionStrategy');
    expect(content).not.toContain('changeDetection');
  });

  it('should respect changeDetection Default from @schematics/angular:component in angular.json', async () => {
    const angularJson = JSON.parse(appTree.readContent('/angular.json'));
    angularJson.schematics = {
      '@schematics/angular:component': {
        changeDetection: 'Default',
      },
    };
    appTree.overwrite('/angular.json', JSON.stringify(angularJson));

    const options: AngularPrimitivesComponentSchema = {
      primitive: 'button',
      path: 'projects/bar/src/app/button',
    };

    const tree = await schematicRunner.runSchematic('primitive', options, appTree);
    const content = tree.readContent('/projects/bar/src/app/button/button.component.ts');
    expect(content).not.toContain('ChangeDetectionStrategy');
    expect(content).not.toContain('changeDetection');
  });

  describe('primitives split across several files', () => {
    // These are the only primitives whose parts import each other, so they are the only
    // ones where the generated file name and the generated class name have to line up.
    const cases = [
      { primitive: 'popover', part: 'popover-trigger', symbol: 'Popover' },
      { primitive: 'tabs', part: 'tabs', symbol: 'Tab' },
      { primitive: 'tooltip', part: 'tooltip-trigger', symbol: 'Tooltip' },
    ];

    for (const { primitive, part, symbol } of cases) {
      it(`should cross-reference the ${primitive} parts using the default suffixes`, async () => {
        const tree = await schematicRunner.runSchematic(
          'primitive',
          { primitive, path: `projects/bar/src/app/${primitive}` },
          appTree,
        );

        const content = tree.readContent(`/projects/bar/src/app/${primitive}/${part}.component.ts`);

        expect(content).toContain(`import { ${symbol}Component }`);
        expect(content).toContain(`from './${symbol.toLowerCase()}.component'`);
      });

      it(`should cross-reference the ${primitive} parts with no file suffix`, async () => {
        const tree = await schematicRunner.runSchematic(
          'primitive',
          { primitive, path: `projects/bar/src/app/${primitive}`, fileSuffix: '' },
          appTree,
        );

        const content = tree.readContent(`/projects/bar/src/app/${primitive}/${part}.ts`);

        // an absent file suffix must not leave a trailing dot on the import path
        expect(content).toContain(`from './${symbol.toLowerCase()}'`);
      });
    }

    it('should dasherize a camelCase file suffix in the import path', async () => {
      const tree = await schematicRunner.runSchematic(
        'primitive',
        { primitive: 'tabs', path: 'projects/bar/src/app/tabs', fileSuffix: 'myWidget' },
        appTree,
      );

      expect(tree.files).toContain('/projects/bar/src/app/tabs/tabs.my-widget.ts');

      const content = tree.readContent('/projects/bar/src/app/tabs/tabs.my-widget.ts');
      expect(content).toContain("from './tab.my-widget'");
    });

    it('should reference the imported part at its usage sites, not just in the import', async () => {
      const tree = await schematicRunner.runSchematic(
        'primitive',
        { primitive: 'tabs', path: 'projects/bar/src/app/tabs' },
        appTree,
      );

      const content = tree.readContent('/projects/bar/src/app/tabs/tabs.component.ts');
      expect(content).toContain('contentChildren(TabComponent)');
    });
  });

  it('should generate a rating reusable component', async () => {
    const options: AngularPrimitivesComponentSchema = {
      primitive: 'rating',
      path: 'projects/bar/src/app/rating',
      fileSuffix: '',
    };

    const tree = await schematicRunner.runSchematic('primitive', options, appTree);
    expect(tree.files).toContain('/projects/bar/src/app/rating/rating.ts');

    const content = tree.readContent('/projects/bar/src/app/rating/rating.ts');
    expect(content).toContain("selector: 'app-rating'");
    expect(content).toContain('directive: NgpRating');
    expect(content).toContain('ngpRatingItem');
    expect(content).toContain('implements ControlValueAccessor');
    expect(content).toContain('provideValueAccessor(RatingComponent)');
  });

  describe('styles option', () => {
    // accordion-item is the busiest decorator (hostDirectives, providers, template) and its
    // styles block — carrying @keyframes and @media — sits last, so removing it exercises the
    // trailing-comma case.
    const itemPath = '/projects/bar/src/app/accordion/accordion-item.component.ts';

    it('keeps the full styles by default', async () => {
      const tree = await schematicRunner.runSchematic(
        'primitive',
        { primitive: 'accordion', path: 'projects/bar/src/app/accordion' },
        appTree,
      );

      const content = tree.readContent(itemPath);
      expect(content).toContain('styles:');
      expect(content).toContain('var(--ngp');
    });

    it('removes the styles block entirely when unstyled', async () => {
      const tree = await schematicRunner.runSchematic(
        'primitive',
        { primitive: 'accordion', path: 'projects/bar/src/app/accordion', styles: 'unstyled' },
        appTree,
      );

      const content = tree.readContent(itemPath);

      // the whole styles property and its contents are gone
      expect(content).not.toContain('styles:');
      expect(content).not.toContain('var(--ngp');
      expect(content).not.toContain('@keyframes');
      // the rest of the component is untouched
      expect(content).toContain('@Component({');
      expect(content).toContain('template:');
      expect(content).toContain('export class AccordionItemComponent');
    });

    it('treats the deprecated exampleStyles: false as unstyled', async () => {
      const unstyled = await schematicRunner.runSchematic(
        'primitive',
        { primitive: 'accordion', path: 'projects/bar/src/app/accordion', styles: 'unstyled' },
        appTree,
      );
      const deprecated = await schematicRunner.runSchematic(
        'primitive',
        { primitive: 'accordion', path: 'projects/bar/src/app/accordion', exampleStyles: false },
        appTree,
      );

      expect(deprecated.readContent(itemPath)).toEqual(unstyled.readContent(itemPath));
    });

    it('styles the elements with Tailwind classes when tailwind', async () => {
      const tree = await schematicRunner.runSchematic(
        'primitive',
        { primitive: 'accordion', path: 'projects/bar/src/app/tw-accordion', styles: 'tailwind' },
        appTree,
      );

      const content = tree.readContent(
        '/projects/bar/src/app/tw-accordion/accordion-item.component.ts',
      );

      // utility classes land on the elements and the host
      expect(content).toContain('class="flex pl-4 pr-4');
      expect(content).toMatch(/host: \{\n\s*class: 'block/);
      // only what Tailwind cannot express stays behind as CSS
      expect(content).toContain('@keyframes slideDown');
      expect(content).not.toMatch(/styles:[\s\S]*display: flex/);
      // the prefix and suffix placeholders were rendered as usual
      expect(content).toContain('export class AccordionItemComponent');
    });

    it('applies OnPush to the tailwind variant as well', async () => {
      const tree = await schematicRunner.runSchematic(
        'primitive',
        {
          primitive: 'accordion',
          path: 'projects/bar/src/app/tw-cd-accordion',
          styles: 'tailwind',
        },
        appTree,
      );

      expect(
        tree.readContent('/projects/bar/src/app/tw-cd-accordion/accordion-item.component.ts'),
      ).toContain('changeDetection: ChangeDetectionStrategy.OnPush');
    });
  });
});
