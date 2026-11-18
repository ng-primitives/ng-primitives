#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/server';
import { serveStdio } from '@modelcontextprotocol/server/stdio';
import { registerTools } from './tools.js';

function createServer(): McpServer {
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

// serveStdio picks one server instance per connection, so both 2025 and 2026-07-28 clients are served.
serveStdio(createServer, {
  onerror: error => console.error('Server error:', error),
});

console.error('Angular Primitives MCP server running on stdio');
