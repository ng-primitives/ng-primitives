import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import {
  generateUsageExample,
  getEnrichedPrimitivesRegistry,
  loadReusableComponentsData,
  type PrimitiveDefinition,
} from './primitives-registry.js';

// Global registry cache
let PRIMITIVES_CACHE: PrimitiveDefinition[] | null = null;
let REUSABLE_COMPONENTS_CACHE: any[] | null = null;

function getPrimitivesRegistry(): PrimitiveDefinition[] {
  if (!PRIMITIVES_CACHE) {
    PRIMITIVES_CACHE = getEnrichedPrimitivesRegistry();
  }
  return PRIMITIVES_CACHE;
}

function getReusableComponents(): any[] {
  if (!REUSABLE_COMPONENTS_CACHE) {
    REUSABLE_COMPONENTS_CACHE = loadReusableComponentsData();
  }
  return REUSABLE_COMPONENTS_CACHE;
}

function getAvailableCategories(): string[] {
  const primitives = getPrimitivesRegistry();
  const categories = new Set(primitives.map((p: PrimitiveDefinition) => p.category));
  return Array.from(categories).sort();
}

/**
 * Register all MCP tools on the server
 */
export function registerTools(server: McpServer): void {
  server.registerTool(
    'list_primitives',
    {
      title: 'List Angular Primitives',
      description: 'List available Angular Primitives with optional filtering',
      inputSchema: {
        category: z.string().optional().describe('Filter primitives by category'),
        search: z.string().optional().describe('Search primitives by name or description'),
      },
    },
    async ({ category, search }: { category?: string; search?: string }) => {
      const allPrimitives = getPrimitivesRegistry();
      let filteredPrimitives = allPrimitives;

      if (category) {
        filteredPrimitives = filteredPrimitives.filter(
          (p: PrimitiveDefinition) => p.category === category,
        );
      }

      if (search) {
        const searchLower = search.toLowerCase();
        filteredPrimitives = filteredPrimitives.filter(
          (p: PrimitiveDefinition) =>
            p.name.toLowerCase().includes(searchLower) ||
            p.description.toLowerCase().includes(searchLower),
        );
      }

      const availableCategories = getAvailableCategories();

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                availableCategories,
                primitives: filteredPrimitives.map((p: PrimitiveDefinition) => ({
                  name: p.name,
                  description: p.description,
                  category: p.category,
                  entryPoint: p.entryPoint,
                })),
              },
              null,
              2,
            ),
          },
        ],
      };
    },
  );

  server.registerTool(
    'get_primitive_details',
    {
      title: 'Get Primitive Details',
      description: 'Get detailed information about a specific primitive',
      inputSchema: {
        name: z.string().describe('The name of the primitive'),
      },
    },
    async ({ name }: { name: string }) => {
      const allPrimitives = getPrimitivesRegistry();
      const primitive = allPrimitives.find((p: PrimitiveDefinition) => p.name === name);

      if (!primitive) {
        return {
          content: [
            {
              type: 'text',
              text: `Primitive "${name}" not found. Available primitives: ${allPrimitives.map((p: PrimitiveDefinition) => p.name).join(', ')}`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                ...primitive,
                installCommand: `npm install ng-primitives`,
                importStatement: `import { ${primitive.exports.join(', ')} } from '${primitive.entryPoint}';`,
                usageExample: generateUsageExample(primitive),
                ...(primitive.apiData && {
                  apiDetails: {
                    selector: primitive.apiData.selector,
                    exportAs: primitive.apiData.exportAs,
                    inputs: primitive.apiData.inputs,
                    outputs: primitive.apiData.outputs,
                  },
                }),
              },
              null,
              2,
            ),
          },
        ],
      };
    },
  );

  server.registerTool(
    'get_install_command',
    {
      title: 'Get Install Command',
      description: 'Generate npm install command for Angular Primitives',
      inputSchema: {
        primitives: z.array(z.string()).describe('Array of primitive names to install'),
      },
    },
    async ({ primitives }: { primitives: string[] }) => {
      const allPrimitives = getPrimitivesRegistry();

      const invalidPrimitives = primitives.filter(
        (name: string) => !allPrimitives.find((p: PrimitiveDefinition) => p.name === name),
      );

      if (invalidPrimitives.length > 0) {
        return {
          content: [
            {
              type: 'text',
              text: `Invalid primitives: ${invalidPrimitives.join(', ')}. Available: ${allPrimitives.map((p: PrimitiveDefinition) => p.name).join(', ')}`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                installCommand: 'npm install ng-primitives',
                note: 'All primitives are included in the main ng-primitives package',
                selectedPrimitives: primitives.map((name: string) => {
                  const primitive = allPrimitives.find(
                    (p: PrimitiveDefinition) => p.name === name,
                  )!;
                  return {
                    name: primitive.name,
                    entryPoint: primitive.entryPoint,
                    exports: primitive.exports,
                  };
                }),
              },
              null,
              2,
            ),
          },
        ],
      };
    },
  );

  server.registerTool(
    'list_reusable_components',
    {
      title: 'List Reusable Components',
      description:
        'List available reusable component implementations with variants and size support information',
      inputSchema: {},
    },
    async () => {
      const components = getReusableComponents();

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              components.map((c: any) => ({
                name: c.name,
                primitive: c.primitive,
                hasVariants: c.hasVariants,
                hasSizes: c.hasSizes,
              })),
              null,
              2,
            ),
          },
        ],
      };
    },
  );

  server.registerTool(
    'get_reusable_component',
    {
      title: 'Get Reusable Component Code',
      description: 'Get the full source code for a reusable component implementation',
      inputSchema: {
        name: z.string().describe('The name of the reusable component'),
      },
    },
    async ({ name }: { name: string }) => {
      const components = getReusableComponents();
      const component = components.find((c: any) => c.name === name);

      if (!component) {
        return {
          content: [
            {
              type: 'text',
              text: `Reusable component "${name}" not found. Available components: ${components.map((c: any) => c.name).join(', ')}`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                name: component.name,
                primitive: component.primitive,
                hasVariants: component.hasVariants,
                hasSizes: component.hasSizes,
                code: component.code,
              },
              null,
              2,
            ),
          },
        ],
      };
    },
  );

  server.registerTool(
    'get_setup_guide',
    {
      title: 'Get Setup Guide',
      description: 'Get setup instructions for Angular Primitives',
      inputSchema: {},
    },
    async () => {
      const setupGuide = {
        title: 'Angular Primitives Setup Guide',
        steps: [
          {
            step: 1,
            title: 'Install the package',
            command: 'npm install ng-primitives',
            description: 'Install the main ng-primitives package which contains all primitives',
          },
          {
            step: 2,
            title: 'Import primitives',
            description: 'Import the primitives you need from their respective entry points',
            example: "import { NgpButton } from 'ng-primitives/button';",
          },
          {
            step: 3,
            title: 'Add to component imports',
            description: 'Add the primitive directives to your component imports array',
            example: `@Component({
  imports: [NgpButton],
  template: '<button ngpButton>Click me</button>'
})`,
          },
          {
            step: 4,
            title: 'Style your components',
            description:
              'ng-primitives provides unstyled, accessible components. Add your own CSS or use with your preferred styling solution (Tailwind, CSS-in-JS, etc.)',
            example: `[ngpButton] {
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  background: blue;
  color: white;
}`,
          },
        ],
        resources: [
          'Documentation: https://angularprimitives.com',
          'GitHub: https://github.com/ng-primitives/ng-primitives',
        ],
      };

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(setupGuide, null, 2),
          },
        ],
      };
    },
  );
}

/**
 * Clear the cache (useful for testing)
 */
export function clearCache(): void {
  PRIMITIVES_CACHE = null;
  REUSABLE_COMPONENTS_CACHE = null;
}
