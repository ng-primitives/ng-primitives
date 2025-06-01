/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Clipboard } from '@angular/cdk/clipboard';
import { NgClass, NgComponentOutlet, isPlatformServer } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  PLATFORM_ID,
  Type,
  VERSION,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideClipboard } from '@ng-icons/lucide';
import { phosphorLightning } from '@ng-icons/phosphor-icons/regular';
import sdk from '@stackblitz/sdk';
import * as prismjs from 'prismjs';
import { versionMajorMinor } from 'typescript';

const { highlight, languages } = prismjs;

@Component({
  selector: 'docs-example',
  imports: [NgComponentOutlet, NgClass, NgIcon, FormsModule],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideIcons({ phosphorLightning, lucideClipboard })],
})
export class Example {
  private readonly clipboard = inject(Clipboard);
  private readonly platform = inject(PLATFORM_ID);
  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly examples = import.meta.glob!('../../**/*.example.ts', {
    import: 'default', // Imports the default export (the component class)
    eager: false, // Load lazily
  });

  private readonly source = import.meta.glob!('../../**/*.example.ts', {
    import: 'default',
    query: '?source', // Custom query that should make the default import the raw source string
    eager: false, // Load lazily
  });

  // Inputs
  name = input.required<string>();

  // Writable signals for component state and template
  readonly selectedStyle = signal<string>('');
  readonly component = signal<Type<unknown> | null>(null);
  readonly mode = signal<'preview' | 'source'>('preview');
  readonly code = signal<string>('');
  // Private properties
  private raw: string | null = null; // Raw source code for copying and StackBlitz

  // Computed signals
  readonly availableStyles = computed(() => {
    const currentName = this.name();
    if (!currentName) return [];

    const detectedStyles = new Set<string>();
    const exampleComponentKeys = Object.keys(this.examples);
    const sourceKeys = Object.keys(this.source);
    let cssComponentVersionExists = false;

    for (const key of exampleComponentKeys) {
      // Standard pattern: componentName.example.ts -> 'css'
      if (key.endsWith(`/${currentName}.example.ts`)) {
        detectedStyles.add('css');
        cssComponentVersionExists = true;
        continue;
      }

      // Styled pattern: componentName.styleName.example.ts
      const stylePatternRegex = new RegExp(`/${currentName}\\.([a-zA-Z0-9-]+)\\.example\\.ts$`);
      const match = key.match(stylePatternRegex);
      if (match && match[1]) {
        detectedStyles.add(match[1]);
      }
    }

    // If a 'css' component file exists and its source file also exists, 'unstyled' is a valid option
    if (cssComponentVersionExists) {
      const cssSourcePath = this.getExamplePathForNameAndStyle(currentName, 'css', sourceKeys);
      if (cssSourcePath && this.source[cssSourcePath]) {
        detectedStyles.add('unstyled');
      }
    }

    return Array.from(detectedStyles).sort((a, b) => {
      if (a === 'css') return -1; // 'css' always first
      if (b === 'css') return 1;
      if (a === 'unstyled') return -1; // 'unstyled' second
      if (b === 'unstyled') return 1;
      return a.localeCompare(b); // Others alphabetically
    });
  });

  readonly initialStyleToLoad = computed(() => {
    const styles = this.availableStyles();
    const currentName = this.name();
    if (styles.length === 0 && currentName) {
      console.error(`No example versions found for component: ${currentName}`);
      return null;
    }
    return styles.find(s => s === 'css') || styles.find(s => s === 'unstyled') || styles[0] || null;
  });

  constructor() {
    effect(
      () => {
        const initial = this.initialStyleToLoad();
        if (initial) {
          this.selectedStyle.set(initial);
        } else {
          this.selectedStyle.set(''); // Clear if no initial style
        }
      },
      { allowSignalWrites: true },
    );

    effect(() => {
      const currentName = this.name();
      const currentStyle = this.selectedStyle();
      if (currentName && currentStyle) {
        this.loadExample(currentName, currentStyle);
      } else {
        // Clear example if name or style is not set
        this.component.set(null);
        this.code.set('');
        this.raw = null;
      }
    });
  }

  selectStyle(style: string): void {
    if (!this.availableStyles().includes(style)) {
      console.warn(
        `Style "${style}" is not available for ${this.name()}. Available: ${this.availableStyles().join(', ')}`,
      );
      return;
    }
    this.selectedStyle.set(style);
  }

  private getExamplePathForNameAndStyle(
    baseName: string,
    style: string,
    keysToSearch: string[],
  ): string {
    let pathKey: string | undefined;
    if (style === 'css') {
      // Default style, e.g., `button.example.ts`
      pathKey = keysToSearch.find(key => key.endsWith(`/${baseName}.example.ts`));
    } else {
      // Other styles, e.g., `button.unstyled.example.ts`
      pathKey = keysToSearch.find(key => key.endsWith(`/${baseName}.${style}.example.ts`));
    }
    return pathKey ?? '';
  }

