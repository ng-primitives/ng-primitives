import { Component } from '@angular/core';
import { NgpSeparator } from 'ng-primitives/separator';

@Component({
  selector: 'app-separator-tailwind',
  imports: [NgpSeparator],
  host: {
    class:
      'flex max-w-[300px] flex-col gap-4 rounded-lg border border-black/10 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-950',
  },
  template: `
    <p class="m-0 text-zinc-900 dark:text-zinc-100">
      The separator primitive can be used to separate content in a layout.
    </p>
    <div class="h-px bg-black/10 dark:bg-zinc-800" ngpSeparator></div>
    <p class="m-0 text-zinc-900 dark:text-zinc-100">
      It supports both horizontal and vertical orientations.
    </p>
  `,
})
export default class SeparatorTailwindExample {}
