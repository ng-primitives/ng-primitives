import { logger, PromiseExecutor } from '@nx/devkit';
import { readdirSync, readFileSync, statSync, writeFileSync } from 'fs';
import { ensureDirSync } from 'fs-extra';
import * as path from 'path';
import { McpDataExtractionExecutorSchema } from './schema';

const runExecutor: PromiseExecutor<McpDataExtractionExecutorSchema> = async (options, context) => {
  const workspaceRoot = context?.root || process.cwd();

  const primitivesPath = path.resolve(
    workspaceRoot,
    options.primitivesPath || 'packages/ng-primitives',
  );
  const docsPath = path.resolve(
    workspaceRoot,
    options.docsPath || 'apps/documentation/src/app/pages/(documentation)',
  );
  const componentsPath = path.resolve(
    workspaceRoot,
    options.componentsPath || 'apps/components/src/app/pages/reusable-components',
  );
  const outputPath = path.resolve(
    workspaceRoot,
    options.outputPath || 'packages/mcp/src/generated',
  );

  logger.info('Starting MCP data extraction...');

  try {
    // Ensure output directory exists
    ensureDirSync(outputPath);

    // Extract primitives data
    const primitives = extractPrimitives(primitivesPath);
    logger.info(`Extracted ${primitives.length} primitives`);

    // Extract documentation and examples
    const docsData = extractDocumentation(docsPath, primitives);
    logger.info('Extracted documentation');

    // Extract reusable components
    const reusableComponents = extractReusableComponents(componentsPath);
    logger.info(`Extracted ${reusableComponents.length} reusable components`);

    // Merge all data
    const enrichedPrimitives = enrichPrimitivesWithData(primitives, docsData, reusableComponents);

    // Write output files
    writeFileSync(
      path.join(outputPath, 'primitives-data.json'),
      JSON.stringify(enrichedPrimitives, null, 2),
    );

    writeFileSync(
      path.join(outputPath, 'reusable-components.json'),
      JSON.stringify(reusableComponents, null, 2),
    );

    // Generate TypeScript interface file
    generateTypeScriptInterface(outputPath);

    logger.info(`✅ MCP data extraction completed successfully`);
    logger.info(`   Output written to: ${outputPath}`);

    return { success: true };
  } catch (error) {
    logger.error(`❌ MCP data extraction failed: ${error}`);
    return { success: false };
  }
};

export default runExecutor;

interface PrimitiveInfo {
  name: string;
  entryPoint: string;
  exports: string[];
  hasSecondaryEntryPoint: boolean;
  category?: string;
  description?: string;
  accessibility?: string[];
  examples?: ExampleInfo[];
  reusableComponent?: {
    code: string;
    hasVariants: boolean;
    hasSizes: boolean;
  };
}

interface ExampleInfo {
  name: string;
  code: string;
  description?: string;
}

interface ReusableComponent {
  name: string;
  code: string;
  primitive: string;
  hasVariants: boolean;
  hasSizes: boolean;
}

/**
 * Extract primitives from the ng-primitives package structure
 */
