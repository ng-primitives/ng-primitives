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
});
