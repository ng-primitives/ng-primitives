import { logger, PromiseExecutor } from '@nx/devkit';
import { mkdir, readdir, readFile, writeFile } from 'fs/promises';
import { basename, extname, join, relative } from 'path';
import { LlmsExecutorSchema } from './schema';

interface DocumentationFile {
  path: string;
  relativePath: string;
  category: string;
  name: string;
  content: string;
  frontmatter?: Record<string, any>;
}

async function ensureDirectoryExists(dirPath: string): Promise<void> {
  try {
    await mkdir(dirPath, { recursive: true });
  } catch (error) {
    // Directory might already exist
  }
}

function parseFrontmatter(content: string): {
  frontmatter: Record<string, any> | undefined;
  markdownContent: string;
} {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    return { frontmatter: undefined, markdownContent: content };
  }

  const frontmatterContent = match[1];
  const markdownContent = match[2];

  // Simple YAML parsing for frontmatter
  const frontmatter: Record<string, any> = {};
  frontmatterContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split(':');
    if (key && valueParts.length > 0) {
      const value = valueParts.join(':').trim();
      // Remove quotes if present
      frontmatter[key.trim()] = value.replace(/^['"]|['"]$/g, '');
    }
  });

  return { frontmatter, markdownContent };
}

async function findMarkdownFiles(docsDir: string): Promise<DocumentationFile[]> {
  const files: DocumentationFile[] = [];

  async function processDirectory(currentDir: string): Promise<void> {
    try {
      const entries = await readdir(currentDir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = join(currentDir, entry.name);

        if (entry.isDirectory()) {
          await processDirectory(fullPath);
        } else if (entry.isFile() && extname(entry.name) === '.md') {
          const content = await readFile(fullPath, 'utf-8');
          const relativePath = relative(docsDir, fullPath);
          const pathParts = relativePath.split('/');
          const category = pathParts.length > 1 ? pathParts[0] : 'general';
          const fileName = basename(entry.name, '.md');

          const { frontmatter, markdownContent } = parseFrontmatter(content);

          files.push({
            path: fullPath,
            relativePath,
            category,
            name: frontmatter?.name || fileName,
            content: markdownContent,
            frontmatter,
          });
        }
      }
    } catch (error) {
      logger.warn(`Could not process directory ${currentDir}: ${error}`);
    }
  }

  await processDirectory(docsDir);
  return files.sort((a, b) => a.relativePath.localeCompare(b.relativePath));
}