  private async loadExample(exampleName: string, exampleStyle: string): Promise<void> {
    if (isPlatformServer(this.platform)) {
      return;
    }

    // Determine component file to load
    let componentFileToLoadPath = this.getExamplePathForNameAndStyle(
      exampleName,
      exampleStyle,
      Object.keys(this.examples),
    );
    if (!componentFileToLoadPath || !this.examples[componentFileToLoadPath]) {
      // If the specific styled component doesn't exist (e.g., unstyled.example.ts is missing for component)
      // or if the exampleStyle is 'unstyled' and its component file is missing,
      // fall back to the 'css' version for the *component*.
      const cssComponentPath = this.getExamplePathForNameAndStyle(
        exampleName,
        'css',
        Object.keys(this.examples),
      );
      if (cssComponentPath && this.examples[cssComponentPath]) {
        componentFileToLoadPath = cssComponentPath;
      } else {
        console.error(
          `No component file found for ${exampleName} (tried style: ${exampleStyle}, fallback: css)`,
        );
        this.component.set(null);
        this.code.set('// Error: Component not found.');
        this.raw = null;
        this.changeDetector.detectChanges();
        return;
      }
    }

    try {
      // Load the component
      const componentModule = await this.examples[componentFileToLoadPath!]!();
      this.component.set(componentModule as Type<unknown>);

      // Determine and load/generate source code for the *requested* exampleStyle
      let originalSource: string | null = null;
      let sourceIsGenerated = false;

      const directSourcePath = this.getExamplePathForNameAndStyle(
        exampleName,
        exampleStyle,
        Object.keys(this.source),
      );

      if (directSourcePath && this.source[directSourcePath]) {
        originalSource = (await this.source[directSourcePath]!()) as string;
      } else if (exampleStyle === 'unstyled') {
        // Unstyled source file doesn't exist, try to generate from 'css' source
        const cssSourcePath = this.getExamplePathForNameAndStyle(
          exampleName,
          'css',
          Object.keys(this.source),
        );
        if (cssSourcePath && this.source[cssSourcePath]) {
          const cssRawSource = (await this.source[cssSourcePath]!()) as string;
          if (typeof cssRawSource === 'string') {
            originalSource = cssRawSource.replace(/styles\s*:\s*`[^`]*`,?\s*/, '');
            sourceIsGenerated = true;
            originalSource =
              `// Unstyled version generated from ${exampleName}.example.ts\n` +
              `// Original styles property has been removed.\n` +
              originalSource;
          } else {
            console.error(`CSS source code not found or not a string for path: ${cssSourcePath}`);
            originalSource = `// Source code for CSS base not available for ${exampleName}`;
          }
        } else {
          originalSource = `// Unstyled example source not found, and base CSS example not found for ${exampleName}.`;
        }
      } else {
        originalSource = `// Source code not found for ${exampleName} with style ${exampleStyle}.`;
        console.warn(
          `Source file not found for ${directSourcePath || `style ${exampleStyle} of ${exampleName}`}.`,
        );
      }

      if (typeof originalSource !== 'string') {
        this.code.set(originalSource || '// Source code not available');
        this.raw = null;
        this.changeDetector.detectChanges();
        return;
      }

      const codeToFormat = originalSource; 
      this.raw = originalSource;

      // Add the "ng-primitives styles" comment to `this.raw` if the *original* source had styles
      // and we are not showing a generated unstyled version.
      if (!sourceIsGenerated && exampleStyle !== 'unstyled' && originalSource.includes('styles:')) {
        this.raw =
          `/** This example uses ng-primitives styles, which are imported from ng-primitives/example-theme/index.css in the global styles file **/\n` +
          originalSource;
      }

      const [prettier, pluginEstree, pluginTypescript, pluginHtml, pluginAngular, pluginPostcss] =
        await Promise.all([
          import('https://esm.sh/prettier@3.3.2/standalone'),
          import('https://esm.sh/prettier@3.3.2/plugins/estree'),
          import('https://esm.sh/prettier@3.3.2/plugins/typescript'),
          import('https://esm.sh/prettier@3.3.2/plugins/html'),
          import('https://esm.sh/prettier@3.3.2/plugins/angular'),
          import('https://esm.sh/prettier@3.3.2/plugins/postcss'),
        ]);

      const formattedCodeForDisplay = await prettier.format(codeToFormat, {
        parser: 'typescript',
        plugins: [pluginEstree, pluginTypescript, pluginAngular, pluginHtml, pluginPostcss],
      });
      this.code.set(
        highlight(formattedCodeForDisplay.trim(), languages['typescript'], 'typescript'),
      );
    } catch (error) {
      console.error(`Error loading example ${exampleName} (style ${exampleStyle}):`, error);
      this.component.set(null);
      this.code.set('// Error loading example code.');
      this.raw = null;
      this.changeDetector.detectChanges();
    }
  }

