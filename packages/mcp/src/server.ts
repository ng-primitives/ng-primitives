import { McpServer } from '@modelcontextprotocol/server';
import { registerTools } from './tools.js';

export function createServer(): McpServer {
  const server = new McpServer(
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

  registerTools(server);

  return server;
}
