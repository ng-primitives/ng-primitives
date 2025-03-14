/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { KeyValuePipe } from '@angular/common';
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
import { lucideClipboard, lucideCodesandbox } from '@ng-icons/lucide';
import * as prismjs from 'prismjs';

const { highlight, languages } = prismjs;

@Component({
  selector: 'docs-snippet',
  imports: [NgIcon, KeyValuePipe],
  templateUrl: './snippet.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideIcons({ lucideCodesandbox, lucideClipboard })],
})
export class Snippet {
  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly snippets = import.meta.glob!('../../reusable-components/**/*.ts', {
    import: 'default',
    query: '?source',
  });

  readonly files = signal<Record<string, string>>({});

  readonly selectedFile = signal<string | null>(null);

  readonly code = computed(() => {
    const files = this.files();
    const selectedFile = this.selectedFile();

    if (!selectedFile || !files[selectedFile]) {
      return '';
    }

    const code = this.files()[selectedFile];
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
      const source = (await this.snippets[file]()) as string;
      const filename = file.split('/').pop()!;

      this.files.update(state => {
        state[filename] = source;
        return state;
      });
    }

    this.selectedFile.update(() => Object.keys(this.files())[0]);

    this.changeDetector.detectChanges();
  }
}