  protected openStackBlitz(): void {
    if (!this.raw) {
      return;
    }

    // this.raw already contains the source code (original, or generated unstyled with its own comment, or styled with theme comment)
    const stackBlitzSource = this.raw
      .replace(/export default class (\w+)/, 'export class AppComponent')
      .replace(/selector:\s*'[^']*'/, "selector: 'app-root'");

    const packageJson = {
      name: 'angular-starter',
      private: true,
      scripts: {
        ng: 'ng',
        start: 'ng serve',
        build: 'ng build',
      },
      dependencies: {
        '@angular/animations': `^${VERSION.major}.0.0`,
        '@angular/common': `^${VERSION.major}.0.0`,
        '@angular/compiler': `^${VERSION.major}.0.0`,
        '@angular/core': `^${VERSION.major}.0.0`,
        '@angular/forms': `^${VERSION.major}.0.0`,
        '@angular/platform-browser': `^${VERSION.major}.0.0`,
        '@angular/router': `^${VERSION.major}.0.0`,
        '@angular/cdk': `^${VERSION.major}.0.0`,
        'ng-primitives': 'latest',
        '@ng-icons/core': 'latest',
        '@ng-icons/heroicons': 'latest',
        '@floating-ui/dom': '^1.6.0',
        rxjs: '^7.8.1',
        tslib: '^2.5.0',
        '@angular-devkit/build-angular': `^${VERSION.major}.0.0`,
        '@angular/cli': `^${VERSION.major}.0.0`,
        '@angular/compiler-cli': `^${VERSION.major}.0.0`,
        typescript: `~${versionMajorMinor}.0`,
        'zone.js': '~0.15.0',
      },
    };

    sdk.openProject({
      title: 'Angular Example',
      template: 'angular-cli',
      dependencies: packageJson.dependencies,
      files: {
        'src/index.html': `<!DOCTYPE html>
<html lang="en">
  <head>
    <title>My app</title>
    <meta charset="UTF-8" />
    <link rel="preconnect" href="https://rsms.me/">
    <link rel="stylesheet" href="https://rsms.me/inter/inter.css">
  </head>
  <body>
    <app-root>Loading...</app-root>
  </body>
</html>
`,
        'src/global_styles.css': `/* Add application styles & imports to this file! */
@import 'ng-primitives/example-theme/index.css'; 

:root {
  font-family: InterVariable, sans-serif;
  font-feature-settings: 'liga' 1, 'calt' 1; /* fix for Chrome */
  background-color: rgb(250, 250, 250);
  font-size: 14px;
}

* {
  box-sizing: border-box;
  font-family: inherit;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}`,
        'src/main.ts': `import { bootstrapApplication } from '@angular/platform-browser';
import 'zone.js';
${stackBlitzSource}

bootstrapApplication(AppComponent);`,
        '.gitignore': `.angular
dist
node_modules`,
        'angular.json': `{
  "$schema": "./node_modules/@angular/cli/lib/config/schema.json",
  "cli": {
    "analytics": "1e1de97b-a744-405a-8b5a-0397bb3d01ce"
  },
  "newProjectRoot": "projects",
  "projects": {
    "demo": {
      "architect": {
        "build": {
          "builder": "@angular-devkit/build-angular:application",
          "configurations": {
            "development": {
              "extractLicenses": false,
              "namedChunks": true,
              "optimization": false,
              "sourceMap": true
            },
            "production": {
              "aot": true,
              "extractLicenses": true,
              "namedChunks": false,
              "optimization": true,
              "outputHashing": "all",
              "sourceMap": false
            }
          },
          "options": {
            "assets": [],
            "index": "src/index.html",
            "browser": "src/main.ts",
            "outputPath": "dist/demo",
            "scripts": [],
            "styles": ["src/global_styles.css"],
            "tsConfig": "tsconfig.app.json"
          }
        },
        "serve": {
          "builder": "@angular-devkit/build-angular:dev-server",
          "configurations": {
            "development": {
              "buildTarget": "demo:build:development"
            },
            "production": {
              "buildTarget": "demo:build:production"
            }
          },
          "defaultConfiguration": "development"
        }
      },
      "prefix": "app",
      "projectType": "application",
      "root": "",
      "schematics": {},
      "sourceRoot": "src"
    }
  },
  "version": 1
}`,
        'package.json': JSON.stringify(packageJson, null, 2),
        'tsconfig.app.json': `/* To learn more about this file see: https://angular.io/config/tsconfig. */
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "./out-tsc/app",
    "types": []
  },
  "files": ["src/main.ts"],
  "include": ["src/**/*.d.ts"]
}
`,
        'tsconfig.json': `/* To learn more about this file see: https://angular.io/config/tsconfig. */
{
  "compileOnSave": false,
  "compilerOptions": {
    "outDir": "./dist/out-tsc",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true,
    "sourceMap": true,
    "declaration": false,
    "downlevelIteration": true,
    "experimentalDecorators": true,
    "moduleResolution": "node",
    "importHelpers": true,
    "target": "ES2015",
    "module": "ES2022",
    "useDefineForClassFields": false,
    "lib": ["ES2022", "dom"]
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}`,
      },
    });
  }

  protected copyCode(): void {
    if (!this.raw) {
      return;
    }

    this.clipboard.copy(this.raw); // Copies the content of this.raw
  }
}
