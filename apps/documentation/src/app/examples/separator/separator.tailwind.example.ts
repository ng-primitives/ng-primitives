import { Component } from '@angular/core';
import { NgpSeparator } from 'ng-primitives/separator';

@Component({
  selector: 'app-separator-tailwind',
  imports: [NgpSeparator],
  template: `
    <div
      class="flex max-w-[300px] flex-col gap-4 rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-transparent"
    >
      <p class="m-0 text-black dark:text-white">
        The separator primitive can be used to separate content in a layout.
      </p>
      <div class="h-px w-full bg-neutral-200 dark:bg-neutral-800" ngpSeparator></div>
      <p class="m-0 text-black dark:text-white">
        It supports both horizontal and vertical orientations.
      </p>
    </div>
  `,
})
export default class SeparatorTailwindExample {}
