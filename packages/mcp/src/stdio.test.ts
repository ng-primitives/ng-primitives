import { Client } from '@modelcontextprotocol/client';
import { StdioClientTransport } from '@modelcontextprotocol/client/stdio';
import { resolve } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

// The test target depends on build, so this is the bin that gets published.
const serverEntry = resolve(__dirname, '../../../dist/packages/mcp/src/index.js');

describe('ngp-mcp over stdio', () => {
  let client: Client | undefined;

  afterEach(async () => {
    await client?.close();
    client = undefined;
  });

  it.each([
    { mode: 'legacy' as const, era: 'legacy' },
    { mode: { pin: '2026-07-28' }, era: 'modern' },
  ])('serves a $era client', async ({ mode, era }) => {
    client = new Client(
      { name: 'stdio-test-client', version: '1.0.0' },
      { versionNegotiation: { mode } },
    );

    await client.connect(
      new StdioClientTransport({
        command: process.execPath,
        args: [serverEntry],
        stderr: 'ignore',
      }),
    );

    expect(client.getProtocolEra()).toBe(era);

    const { tools } = await client.listTools();
    expect(tools.map(tool => tool.name)).toContain('list_primitives');

    const result = await client.callTool({
      name: 'get_primitive_details',
      arguments: { name: 'button' },
    });
    const [content] = result.content as { type: 'text'; text: string }[];
    const data = JSON.parse(content.text);
    expect(data.entryPoint).toBe('ng-primitives/button');
  });
});
