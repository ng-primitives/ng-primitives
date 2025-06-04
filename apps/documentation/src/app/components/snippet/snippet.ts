/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Clipboard } from '@angular/cdk/clipboard';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  computed,
  inject,
  signal,
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroSquare2Stack } from '@ng-icons/heroicons/outline';
import * as prismjs from 'prismjs';

const { highlight, languages } = prismjs;

@Component({
  selector: 'docs-snippet',
  imports: [NgIcon],
  providers: [provideIcons({ heroSquare2Stack })],
  templateUrl: './snippet.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Snippet {
  private readonly clipboard = inject(Clipboard);
  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly snippets = import.meta.glob!(
    '../../../../../components/src/app/reusable-components/**/*.ts',
    {
      import: 'default',
      query: '?source',
    },
  );

  readonly files = signal<Tab[]>([]);

  readonly selectedFile = signal<string | null>(null);

  readonly code = computed(() => {
    const files = this.files();
    const selectedFile = this.selectedFile();

    if (!selectedFile || !files.find(file => file.label === selectedFile)) {
      return '';
    }

    const code = this.files().find(file => file.label === selectedFile)!.value;
    return highlight(code, languages['typescript'], 'typescript');
  });

  @Input({ required: true }) set name(name: string) {
    // the path provided will be something like 'button', so we should find the path
    // that matches the pattern `../../reusable-components/button/button.ts`
    const files = Object.keys(this.snippets).filter(key => key.includes(`/${name}/`));

    if (!files) {
      throw new Error(`No snippet found for path: ${name}`);
    }

    this.loadFiles(files);
  }

  private async loadFiles(files: string[]): Promise<void> {
    for (const file of files) {
      let source = (await this.snippets[file]()) as string;
      const filename = file.split('/').pop()!;

      // if the file is index.page.ts then we should replace the select with `app-root`
      if (filename === 'index.page.ts') {
        // replace selector: 'app-*' with selector: 'app-root'
        source = source.replace(/selector: 'app-[^']*'/, "selector: 'app-root'");
      } else {
        // if the source file containers a styles property, we want to add a leading comment indicating how to import the styles
        if (source.includes('styles:')) {
          // find the substring that contains the styles accounting for both single and double quotes and backticks
          const styles = source.match(/styles:\s*(`|'|")([\s\S]*?)\1/)?.[2];

          if (styles) {
            const comment = `\n/* These styles rely on CSS variables that can be imported from ng-primitives/example-theme/index.css in your global styles */`;

            // add the comment before the styles but inside the backticks/double quotes/single quotes
            source = source.replace(styles, `${comment}\n${styles}`);
          }
        }
      }

      // if the filename is index.page.ts, we should use app.ts as the label
      const label = filename === 'index.page.ts' ? 'app.ts' : filename;

      this.files.update(state => {
        state.push({ label, value: source });
        return state;
      });
    }

    // sort the files so app.ts is always first, followed by the items in alphabetical order
    this.files.update(state => {
      state.sort((a, b) => {
        if (a.label === 'app.ts') return -1;
        if (b.label === 'app.ts') return 1;

        // Split by hyphen to prioritize base names first
        const aParts = a.label.split(/[-.]/);
        const bParts = b.label.split(/[-.]/);

        // Compare the base parts first
        const baseComparison = aParts[0].localeCompare(bParts[0]);
        if (baseComparison !== 0) return baseComparison;

        // If base parts are the same, prioritize shorter names first
        return a.label.length - b.label.length;
      });

      return state;
    });

    this.selectedFile.update(() => this.files()[0].label);

    this.changeDetector.detectChanges();
  }

  protected copyToClipboard(): void {
    if (!this.selectedFile()) {
      return;
    }
    const code = this.files().find(file => file.label === this.selectedFile())!.value;
    this.clipboard.copy(code);
  }
}

interface Tab {
  label: string;
  value: string;
}
