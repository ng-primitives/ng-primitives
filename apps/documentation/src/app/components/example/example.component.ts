/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Clipboard } from '@angular/cdk/clipboard';
import { NgClass, NgComponentOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  Type,
  computed,
  inject,
  signal,
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideClipboard, lucideCodesandbox } from '@ng-icons/lucide';
import sdk from '@stackblitz/sdk';
import { highlight, languages } from 'prismjs';
import 'prismjs/components/prism-typescript';
import type { PropertyAssignment } from 'typescript';

@Component({
  selector: 'docs-example',
  standalone: true,
  imports: [NgComponentOutlet, NgClass, NgIcon],
  templateUrl: './example.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideIcons({ lucideCodesandbox, lucideClipboard })],
})
export class ExampleComponent {
  private readonly clipboard = inject(Clipboard);
  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly examples = import.meta.glob!('../../**/*.example.ts', {
    import: 'default',
  });

  private readonly source = import.meta.glob!('../../**/*.example.ts', {
    import: 'default',
    query: '?source',
  });

  component: Type<unknown> | null = null;

  readonly language = signal<Language>('html');

  readonly tabs = computed<Tab[]>(() => {
    const tabs: Tab[] = [
      { label: 'HTML', value: 'html' },
      { label: 'TypeScript', value: 'typescript' },
      { label: 'Styles', value: 'styles' },
    ];

    return tabs.filter(tab => this[tab.value]() !== null);
  });

  get code(): string | null {
    return this[this.language()]();
  }

  readonly mode = signal<'preview' | 'source'>('preview');

  private raw: string | null = null;
  private html = signal<string | null>(null);
  private styles = signal<string | null>(null);
  private typescript = signal<string | null>(null);

  @Input({ required: true }) set name(name: string) {
    // the path provided will be something like 'button', so we should find the path
    // that matches the pattern `../../examples/button/button.example.ts`
    const examplePath = Object.keys(this.examples).find(key => key.endsWith(`/${name}.example.ts`));

    if (!examplePath) {
      throw new Error(`No example found for path: ${name}`);
    }

    this.loadExample(examplePath);
  }

  private async loadExample(path: string): Promise<void> {
    this.component = (await this.examples[path]()) as Type<unknown>;
    this.changeDetector.detectChanges();

    this.raw = ((await this.source[path]()) as string)
      // find the class name after `export class ` and replace it with `AppComponent`
      .replace(/export default class (\w+)/, 'export class AppComponent')
      // find the selector and replace it with `app-root`
      .replace(/selector:\s*'[^']*'/, "selector: 'app-root'");

    const tsquery = await import('@phenomnomnominal/tsquery');
    const ts = await import('typescript');
    const prettier = await import('prettier/standalone');

    const ast = tsquery.ast(this.raw);
    const templateProperty = tsquery.query<PropertyAssignment>(
      ast,
      'ClassDeclaration:has(ExportKeyword) Decorator ObjectLiteralExpression > PropertyAssignment:has(Identifier[name="template"])',
    )[0];
    const stylesProperty = tsquery.query<PropertyAssignment>(
      ast,
      'ClassDeclaration:has(ExportKeyword) Decorator ObjectLiteralExpression > PropertyAssignment:has(Identifier[name="styles"])',
    )[0];

    let template: string;
    let styles: string | undefined;

    // the template property must exist and must be a string literal or a template literal
    if (templateProperty && ts.isStringLiteral(templateProperty.initializer)) {
      template = templateProperty.initializer.text;
    } else if (
      templateProperty &&
      ts.isNoSubstitutionTemplateLiteral(templateProperty.initializer)
    ) {
      template = templateProperty.initializer.text;
    } else {
      throw new Error('Template property must be a string literal or a template literal');
    }

    // the styles property may or may not exist and must be a string literal or a template literal
    if (stylesProperty && ts.isStringLiteral(stylesProperty.initializer)) {
      styles = stylesProperty.initializer.text;
    }
    // it may also be a template literal
    else if (stylesProperty && ts.isNoSubstitutionTemplateLiteral(stylesProperty.initializer)) {
      styles = stylesProperty.initializer.text;
    }
    // it may also be an array of string literals or template literals
    else if (stylesProperty && ts.isArrayLiteralExpression(stylesProperty.initializer)) {
      styles = stylesProperty.initializer.elements.map(element => element.getText()).join('\n');
    }

    // replace the template property with a templateUrl property
    let typescript = tsquery.replace(
      this.raw,
      'ClassDeclaration:has(ExportKeyword) Decorator ObjectLiteralExpression > PropertyAssignment:has(Identifier[name="template"])',
      () => {
        return 'templateUrl: "./app.component.html"';
      },
    );

    // replace the styles property with a styleUrl property if it exists
    if (stylesProperty) {
      typescript = tsquery.replace(
        typescript,
        'ClassDeclaration:has(ExportKeyword) Decorator ObjectLiteralExpression > PropertyAssignment:has(Identifier[name="styles"])',
        () => {
          return 'styleUrl: "./app.component.css"';
        },
      );
    }

    typescript = await prettier.format(typescript, {
      parser: 'typescript',
      plugins: [
        await import('prettier/plugins/estree'),
        await import('prettier/plugins/typescript'),
      ],
    });
    template = await prettier.format(template, {
      parser: 'angular',
      plugins: [await import('prettier/plugins/html'), await import('prettier/plugins/angular')],
    });
    styles = styles
      ? await prettier.format(styles, {
          parser: 'css',
          plugins: [await import('prettier/plugins/postcss')],
        })
      : undefined;

    this.html.set(highlight(template.trim(), languages['html'], 'html'));
    this.styles.set(styles ? highlight(styles.trim(), languages['css'], 'css') : null);
    this.typescript.set(highlight(typescript, languages['typescript'], 'typescript'));

    this.changeDetector.detectChanges();
  }

  protected openStackBlitz(): void {
    if (!this.raw) {
      return;
    }

    sdk.openProject({
      title: 'Angular Example',
      template: 'angular-cli',
      files: {
        'src/app/app.component.ts': this.raw,
      },
    });
  }

  protected copyCode(): void {
    if (!this.raw) {
      return;
    }

    this.clipboard.copy(this.raw);
  }
}

type Language = 'html' | 'typescript' | 'styles';
type Tab = { label: string; value: Language };