function generateIndexFile(files: DocumentationFile[]): string {
  let content = '# Angular Primitives\n\n';
  content +=
    '> Angular Primitives is a collection of unstyled, accessible Angular components and utilities for building design systems and web applications. Built with Angular, TypeScript, and a focus on accessibility, customization, and developer experience. It provides headless UI primitives that can be styled with any CSS framework or design system.\n\n';

  // Overview section
  content += '## Overview\n\n';
  const overviewFiles = files.filter(f => f.category === 'getting-started');
  for (const file of overviewFiles) {
    const url = `https://angularprimitives.com/${file.relativePath.replace('.md', '')}`;
    content += `- [${file.name}](${url}): ${getComponentDescription(file.name, file.content)}\n`;
  }
  content += '\n';

  // Components section by category
  content += '## Components\n\n';

  const primitiveFiles = files.filter(f => f.category === 'primitives');
  const categoryGroups = groupPrimitivesByCategory(primitiveFiles);

  for (const [categoryName, categoryFiles] of Object.entries(categoryGroups)) {
    content += `### ${categoryName}\n\n`;

    for (const file of categoryFiles) {
      const url = `https://angularprimitives.com/primitives/${file.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
      content += `- [${file.name}](${url}): ${getComponentDescription(file.name, file.content)}\n`;
    }
    content += '\n';
  }

  // Interactions section
  const interactionFiles = files.filter(f => f.category === 'interactions');
  if (interactionFiles.length > 0) {
    content += '## Interactions\n\n';
    for (const file of interactionFiles) {
      const url = `https://angularprimitives.com/interactions/${file.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
      content += `- [${file.name}](${url}): ${getComponentDescription(file.name, file.content)}\n`;
    }
    content += '\n';
  }

  // Utilities section
  const utilityFiles = files.filter(f => f.category === 'utilities');
  if (utilityFiles.length > 0) {
    content += '## Utilities\n\n';
    for (const file of utilityFiles) {
      const url = `https://angularprimitives.com/utilities/${file.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
      content += `- [${file.name}](${url}): ${getComponentDescription(file.name, file.content)}\n`;
    }
    content += '\n';
  }

  return content;
}

function groupPrimitivesByCategory(
  primitiveFiles: DocumentationFile[],
): Record<string, DocumentationFile[]> {
  const groups: Record<string, DocumentationFile[]> = {
    'Form & Input': [],
    'Layout & Navigation': [],
    'Overlays & Dialogs': [],
    'Feedback & Status': [],
    'Display & Media': [],
    Misc: [],
  };

  for (const file of primitiveFiles) {
    const category = categorizePrimitive(file.name);
    groups[category].push(file);
  }

  // Remove empty categories
  Object.keys(groups).forEach(key => {
    if (groups[key].length === 0) {
      delete groups[key];
    }
  });

  return groups;
}

function categorizePrimitive(name: string): string {
  const lowerName = name.toLowerCase();

  // Form & Input
  if (
    [
      'button',
      'input',
      'textarea',
      'checkbox',
      'radio',
      'select',
      'switch',
      'slider',
      'range-slider',
      'date-picker',
      'combobox',
      'search',
      'form-field',
      'file-upload',
      'input-otp',
    ].some(term => lowerName.includes(term))
  ) {
    return 'Form & Input';
  }

  // Layout & Navigation
  if (
    [
      'accordion',
      'breadcrumbs',
      'tabs',
      'separator',
      'resize',
      'menu',
      'toolbar',
      'pagination',
    ].some(term => lowerName.includes(term))
  ) {
    return 'Layout & Navigation';
  }

  // Overlays & Dialogs
  if (['dialog', 'popover', 'tooltip'].some(term => lowerName.includes(term))) {
    return 'Overlays & Dialogs';
  }

  // Feedback & Status
  if (['toast', 'progress', 'meter'].some(term => lowerName.includes(term))) {
    return 'Feedback & Status';
  }

  // Display & Media
  if (
    ['avatar', 'table', 'listbox', 'ai-assistant', 'icons'].some(term => lowerName.includes(term))
  ) {
    return 'Display & Media';
  }

  // Default to Misc
  return 'Misc';
}

function getComponentDescription(name: string, content: string): string {
  // Extract the first sentence or paragraph that describes what the component does
  const lines = content
    .split('\n')
    .filter(line => line.trim() && !line.startsWith('#') && !line.startsWith('<'));

  if (lines.length > 0) {
    const firstLine = lines[0].trim();
    // Take the first sentence
    const firstSentence = firstLine.split('.')[0];
    if (firstSentence && firstSentence.length > 20) {
      return firstSentence + '.';
    }
  }

  // Fallback descriptions
  const descriptions: Record<string, string> = {
    Button: 'Button component with multiple variants and interaction states.',
    Input: 'Text input component with validation and accessibility features.',
    Textarea: 'Multi-line text input component.',
    Checkbox: 'Checkbox input component with indeterminate state support.',
    Radio: 'Radio button group component.',
    Select: 'Select dropdown component.',
    Switch: 'Toggle switch component.',
    Slider: 'Slider input component for selecting values.',
    'Range Slider': 'Range slider component for selecting value ranges.',
    'Date Picker': 'Date picker component with calendar integration.',
    Combobox: 'Searchable select component with filtering.',
    Search: 'Search input component with filtering capabilities.',
    'Form Field': 'Form field wrapper with labels and validation.',
    'File Upload': 'File upload component with drag and drop support.',
    'Input OTP': 'One-time password input component.',
    Accordion: 'Collapsible accordion component.',
    Breadcrumbs: 'Breadcrumb navigation component.',
    Tabs: 'Tabbed interface component.',
    Separator: 'Visual divider between content sections.',
    Resize: 'Resizable panel component.',
    Menu: 'Accessible menu component with keyboard navigation.',
    Toolbar: 'Toolbar component for grouping actions.',
    Pagination: 'Pagination component for data navigation.',
    Dialog: 'Modal dialog component.',
    Popover: 'Floating popover component.',
    Tooltip: 'Tooltip component for additional context.',
    Toast: 'Toast notification component.',
    Progress: 'Progress bar component.',
    Meter: 'Meter component for displaying measurements.',
    Avatar: 'Avatar component for user profiles.',
    Table: 'Table component for displaying data.',
    Listbox: 'Listbox component for option selection.',
    'AI Assistant': 'AI assistant component for interactive conversations.',
    Icons: 'Icon utilities and components.',
    Toggle: 'Toggle button component.',
    'Toggle Group': 'Group of toggle buttons.',
    'Roving Focus': 'Roving focus management utility.',
  };

  return descriptions[name] || `${name} component for Angular applications.`;
}

async function replaceDocsSnippets(content: string, workspaceRoot: string): Promise<string> {
  const snippetRegex = /<docs-snippet name="([^"]+)"><\/docs-snippet>/g;
  let result = content;
  let match;

  while ((match = snippetRegex.exec(content)) !== null) {
    const snippetName = match[1];
    const snippetPath = join(
      workspaceRoot,
      'apps',
      'components',
      'src',
      'app',
      'pages',
      'reusable-components',
      snippetName,
      `${snippetName}.ts`,
    );

    try {
      const snippetContent = await readFile(snippetPath, 'utf-8');
      const replacement = `## Reusable Component\n\n\`\`\`typescript\n${snippetContent}\n\`\`\``;
      result = result.replace(match[0], replacement);
    } catch (error) {
      logger.warn(`Could not find snippet file: ${snippetPath}`);
      result = result.replace(match[0], `_Snippet "${snippetName}" not found_`);
    }
  }

  return result;
}

