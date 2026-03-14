import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

/**
 * Extracts the sourceQueryPlugin transform logic for testing.
 * The plugin reads a file's source code and returns it as a default export string
 * when the module ID contains a `?source` query parameter.
 */
function sourceQueryTransform(code: string, id: string): string | undefined {
  if (id.includes('?source')) {
    const filePath = id.replace(/\?.*$/, '');
    const source = readFileSync(filePath).toString();
    return `export default \`${source.replace(/`/g, '\\`').replace(/\${/g, '\\${')}\`;`;
  }
  return undefined;
}

describe('sourceQueryPlugin', () => {
  let tempDir: string;
  let tempFile: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'source-query-test-'));
    tempFile = join(tempDir, 'example.ts');
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  it('should return source code as a default export when ?source query is present', () => {
    const sourceContent = `import { Component } from '@angular/core';

@Component({ selector: 'app-test', template: '<p>Test</p>' })
export default class TestExample {}`;

    writeFileSync(tempFile, sourceContent);

    const result = sourceQueryTransform('', `${tempFile}?source`);

    expect(result).toContain('export default `');
    expect(result).toContain("import { Component } from '@angular/core';");
    expect(result).toContain('export default class TestExample {}');
  });

  it('should not transform files without ?source query', () => {
    const result = sourceQueryTransform('const x = 1;', tempFile);

    expect(result).toBeUndefined();
  });

  it('should escape backticks in source code', () => {
    const sourceContent = 'const x = `template string`;';
    writeFileSync(tempFile, sourceContent);

    const result = sourceQueryTransform('', `${tempFile}?source`);

    expect(result).toContain('\\`template string\\`');
    expect(result).not.toContain('`template string`');
  });

  it('should escape template literal expressions in source code', () => {
    const sourceContent = 'const x = `Hello ${name}`;';
    writeFileSync(tempFile, sourceContent);

    const result = sourceQueryTransform('', `${tempFile}?source`);

    expect(result).toContain('\\${name}');
  });

  it('should strip all query parameters to resolve the file path', () => {
    const sourceContent = 'export default class Test {}';
    writeFileSync(tempFile, sourceContent);

    // Vite may append additional query params beyond ?source
    const result = sourceQueryTransform('', `${tempFile}?source&lang.ts`);

    expect(result).toContain('export default `');
    expect(result).toContain('export default class Test {}');
  });

  it('should handle the original ?source-only query format', () => {
    const sourceContent = 'export default class Test {}';
    writeFileSync(tempFile, sourceContent);

    const result = sourceQueryTransform('', `${tempFile}?source`);

    expect(result).toBeDefined();
    expect(result).toContain('export default class Test {}');
  });
});