function extractPrimitives(primitivesPath: string): PrimitiveInfo[] {
  const primitives: PrimitiveInfo[] = [];

  // Directories to exclude
  const excludeDirs = [
    'src',
    'schematics',
    'internal',
    'common',
    'utils',
    'example-theme',
    'node_modules',
  ];

  const items = readdirSync(primitivesPath);

  for (const item of items) {
    const itemPath = path.join(primitivesPath, item);

    // Skip if not a directory or is excluded
    if (!statSync(itemPath).isDirectory() || excludeDirs.includes(item)) {
      continue;
    }

    // Check if it has an index.ts (secondary entry point)
    const indexPath = path.join(itemPath, 'src', 'index.ts');
    if (!require('fs').existsSync(indexPath)) {
      continue;
    }

    try {
      const indexContent = readFileSync(indexPath, 'utf-8');
      const exports = extractExportsFromIndex(indexContent);

      primitives.push({
        name: item,
        entryPoint: `ng-primitives/${item}`,
        exports,
        hasSecondaryEntryPoint: true,
        category: inferCategory(item),
      });
    } catch (error) {
      logger.warn(`Failed to process primitive: ${item} - ${error}`);
    }
  }

  return primitives.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Extract export statements from index.ts files
 */
function extractExportsFromIndex(content: string): string[] {
  const exports: string[] = [];

  // Match export statements like: export { NgpButton, NgpButtonState } from './button/button';
  const exportRegex = /export\s+{\s*([^}]+)\s*}\s+from/g;
  const matches = content.matchAll(exportRegex);

  for (const match of matches) {
    const exportList = match[1]
      .split(',')
      .map(e => e.trim())
      .filter(e => e.length > 0); // Filter out empty strings
    exports.push(...exportList);
  }

  // Match direct exports like: export * from './something';
  const exportAllRegex = /export\s+\*\s+from\s+['"]([^'"]+)['"]/g;
  const exportAllMatches = content.matchAll(exportAllRegex);

  for (const match of exportAllMatches) {
    // Note: We can't easily determine what's exported from export *
    // This would require parsing those files too
    logger.info(`Found re-export from ${match[1]}, may need manual review`);
  }

  return exports.filter(e => e.length > 0); // Final filter for safety
}

/**
 * Infer category from primitive name
 */
function inferCategory(primitiveName: string): string {
  const categories = {
    form: [
      'button',
      'checkbox',
      'input',
      'textarea',
      'select',
      'radio',
      'switch',
      'slider',
      'combobox',
      'listbox',
      'file-upload',
      'input-otp',
      'search',
      'toggle',
      'toggle-group',
      'form-field',
    ],
    navigation: ['tabs', 'menu', 'breadcrumbs', 'pagination', 'toolbar'],
    feedback: ['dialog', 'tooltip', 'popover', 'toast', 'progress', 'meter'],
    layout: ['accordion', 'separator', 'portal'],
    data: ['avatar'],
    utility: ['focus-trap', 'roving-focus', 'resize', 'autofill', 'interactions', 'a11y'],
    'date-time': ['date-picker', 'date-time', 'date-time-luxon'],
  };

  for (const [category, primitives] of Object.entries(categories)) {
    if (primitives.includes(primitiveName)) {
      return category;
    }
  }

  return 'utility';
}

/**
 * Extract documentation from markdown files
 */