async function replaceApiDocs(content: string, workspaceRoot: string): Promise<string> {
  const apiDocsRegex = /<api-docs name="([^"]+)"><\/api-docs>/g;
  let result = content;

  try {
    const apiDocsPath = join(
      workspaceRoot,
      'apps',
      'documentation',
      'src',
      'app',
      'api',
      'documentation.json',
    );
    const apiDocsContent = await readFile(apiDocsPath, 'utf-8');
    const apiData = JSON.parse(apiDocsContent);

    let match;
    while ((match = apiDocsRegex.exec(content)) !== null) {
      const componentName = match[1];
      const componentData = apiData[componentName];

      if (componentData) {
        let replacement = `## API Reference\n\n`;
        replacement += `### ${componentData.name}\n\n`;
        replacement += `${componentData.description}\n\n`;
        replacement += `**Selector:** \`${componentData.selector}\`\n\n`;

        if (componentData.inputs && componentData.inputs.length > 0) {
          replacement += `#### Inputs\n\n`;
          replacement += `| Property | Type | Default | Description |\n`;
          replacement += `|----------|------|---------|-------------|\n`;
          for (const input of componentData.inputs) {
            replacement += `| \`${input.name}\` | \`${input.type || 'unknown'}\` | \`${input.defaultValue || '-'}\` | ${input.description || '-'} |\n`;
          }
          replacement += `\n`;
        }

        if (componentData.outputs && componentData.outputs.length > 0) {
          replacement += `#### Outputs\n\n`;
          replacement += `| Event | Type | Description |\n`;
          replacement += `|-------|------|-------------|\n`;
          for (const output of componentData.outputs) {
            replacement += `| \`${output.name}\` | \`${output.type || 'unknown'}\` | ${output.description || '-'} |\n`;
          }
          replacement += `\n`;
        }

        if (componentData.exportAs && componentData.exportAs.length > 0) {
          replacement += `#### Export As\n\n`;
          replacement += componentData.exportAs.map(exp => `\`${exp}\``).join(', ') + `\n\n`;
        }

        result = result.replace(match[0], replacement);
      } else {
        logger.warn(`Could not find API documentation for: ${componentName}`);
        result = result.replace(match[0], `_API documentation for "${componentName}" not found_`);
      }
    }
  } catch (error) {
    logger.warn(`Could not load API documentation: ${error}`);
  }

  return result;
}

