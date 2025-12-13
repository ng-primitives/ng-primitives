// This file loads primitives data from the generated files.
// Data is extracted at build time using the mcp-data-extraction executor.
import { readFileSync } from 'fs';
import { join } from 'path';

export interface PrimitiveDefinition {
  name: string;
  description: string;
  entryPoint: string;
  exports: string[];
  category: string;
  accessibility: string[];
  hasSecondaryEntryPoint: boolean;
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
  // Additional properties from API extraction (when available)
  apiData?: {
    selector?: string;
    exportAs?: string[];
    inputs?: Array<{
      name: string;
      type: string;
      description: string;
      isRequired: boolean;
      defaultValue?: string;
    }>;
    outputs?: Array<{
      name: string;
      type: string;
      description: string;
    }>;
  };
}

// Function to load primitives data from generated JSON
export function loadPrimitivesData(): PrimitiveDefinition[] {
  try {
    const dataPath = join(__dirname, 'generated', 'primitives-data.json');
    const data = readFileSync(dataPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Could not load primitives data:', error);
    return [];
  }
}

// Function to load API data from extracted JSON
export function loadApiData(): Record<string, any> {
  try {
    const apiPath = join(__dirname, 'generated', 'api-data.json');
    const data = readFileSync(apiPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.warn('Could not load API data:', error);
    return {};
  }
}

// Function to load reusable components data
export function loadReusableComponentsData(): any[] {
  try {
    const dataPath = join(__dirname, 'generated', 'reusable-components.json');
    const data = readFileSync(dataPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.warn('Could not load reusable components data:', error);
    return [];
  }
}

// Function to merge primitives with API data
export function getEnrichedPrimitivesRegistry(): PrimitiveDefinition[] {
  const primitives = loadPrimitivesData();
  const apiData = loadApiData();

  return primitives.map(primitive => {
    // Try to find API data for the main export
    const mainExport = primitive.exports[0];
    const extractedData = apiData[mainExport];

    if (extractedData) {
      return {
        ...primitive,
        apiData: {
          selector: extractedData.selector,
          exportAs: extractedData.exportAs,
          inputs: extractedData.inputs,
          outputs: extractedData.outputs,
        },
      };
    }

    return primitive;
  });
}

// Generate usage examples for primitives
export function generateUsageExample(primitive: PrimitiveDefinition): string {
  // Priority 1: Use reusable component if available
  if (primitive.reusableComponent?.code) {
    const importStatement = `import { ${primitive.exports.slice(0, 3).join(', ')}${primitive.exports.length > 3 ? ', ...' : ''} } from '${primitive.entryPoint}';`;
    return `${importStatement}\n\n// Reusable Component Implementation:\n\n${primitive.reusableComponent.code}`;
  }

  // Priority 2: Use extracted examples from documentation
  if (primitive.examples && primitive.examples.length > 0) {
    const firstExample = primitive.examples[0];
    const importStatement = `import { ${primitive.exports.slice(0, 3).join(', ')}${primitive.exports.length > 3 ? ', ...' : ''} } from '${primitive.entryPoint}';`;

    let exampleHeader = '';
    if (firstExample.description) {
      exampleHeader = `// ${firstExample.description}\n\n`;
    }

    return `${importStatement}\n\n${exampleHeader}${firstExample.code}`;
  }

  // Priority 3: Generate minimal usage based on exports
  const mainExport = primitive.exports.find(
    exp =>
      exp.startsWith('Ngp') &&
      !exp.includes('State') &&
      !exp.includes('Props') &&
      !exp.includes('Config'),
  );

  if (!mainExport) {
    return `import { ${primitive.exports.slice(0, 3).join(', ')}${primitive.exports.length > 3 ? ', ...' : ''} } from '${primitive.entryPoint}';\n\n// See documentation for usage details`;
  }

  // Generate selector from export name (e.g., NgpButton -> ngpButton)
  const selector = mainExport.charAt(0).toLowerCase() + mainExport.slice(1);

  return `import { ${mainExport} } from '${primitive.entryPoint}';\n\n// Basic usage:\n<element ${selector}>Content</element>`;
}