function extractDocumentation(docsPath: string, primitives: PrimitiveInfo[]): Map<string, any> {
  const docsData = new Map<string, any>();

  const primitivesDocsPath = path.join(docsPath, 'primitives');

  if (!require('fs').existsSync(primitivesDocsPath)) {
    logger.warn(`Documentation path not found: ${primitivesDocsPath}`);
    return docsData;
  }

  for (const primitive of primitives) {
    const docPath = path.join(primitivesDocsPath, `${primitive.name}.md`);

    if (!require('fs').existsSync(docPath)) {
      continue;
    }

    try {
      const content = readFileSync(docPath, 'utf-8');

      // Extract description (first paragraph after title)
      const descriptionMatch = content.match(/^#\s+[^\n]+\n\n([^\n]+)/m);
      const description = descriptionMatch ? descriptionMatch[1] : '';

      // Extract accessibility features from the docs
      const accessibility = extractAccessibilityFeatures(content);

      // Extract example references
      const examples = extractExampleReferences(content);

      docsData.set(primitive.name, {
        description,
        accessibility,
        examples,
      });
    } catch (error) {
      logger.warn(`Failed to process docs for: ${primitive.name} - ${error}`);
    }
  }

  return docsData;
}

/**
 * Extract accessibility features from documentation
 */
function extractAccessibilityFeatures(content: string): string[] {
  const features: string[] = [];

  // Look for common accessibility patterns in the docs
  const patterns = [
    /ARIA\s+[\w-]+/gi,
    /keyboard\s+navigation/gi,
    /focus\s+(?:management|trap)/gi,
    /screen\s+reader/gi,
  ];

  for (const pattern of patterns) {
    const matches = content.match(pattern);
    if (matches) {
      features.push(...matches.map(m => m.trim()));
    }
  }

  return [...new Set(features)]; // Remove duplicates
}

/**
 * Extract example references from documentation
 */
function extractExampleReferences(content: string): ExampleInfo[] {
  const examples: ExampleInfo[] = [];

  // Extract code blocks from markdown
  const codeBlockRegex = /```(?:html|ts|typescript)\n([\s\S]*?)```/g;
  const matches = content.matchAll(codeBlockRegex);

  let exampleIndex = 0;
  for (const match of matches) {
    const code = match[1].trim();

    // Skip if it's just an import statement
    if (code.startsWith('import {') && code.split('\n').length <= 2) {
      continue;
    }

    examples.push({
      name: `example-${exampleIndex}`,
      code,
      description: extractExampleDescription(content, match.index || 0),
    });

    exampleIndex++;
  }

  return examples;
}

/**
 * Extract description for an example based on the heading before it
 */
function extractExampleDescription(content: string, codePosition: number): string | undefined {
  // Get content before the code block
  const contentBefore = content.substring(0, codePosition);

  // Look for the last heading (## or ###) before this code block
  const headingMatches = Array.from(contentBefore.matchAll(/^###?\s+(.+)$/gm));

  if (headingMatches.length > 0) {
    const lastHeading = headingMatches[headingMatches.length - 1];
    return lastHeading[1].trim();
  }

  return undefined;
} /**
 * Extract reusable components from the components app
 */
function extractReusableComponents(componentsPath: string): ReusableComponent[] {
  const components: ReusableComponent[] = [];

  if (!require('fs').existsSync(componentsPath)) {
    logger.warn(`Components path not found: ${componentsPath}`);
    return components;
  }

  const items = readdirSync(componentsPath);

  for (const item of items) {
    const itemPath = path.join(componentsPath, item);

    if (!statSync(itemPath).isDirectory()) {
      continue;
    }

    // Look for .ts file (not .page.ts)
    const files = readdirSync(itemPath);
    const componentFile = files.find(
      f => f.endsWith('.ts') && !f.endsWith('.page.ts') && !f.endsWith('.spec.ts'),
    );

    if (!componentFile) {
      continue;
    }

    try {
      const componentPath = path.join(itemPath, componentFile);
      const code = readFileSync(componentPath, 'utf-8');

      // Detect variants and sizes
      const hasVariants = /variant/i.test(code);
      const hasSizes = /size/i.test(code);

      components.push({
        name: item,
        code,
        primitive: item,
        hasVariants,
        hasSizes,
      });
    } catch (error) {
      logger.warn(`Failed to process component: ${item} - ${error}`);
    }
  }

  return components;
}

/**
 * Enrich primitives with documentation and reusable component data
 */
function enrichPrimitivesWithData(
  primitives: PrimitiveInfo[],
  docsData: Map<string, any>,
  reusableComponents: ReusableComponent[],
): PrimitiveInfo[] {
  return primitives.map(primitive => {
    const docs = docsData.get(primitive.name);
    const component = reusableComponents.find(c => c.primitive === primitive.name);

    return {
      ...primitive,
      description: docs?.description || `${primitive.name} primitive component`,
      accessibility: docs?.accessibility || [],
      examples: docs?.examples || [],
      reusableComponent: component
        ? {
            code: component.code,
            hasVariants: component.hasVariants,
            hasSizes: component.hasSizes,
          }
        : undefined,
    };
  });
}

/**
 * Generate TypeScript interface file for type safety
 */
function generateTypeScriptInterface(outputPath: string): void {
  const interfaceContent = `// This file is auto-generated. Do not edit manually.

export interface PrimitiveDefinition {
  name: string;
  entryPoint: string;
  exports: string[];
  hasSecondaryEntryPoint: boolean;
  category: string;
  description: string;
  accessibility: string[];
  examples?: Array<{
    name: string;
    code: string;
    description?: string;
  }>;
  reusableComponent?: {
    code: string;
    hasVariants: boolean;
    hasSizes: boolean;
  };
}

export interface ReusableComponentDefinition {
  name: string;
  code: string;
  primitive: string;
  hasVariants: boolean;
  hasSizes: boolean;
}
`;

  writeFileSync(path.join(outputPath, 'types.ts'), interfaceContent);
}
