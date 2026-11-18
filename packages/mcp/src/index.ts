#!/usr/bin/env node
import { serveStdio } from '@modelcontextprotocol/server/stdio';
import { createServer } from './server.js';

// serveStdio picks one server instance per connection, so both 2025 and 2026-07-28 clients are served.
serveStdio(createServer, {
  onerror: error => console.error('Server error:', error),
});

console.error('Angular Primitives MCP server running on stdio');
