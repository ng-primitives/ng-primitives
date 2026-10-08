import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { performCompilation, readConfiguration } from '@angular/compiler-cli';
import { Schema as ApplicationOptions } from '@schematics/angular/application/schema';
import { Schema as WorkspaceOptions } from '@schematics/angular/workspace/schema';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

/**
 * Every primitive the schematic can generate must produce code that actually compiles.
 *
 * Nothing else in the repo checks this: the templates are generated build output that
 * Prettier skips (`inferredParser: null` for `.template`), and the schematic's other
 * tests assert on strings rather than compiling anything.
 */
describe('generated primitives compile', () => {
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

  // Read at runtime rather than importing, so the gate covers the schema that ships.
  const schemaPath = resolve(fileURLToPath(new URL('./schema.json', import.meta.url)));
  const primitives: string[] = JSON.parse(readFileSync(schemaPath, 'utf-8')).properties.primitive
    .enum;

  /**
   * The generated files have to live inside the repo: they import `@angular/core`,
   * `@ng-icons/*` and friends, which resolve by walking up to the workspace
   * `node_modules`. A directory under the OS temp dir would not resolve them.
   */
  let sandbox: string;
  let appTree: UnitTestTree;

  /** Absolute path of every generated file, by primitive. */
  const generated = new Map<string, string[]>();

  /** Files that do not parse, by absolute path. Kept out of the type-check program. */
  const unparseable = new Map<string, string[]>();

  beforeAll(async () => {
    mkdirSync(join(workspaceRoot, 'tmp'), { recursive: true });
    sandbox = mkdtempSync(join(workspaceRoot, 'tmp', 'schematics-compile-'));

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

    for (const primitive of primitives) {
      const tree = await schematicRunner.runSchematic(
        'primitive',
        { primitive, path: `projects/bar/src/app/${primitive}` },
        appTree,
      );

      const files = tree.files.filter(file => file.includes(`/app/${primitive}/`));
      const written: string[] = [];

      for (const file of files) {
        const target = join(sandbox, primitive, file.split('/').pop()!);
        mkdirSync(dirname(target), { recursive: true });
        writeFileSync(target, tree.readContent(file));
        written.push(target);
      }

      generated.set(primitive, written);
    }

    for (const file of [...generated.values()].flat()) {
      const source = ts.createSourceFile(
        file,
        readFileSync(file, 'utf-8'),
        ts.ScriptTarget.Latest,
        true,
      );
      // `parseDiagnostics` is internal, but it is the only way to separate a parse
      // failure from a semantic one before handing the file to the compiler.
      const diagnostics = (source as unknown as { parseDiagnostics?: ts.Diagnostic[] })
        .parseDiagnostics;

      if (diagnostics?.length) {
        unparseable.set(file, diagnostics.map(describeDiagnostic));
      }
    }

    // A tsconfig that reuses the workspace path mappings, so `ng-primitives/*` resolves
    // to source rather than to a build artefact that may not exist yet.
    //
    // Unparseable files are excluded on purpose: `performCompilation` gives up on the
    // first syntactic error, so leaving one in would hide every other diagnostic. They
    // are reported by the parse test instead.
    writeFileSync(
      join(sandbox, 'tsconfig.json'),
      JSON.stringify({
        extends: join(workspaceRoot, 'tsconfig.base.json'),
        compilerOptions: { baseUrl: workspaceRoot, noEmit: true, strict: true, types: [] },
        angularCompilerOptions: { strictTemplates: true, strictInjectionParameters: true },
        files: [...generated.values()].flat().filter(file => !unparseable.has(file)),
      }),
    );
  }, 120_000);

  afterAll(() => rmSync(sandbox, { recursive: true, force: true }));

  /**
   * Parsing is asserted on its own because `performCompilation` bails out on the first
   * syntactic error, which would mask every semantic and template diagnostic behind it.
   */
  it('produces files that parse', () => {
    expect([...unparseable.values()].flat()).toEqual([]);
  });

  it('produces files that type-check', () => {
    const config = readConfiguration(join(sandbox, 'tsconfig.json'));
    const { diagnostics } = performCompilation({
      rootNames: config.rootNames,
      options: { ...config.options, noEmit: true },
    });

    const failures = diagnostics
      .filter(diagnostic => diagnostic.category === ts.DiagnosticCategory.Error)
      .map(describeDiagnostic);

    expect(failures).toEqual([]);
  }, 60_000);

  /**
   * `--styles unstyled` removes the `styles` property from the decorator — a structural edit
   * that must leave every primitive syntactically valid, whatever shape its decorator has.
   */
  it('produces files that parse when unstyled', async () => {
    const failures: string[] = [];

    for (const primitive of primitives) {
      // a dedicated path per primitive, so this never collides with the default-styled
      // components the beforeAll already generated into `app/<primitive>`
      const dir = `projects/bar/src/app/unstyled-${primitive}`;
      const tree = await schematicRunner.runSchematic(
        'primitive',
        { primitive, path: dir, styles: 'unstyled' },
        appTree,
      );

      for (const file of tree.files.filter(file => file.includes(`/unstyled-${primitive}/`))) {
        const content = tree.readContent(file);
        expect(content, `${file.split('/').pop()} should have no styles block`).not.toContain(
          'styles:',
        );

        const source = ts.createSourceFile(file, content, ts.ScriptTarget.Latest, true);
        const diagnostics = (source as unknown as { parseDiagnostics?: ts.Diagnostic[] })
          .parseDiagnostics;

        if (diagnostics?.length) {
          failures.push(...diagnostics.map(describeDiagnostic));
        }
      }
    }

    expect(failures).toEqual([]);
  }, 60_000);

  /**
   * `--styles tailwind` swaps in the pre-generated template set with utility classes on the
   * elements — every primitive must still come out syntactically valid.
   */
  it('produces files that parse when tailwind', async () => {
    const failures: string[] = [];

    for (const primitive of primitives) {
      const dir = `projects/bar/src/app/tailwind-${primitive}`;
      const tree = await schematicRunner.runSchematic(
        'primitive',
        { primitive, path: dir, styles: 'tailwind' },
        appTree,
      );

      for (const file of tree.files.filter(file => file.includes(`/tailwind-${primitive}/`))) {
        const content = tree.readContent(file);

        const source = ts.createSourceFile(file, content, ts.ScriptTarget.Latest, true);
        const diagnostics = (source as unknown as { parseDiagnostics?: ts.Diagnostic[] })
          .parseDiagnostics;

        if (diagnostics?.length) {
          failures.push(...diagnostics.map(describeDiagnostic));
        }
      }
    }

    expect(failures).toEqual([]);
  }, 60_000);

  function describeDiagnostic(diagnostic: ts.Diagnostic): string {
    const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, ' ');

    if (!diagnostic.file || diagnostic.start === undefined) {
      return `TS${diagnostic.code}: ${message}`;
    }

    const { line } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
    const name = diagnostic.file.fileName.split('/').slice(-2).join('/');
    return `${name}:${line + 1} TS${diagnostic.code}: ${message}`;
  }
});
