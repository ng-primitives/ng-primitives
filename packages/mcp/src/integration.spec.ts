import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { CallToolResultSchema, ListToolsResultSchema } from '@modelcontextprotocol/sdk/types.js';
import { clearCache, registerTools } from './tools.js';

/**
 * Integration tests for ngp-mcp server using InMemoryTransport
 * These tests verify the actual MCP protocol communication without mocking
 */
describe('ngp-mcp Integration Tests', () => {
  let server: McpServer;
  let client: Client;
  let clientTransport: InMemoryTransport;
  let serverTransport: InMemoryTransport;

  beforeEach(async () => {
    // Create linked transports for in-process communication
    [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

    // Create server with same configuration as production
    server = new McpServer(
      {
        name: 'ngp-mcp',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      },
    );

    // Register all tools using the actual implementation
    registerTools(server);

    // Create client
    client = new Client({
      name: 'test-client',
      version: '1.0.0',
    });

    // Connect both
    await Promise.all([client.connect(clientTransport), server.connect(serverTransport)]);
  });

  afterEach(async () => {
    await client.close();
    await server.close();
    clearCache();
  });

  describe('list_primitives tool', () => {
    it('should list all available tools', async () => {
      const result = await client.request({ method: 'tools/list' }, ListToolsResultSchema);

      expect(result.tools).toBeDefined();
      expect(result.tools.length).toBe(6);

      const toolNames = result.tools.map(t => t.name);
      expect(toolNames).toContain('list_primitives');
      expect(toolNames).toContain('get_primitive_details');
      expect(toolNames).toContain('get_install_command');
      expect(toolNames).toContain('list_reusable_components');
      expect(toolNames).toContain('get_reusable_component');
      expect(toolNames).toContain('get_setup_guide');
    });

    it('should return all primitives when called with no arguments', async () => {
      const result = await client.callTool(
        {
          name: 'list_primitives',
          arguments: {},
        },
        CallToolResultSchema,
      );

      expect(result.content).toHaveLength(1);
      expect((result as any).content[0].type).toBe('text');

      const data = JSON.parse((result as any).content[0].text);
      expect(data.primitives).toBeDefined();
      expect(data.availableCategories).toBeDefined();
      expect(Array.isArray(data.primitives)).toBe(true);
      expect(data.primitives.length).toBeGreaterThan(0);
    });

    it('should filter primitives by category', async () => {
      const result = await client.callTool(
        {
          name: 'list_primitives',
          arguments: { category: 'form' },
        },
        CallToolResultSchema,
      );

      const data = JSON.parse((result as any).content[0].text);
      expect(data.primitives.every((p: any) => p.category === 'form')).toBe(true);
    });

    it('should filter primitives by search term', async () => {
      const result = await client.callTool(
        {
          name: 'list_primitives',
          arguments: { search: 'button' },
        },
        CallToolResultSchema,
      );

      const data = JSON.parse((result as any).content[0].text);
      expect(
        data.primitives.every(
          (p: any) =>
            p.name.toLowerCase().includes('button') ||
            p.description.toLowerCase().includes('button'),
        ),
      ).toBe(true);
    });
  });

  describe('get_primitive_details tool', () => {
    it('should return detailed information for a valid primitive', async () => {
      const result = await client.callTool(
        {
          name: 'get_primitive_details',
          arguments: { name: 'button' },
        },
        CallToolResultSchema,
      );

      const data = JSON.parse((result as any).content[0].text);
      expect(data.name).toBe('button');
      expect(data.description).toBeDefined();
      expect(data.entryPoint).toBe('ng-primitives/button');
      expect(data.exports).toBeDefined();
      expect(data.installCommand).toBe('npm install ng-primitives');
      expect(data.importStatement).toContain('ng-primitives/button');
      expect(data.usageExample).toBeDefined();
    });

    it('should include API details when available', async () => {
      const result = await client.callTool(
        {
          name: 'get_primitive_details',
          arguments: { name: 'button' },
        },
        CallToolResultSchema,
      );

      const data = JSON.parse((result as any).content[0].text);
      // API details may or may not be present depending on whether api-extraction ran
      if (data.apiDetails) {
        expect(data.apiDetails.selector).toBeDefined();
      }
    });

    it('should return error message for non-existent primitive', async () => {
      const result = await client.callTool(
        {
          name: 'get_primitive_details',
          arguments: { name: 'nonexistent' },
        },
        CallToolResultSchema,
      );

      expect((result as any).content[0].text).toContain('not found');
      expect((result as any).content[0].text).toContain('Available primitives');
    });
  });

  describe('get_install_command tool', () => {
    it('should generate install command for valid primitives', async () => {
      const result = await client.callTool(
        {
          name: 'get_install_command',
          arguments: { primitives: ['button', 'checkbox'] },
        },
        CallToolResultSchema,
      );

      const data = JSON.parse((result as any).content[0].text);
      expect(data.installCommand).toBe('npm install ng-primitives');
      expect(data.selectedPrimitives).toHaveLength(2);
      expect(data.selectedPrimitives[0].name).toBe('button');
      expect(data.selectedPrimitives[0].entryPoint).toBe('ng-primitives/button');
    });

    it('should report invalid primitive names', async () => {
      const result = await client.callTool(
        {
          name: 'get_install_command',
          arguments: { primitives: ['button', 'invalid', 'nonexistent'] },
        },
        CallToolResultSchema,
      );

      expect((result as any).content[0].text).toContain('Invalid primitives');
      expect((result as any).content[0].text).toContain('invalid');
      expect((result as any).content[0].text).toContain('nonexistent');
    });
  });

  describe('list_reusable_components tool', () => {
    it('should list all reusable components', async () => {
      const result = await client.callTool(
        {
          name: 'list_reusable_components',
          arguments: {},
        },
        CallToolResultSchema,
      );

      const components = JSON.parse((result as any).content[0].text);
      expect(Array.isArray(components)).toBe(true);
      expect(components.length).toBeGreaterThan(0);

      const component = components[0];
      expect(component.name).toBeDefined();
      expect(component.primitive).toBeDefined();
      expect(typeof component.hasVariants).toBe('boolean');
      expect(typeof component.hasSizes).toBe('boolean');
    });
  });

  describe('get_reusable_component tool', () => {
    it('should return component code for valid component', async () => {
      // First, get list of components
      const listResult = await client.callTool(
        {
          name: 'list_reusable_components',
          arguments: {},
        },
        CallToolResultSchema,
      );

      const components = JSON.parse((listResult as any).content[0].text);
      const firstComponent = components[0];

      // Then get the specific component
      const result = await client.callTool(
        {
          name: 'get_reusable_component',
          arguments: { name: firstComponent.name },
        },
        CallToolResultSchema,
      );

      const data = JSON.parse((result as any).content[0].text);
      expect(data.name).toBe(firstComponent.name);
      expect(data.code).toBeDefined();
      expect(data.code.length).toBeGreaterThan(0);
    });

    it('should return error for non-existent component', async () => {
      const result = await client.callTool(
        {
          name: 'get_reusable_component',
          arguments: { name: 'nonexistent' },
        },
        CallToolResultSchema,
      );

      expect((result as any).content[0].text).toContain('not found');
      expect((result as any).content[0].text).toContain('Available components');
    });
  });

  describe('get_setup_guide tool', () => {
    it('should return setup guide with steps and resources', async () => {
      const result = await client.callTool(
        {
          name: 'get_setup_guide',
          arguments: {},
        },
        CallToolResultSchema,
      );

      const guide = JSON.parse((result as any).content[0].text);
      expect(guide.title).toBe('Angular Primitives Setup Guide');
      expect(Array.isArray(guide.steps)).toBe(true);
      expect(guide.steps.length).toBeGreaterThan(0);

      const firstStep = guide.steps[0];
      expect(firstStep.step).toBe(1);
      expect(firstStep.title).toBeDefined();
      expect(firstStep.command || firstStep.example).toBeDefined();

      expect(Array.isArray(guide.resources)).toBe(true);
      expect(guide.resources.length).toBeGreaterThan(0);
      expect(guide.resources.some((r: string) => r.includes('angularprimitives.com'))).toBe(true);
    });
  });

  describe('MCP protocol compliance', () => {
    it('should support server capabilities', async () => {
      const capabilities = client.getServerCapabilities();
      expect(capabilities).toBeDefined();
      expect(capabilities?.tools).toBeDefined();
    });

    it('should handle multiple sequential tool calls', async () => {
      // Call list_primitives
      const listResult = await client.callTool(
        {
          name: 'list_primitives',
          arguments: {},
        },
        CallToolResultSchema,
      );
      expect(listResult.content).toBeDefined();

      // Call get_setup_guide
      const guideResult = await client.callTool(
        {
          name: 'get_setup_guide',
          arguments: {},
        },
        CallToolResultSchema,
      );
      expect(guideResult.content).toBeDefined();

      // Call get_primitive_details
      const detailsResult = await client.callTool(
        {
          name: 'get_primitive_details',
          arguments: { name: 'button' },
        },
        CallToolResultSchema,
      );
      expect(detailsResult.content).toBeDefined();
    });
  });
});
