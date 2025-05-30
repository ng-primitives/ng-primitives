/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Clipboard } from '@angular/cdk/clipboard';
import { NgClass, NgComponentOutlet, isPlatformServer } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  PLATFORM_ID,
  Type,
  VERSION,
  inject,
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
    import: 'default',
  });

  private readonly source = import.meta.glob!('../../**/*.example.ts', {
    import: 'default',
    query: '?source',
  });
  selectedStyle = signal<'unstyled' | 'css'>('unstyled');
  component: Type<unknown> | null = null;
  readonly mode = signal<'preview' | 'source'>('preview');
  private raw: string | null = null;
  readonly code = signal<string>('');

  // Store the base name of the example
  private exampleBaseName: string = '';

  // Available styles for the current exampleBaseName
  readonly availableStyles = signal<Array<'css' | 'unstyled'>>([]); // could include tailwind in the future

  @Input({ required: true }) set name(name: string) {
    this.exampleBaseName = name;

    // Determine available styles for this component name
    const styles: Array<'css' | 'unstyled'> = [];
    const exampleKeys = Object.keys(this.examples);
    if (exampleKeys.some(key => key.endsWith(`/${name}.example.ts`))) {
      styles.push('css');
    }
    if (exampleKeys.some(key => key.endsWith(`/${name}.unstyled.example.ts`))) {
      styles.push('unstyled');
    }
    this.availableStyles.set(styles);

    // Set initial style and load
    // Default to 'css' if available, otherwise 'unstyled', otherwise error
    let initialStyleToLoad: 'css' | 'unstyled' | null = null;
    if (styles.includes('css')) {
      initialStyleToLoad = 'css';
    } else if (styles.includes('unstyled')) {
      initialStyleToLoad = 'unstyled';
    }

    if (!initialStyleToLoad) {
      throw new Error(`No example versions (css or unstyled) found for path: ${name}`);
    }

    this.selectedStyle.set(initialStyleToLoad);
    const examplePath = this.getExamplePathForNameAndStyle(
      this.exampleBaseName,
      this.selectedStyle(),
    );

    if (!examplePath) {
      // This should not happen if initialStyleToLoad was set based on `styles`
      throw new Error(`No example found for path: ${name} with style ${this.selectedStyle()}`);
    }

    this.loadExample(examplePath);
  }

  selectStyle(style: 'unstyled' | 'css'): void {
    if (!this.availableStyles().includes(style)) {
      console.warn(`Style ${style} is not available for ${this.exampleBaseName}.`);
      return;
    }

    this.selectedStyle.set(style);
    if (!this.exampleBaseName) {
      console.error('Example base name is not set. Cannot select style.');
      return;
    }
    const examplePath = this.getExamplePathForNameAndStyle(this.exampleBaseName, style);
    this.loadExample(examplePath);
  }

  private getExamplePathForNameAndStyle(baseName: string, style: 'unstyled' | 'css'): string {
    let pathKey: string | undefined;
    const exampleKeys = Object.keys(this.examples);

    if (style === 'css') {
      // Default style, e.g., `button.example.ts`
      pathKey = exampleKeys.find(key => key.endsWith(`/${baseName}.example.ts`));
    } else {
      // Other styles, e.g., `button.unstyled.example.ts`
      pathKey = exampleKeys.find(key => key.endsWith(`/${baseName}.${style}.example.ts`));
    }
    return pathKey ?? '';
  }

  private async loadExample(path: string): Promise<void> {
    if (!path) {
      this.component = null;
      this.code.set('');
      this.raw = null;
      this.changeDetector.detectChanges();
      console.warn(`Example path is empty. Clearing example view.`);
      return;
    }

    try {
      const componentModule = await this.examples[path]!();
      this.component = componentModule as Type<unknown>;
      this.changeDetector.detectChanges();

      if (isPlatformServer(this.platform)) {
        return;
      }
      const originalSource = (await this.source[path]!()) as string;
      if (typeof originalSource !== 'string') {
        console.error(`Source code not found or not a string for path: ${path}`);
        this.code.set('// Source code not available');
        this.raw = null;
        this.changeDetector.detectChanges();
        return;
      }

      let sourceForCopy = originalSource;
      if (originalSource.includes('styles:')) {
        sourceForCopy =
          `/** This example uses ng-primitives styles, which are imported from ng-primitives/example-theme/index.css in the global styles file **/\n` +
          originalSource;
      }
      this.raw = sourceForCopy; // Used by copyCode()

      const [prettier, pluginEstree, pluginTypescript, pluginHtml, pluginAngular, pluginPostcss] =
        await Promise.all([
          import('https://esm.sh/prettier@3.3.2/standalone'),
          import('https://esm.sh/prettier@3.3.2/plugins/estree'),
          import('https://esm.sh/prettier@3.3.2/plugins/typescript'),
          import('https://esm.sh/prettier@3.3.2/plugins/html'),
          import('https://esm.sh/prettier@3.3.2/plugins/angular'),
          import('https://esm.sh/prettier@3.3.2/plugins/postcss'),
        ]);

      const formattedCodeForDisplay = await prettier.format(this.raw, {
        // Format this.raw (original styles, with comment)
        parser: 'typescript',
        plugins: [pluginEstree, pluginTypescript, pluginAngular, pluginHtml, pluginPostcss],
      });
      this.code.set(
        highlight(formattedCodeForDisplay.trim(), languages['typescript'], 'typescript'),
      );

      this.changeDetector.detectChanges();
    } catch (error) {
      console.error(`Error loading example from path ${path}:`, error);
      this.component = null;
      this.code.set('// Error loading example code.');
      this.raw = null;
      this.changeDetector.detectChanges();
    }
  }

  protected openStackBlitz(): void {
    if (!this.raw) {
      return;
    }

    // Prepare source for StackBlitz from this.raw
    const stackBlitzSource = this.raw
      .replace(/export default class (\w+)/, 'export class AppComponent')
      .replace(/selector:\s*'[^']*'/, "selector: 'app-root'")

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
@import 'ng-primitives/example-theme/index.css'; // Ensure this path is correct for StackBlitz

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

    this.clipboard.copy(this.raw); // Copies the version with original styles and comment
  }
}
