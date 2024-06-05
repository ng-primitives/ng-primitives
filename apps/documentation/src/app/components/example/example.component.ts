/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Clipboard } from '@angular/cdk/clipboard';
import { NgClass, NgComponentOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  Type,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideClipboard, lucideCodesandbox } from '@ng-icons/lucide';
import sdk from '@stackblitz/sdk';
import { highlight, languages } from 'prismjs';

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
  private readonly examples = import.meta.glob!('../../examples/**/*.example.ts', {
    import: 'default',
  });

  private readonly source = import.meta.glob!('../../examples/**/*.example.ts', {
    import: 'default',
    query: '?source',
  });

  component: Type<unknown> | null = null;
  code: string | null = null;

  readonly mode = signal<'preview' | 'source'>('preview');

  protected codeElement = viewChild.required<ElementRef<HTMLPreElement>>('codeElement');
  private raw: string | null = null;

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
    this.raw = ((await this.source[path]()) as string)
      // find the class name after `export class ` and replace it with `AppComponent`
      .replace(/export default class (\w+)/, 'export class AppComponent')
      // find the selector and replace it with `app-root`
      .replace(/selector:\s*'[^']*'/, "selector: 'app-root'");

    this.code = highlight(this.raw, languages['typescript'], 'typescript');
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
