# @ng-primitives/mcp

Model Context Protocol (MCP) server for Angular Primitives. This MCP server provides AI assistants with comprehensive information about Angular Primitives, including primitives metadata, API documentation, reusable component examples, and setup instructions.

## Features

- **Automatic Discovery**: Primitives are automatically discovered from the `ng-primitives` package structure at build time
- **API Documentation**: Full API details extracted from TypeScript source files using Angular's compiler API
- **Reusable Components**: Access to production-ready component implementations with variants and sizes
- **Example Code**: Usage examples and templates for all primitives
- **Setup Guides**: Step-by-step installation and usage instructions

## Build-Time Data Generation

All primitive data, examples, and API documentation are extracted automatically at build time using custom Nx executors. This ensures the MCP server always provides up-to-date information without manual updates.

### Data Extraction Process

1. **`mcp-data-extraction`** executor:

   - Scans `packages/ng-primitives` for all secondary entry points
   - Extracts exports from each primitive's `index.ts`
   - Parses documentation from markdown files in `apps/documentation`
   - Extracts reusable component implementations from `apps/components`
   - Generates `primitives-data.json` and `reusable-components.json`

2. **`api-extraction`** executor:
   - Uses Angular's compiler API to extract directive/component metadata
   - Extracts inputs, outputs, selectors, and descriptions
   - Generates `api-data.json` with comprehensive API documentation

### Generated Files

All generated files are located in `packages/mcp/src/generated/`:

- `primitives-data.json` - Complete primitives registry with metadata
- `reusable-components.json` - Reusable component implementations
- `api-data.json` - API documentation from TypeScript sources
- `types.ts` - TypeScript interfaces for type safety

These files are automatically generated during build and should not be manually edited.

## Available Tools

### `list_primitives`

List all available Angular Primitives with optional filtering by category or search term.

**Parameters:**

- `category` (optional): Filter by category (form, navigation, feedback, layout, data, utility)
- `search` (optional): Search primitives by name or description

### `get_primitive_details`

Get detailed information about a specific primitive including exports, entry point, examples, and API documentation.

**Parameters:**

- `name` (required): The name of the primitive

### `get_install_command`

Generate npm install commands for Angular Primitives.

**Parameters:**

- `primitives` (required): Array of primitive names to install

### `list_reusable_components`

List all available reusable component implementations with information about variants and size support.

### `get_reusable_component`

Get the full source code for a specific reusable component implementation.

**Parameters:**

- `name` (required): The name of the reusable component

### `get_setup_guide`

Get comprehensive setup instructions for Angular Primitives.

## Development

### Running Data Extraction

To regenerate the data files:

```bash
nx run mcp:mcp-data-extraction
```

### Building the Package

```bash
nx build mcp
```

This automatically runs both `mcp-data-extraction` and `api-extraction` before compilation.

### Adding New Primitives

New primitives are automatically discovered when added to `packages/ng-primitives/`. No manual updates to the MCP server are required.

## Architecture

```
packages/mcp/
├── src/
│   ├── index.ts                    # MCP server implementation
│   ├── primitives-registry.ts      # Data loading utilities
│   └── generated/                  # Auto-generated files (gitignored)
│       ├── primitives-data.json
│       ├── reusable-components.json
│       ├── api-data.json
│       └── types.ts
└── project.json                    # Nx project configuration

packages/tools/
└── src/
    └── executors/
        ├── mcp-data-extraction/    # Primitives data extractor
        └── api-extraction/         # API documentation extractor
```

## Integration

This MCP server is designed to work with AI assistants and IDEs that support the Model Context Protocol. When configured, it provides context about Angular Primitives directly to AI assistants during development.

## License

Apache-2.0