async function replaceDocsExamples(content: string, workspaceRoot: string): Promise<string> {
  const exampleRegex = /<docs-example name="([^"]+)"><\/docs-example>/g;
  let result = content;
  let match;

  while ((match = exampleRegex.exec(content)) !== null) {
    const exampleName = match[1];
    const examplePath = join(workspaceRoot, 'apps', 'documentation', 'src', 'app', 'examples');

    // Try to find the example file in different possible locations
    const possiblePaths = [
      // Direct path: examples/{name}/{name}.example.ts
      join(examplePath, exampleName, `${exampleName}.example.ts`),
      // Try looking in subdirectories for examples like "button-sizes" in "button" folder
      ...(await findExampleInSubdirectories(examplePath, exampleName)),
    ];

    let exampleContent = null;
    let foundPath = null;

    for (const path of possiblePaths) {
      try {
        exampleContent = await readFile(path, 'utf-8');
        foundPath = path;
        break;
      } catch (error) {
        // Continue trying other paths
      }
    }

    if (exampleContent && foundPath) {
      const replacement = `## Example\n\n\`\`\`typescript\n${exampleContent}\n\`\`\``;
      result = result.replace(match[0], replacement);
    } else {
      logger.warn(`Could not find example file for: ${exampleName}`);
      result = result.replace(match[0], `_Example "${exampleName}" not found_`);
    }
  }

  return result;
}

async function findExampleInSubdirectories(
  basePath: string,
  exampleName: string,
): Promise<string[]> {
  const possiblePaths: string[] = [];

  try {
    const entries = await readdir(basePath, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const subdirPath = join(basePath, entry.name);
        const exampleFilePath = join(subdirPath, `${exampleName}.example.ts`);
        possiblePaths.push(exampleFilePath);
      }
    }
  } catch (error) {
    // Ignore errors when searching subdirectories
  }

  return possiblePaths;
}

async function generateFullDocumentation(
  files: DocumentationFile[],
  workspaceRoot: string,
): Promise<string> {
  let content = '# Angular Primitives Documentation\n\n';
  content +=
    '> Angular Primitives is a collection of unstyled, accessible Angular components and utilities for building design systems and web applications. Built with Angular, TypeScript, and a focus on accessibility, customization, and developer experience. It provides headless UI primitives that can be styled with any CSS framework or design system.\n\n';
  content += `Generated on: ${new Date().toISOString()}\n\n`;
  content += '---\n\n';

  const categories = [...new Set(files.map(f => f.category))].sort();

  for (const category of categories) {
    const categoryFiles = files.filter(f => f.category === category);
    content += `## ${category.charAt(0).toUpperCase() + category.slice(1)}\n\n`;

    for (const file of categoryFiles) {
      content += `### ${file.name}\n\n`;
      content += `File: ${file.relativePath}\n`;
      content += `URL: https://angularprimitives.com/${file.relativePath.replace('.md', '')}\n\n`;

      // Replace docs-snippet, api-docs, and docs-example tags with actual content
      let processedContent = await replaceDocsSnippets(file.content, workspaceRoot);
      processedContent = await replaceApiDocs(processedContent, workspaceRoot);
      processedContent = await replaceDocsExamples(processedContent, workspaceRoot);

      content += processedContent;
      content += '\n\n---\n\n';
    }
  }

  return content;
}

const runExecutor: PromiseExecutor<LlmsExecutorSchema> = async (options, context) => {
  const { outputDir, docsDir } = options;
  const workspaceRoot = context.root;

  const fullDocsPath = join(workspaceRoot, docsDir);
  const fullOutputPath = join(workspaceRoot, outputDir);

  try {
    logger.info(`Processing markdown files from: ${fullDocsPath}`);
    logger.info(`Output directory: ${fullOutputPath}`);

    // Ensure output directory exists
    await ensureDirectoryExists(fullOutputPath);

    // Find all markdown files
    const files = await findMarkdownFiles(fullDocsPath);
    logger.info(`Found ${files.length} markdown files`);

    if (files.length === 0) {
      logger.warn('No markdown files found in the specified directory');
      return { success: false, error: 'No markdown files found' };
    }

    // Generate full documentation file
    logger.info('Generating llms-full.txt...');
    const fullContent = await generateFullDocumentation(files, workspaceRoot);
    await writeFile(join(fullOutputPath, 'llms-full.txt'), fullContent, 'utf-8');

    // Generate index file with direct links
    logger.info('Generating llms.txt...');
    const indexContent = generateIndexFile(files);
    await writeFile(join(fullOutputPath, 'llms.txt'), indexContent, 'utf-8');

    logger.info(`Successfully generated LLM documentation files:`);
    logger.info(`- llms-full.txt: Complete documentation (${files.length} pages)`);
    logger.info(`- llms.txt: Documentation index with direct links to ${files.length} pages`);

    return { success: true };
  } catch (error) {
    logger.error(`Error generating LLM documentation: ${error}`);
    return { success: false, error: error.message };
  }
};

export default runExecutor;
