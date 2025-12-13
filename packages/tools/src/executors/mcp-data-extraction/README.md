# MCP Data Extraction Executor

This Nx executor automatically extracts primitives metadata, reusable components, and examples from the ng-primitives workspace for use in the MCP server.

## Purpose

Ensures the MCP server always has up-to-date information about:

- All available primitives and their exports
- Primitive categories and descriptions
- Accessibility features from documentation
- Reusable component implementations
- Example code and usage patterns

## How It Works

1. **Primitive Discovery**: Scans `packages/ng-primitives` directory structure for all secondary entry points (directories with `src/index.ts`)
2. **Export Extraction**: Parses each primitive's `index.ts` to extract all exported symbols
3. **Documentation Parsing**: Reads markdown documentation files to extract descriptions and accessibility features
4. **Component Extraction**: Reads reusable component implementations from the components app
5. **Data Enrichment**: Combines all sources into a comprehensive dataset
6. **JSON Generation**: Outputs structured JSON files for the MCP server to consume

## Configuration

```json
{
  "executor": "@ng-primitives/tools:mcp-data-extraction",
  "options": {
    "outputPath": "packages/mcp/src/generated",
    "primitivesPath": "packages/ng-primitives",
    "docsPath": "apps/documentation/src/app/pages/(documentation)",
    "componentsPath": "apps/components/src/app/pages/reusable-components"
  }
}
```

## Options

- `outputPath`: Where to write generated JSON files (default: `packages/mcp/src/generated`)
- `primitivesPath`: Path to the ng-primitives package (default: `packages/ng-primitives`)
- `docsPath`: Path to documentation markdown files (default: `apps/documentation/src/app/pages/(documentation)`)
- `componentsPath`: Path to reusable components (default: `apps/components/src/app/pages/reusable-components`)

## Output Files

- `primitives-data.json`: Complete primitives registry with all metadata
- `reusable-components.json`: Reusable component implementations
- `types.ts`: TypeScript interfaces for generated data

## Usage

```bash
# Run manually
nx run mcp:mcp-data-extraction

# Runs automatically as part of MCP build
nx build mcp
```

## Extending

To extract additional data:

1. Add extraction logic to the executor's main function
2. Update the output JSON structure
3. Update the TypeScript interfaces in the generated `types.ts`
4. Update the MCP server to use the new data
