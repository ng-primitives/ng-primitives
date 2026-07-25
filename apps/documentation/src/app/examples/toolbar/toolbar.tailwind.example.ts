import { Component } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroBars3,
  heroBars3BottomLeft,
  heroBars3BottomRight,
  heroCog6Tooth,
  heroDocument,
  heroFolder,
} from '@ng-icons/heroicons/outline';
import { NgpButton } from 'ng-primitives/button';
import { NgpRovingFocusItem } from 'ng-primitives/roving-focus';
import { NgpSeparator } from 'ng-primitives/separator';
import { NgpToggleGroup, NgpToggleGroupItem } from 'ng-primitives/toggle-group';
import { NgpToolbar } from 'ng-primitives/toolbar';

@Component({
  selector: 'app-toolbar',
  imports: [
    NgpRovingFocusItem,
    NgIcon,
    NgpButton,
    NgpToolbar,
    NgpToggleGroup,
    NgpToggleGroupItem,
    NgpSeparator,
  ],
  providers: [
    provideIcons({
      heroDocument,
      heroFolder,
      heroBars3BottomLeft,
      heroBars3,
      heroBars3BottomRight,
      heroCog6Tooth,
    }),
  ],
  template: `
    <div
      class="flex items-center gap-x-1 rounded-[0.625rem] bg-white p-1 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.1),0_1px_2px_0_rgba(0,0,0,0.04)] dark:bg-zinc-950 dark:shadow-[inset_0_0_0_1px_#27272a,0_1px_2px_0_rgba(0,0,0,0.04)]"
      ngpToolbar
    >
      <button
        class="flex h-8 w-8 items-center justify-center rounded-md border border-transparent bg-transparent text-lg text-zinc-900 transition-colors duration-150 outline-none data-focus-visible:outline-2 data-focus-visible:outline-offset-1 data-focus-visible:outline-blue-500 data-hover:border-black/10 data-hover:bg-zinc-50 data-press:bg-zinc-100 data-selected:bg-[#f01e2b] data-selected:text-white dark:text-zinc-100 dark:data-focus-visible:outline-blue-400 dark:data-hover:border-zinc-800 dark:data-hover:bg-zinc-900 dark:data-press:bg-zinc-800 dark:data-selected:bg-[#ff4651]"
        type="button"
        ngpButton
        ngpRovingFocusItem
      >
        <ng-icon name="heroDocument" />
      </button>
      <button
        class="flex h-8 w-8 items-center justify-center rounded-md border border-transparent bg-transparent text-lg text-zinc-900 transition-colors duration-150 outline-none data-focus-visible:outline-2 data-focus-visible:outline-offset-1 data-focus-visible:outline-blue-500 data-hover:border-black/10 data-hover:bg-zinc-50 data-press:bg-zinc-100 data-selected:bg-[#f01e2b] data-selected:text-white dark:text-zinc-100 dark:data-focus-visible:outline-blue-400 dark:data-hover:border-zinc-800 dark:data-hover:bg-zinc-900 dark:data-press:bg-zinc-800 dark:data-selected:bg-[#ff4651]"
        type="button"
        ngpButton
        ngpRovingFocusItem
      >
        <ng-icon name="heroFolder" />
      </button>

      <div class="mx-1 h-6 w-px bg-black/10 dark:bg-zinc-800" ngpSeparator></div>

      <div class="flex gap-x-1" ngpToggleGroup aria-label="Text alignment">
        <button
          class="flex h-8 w-8 items-center justify-center rounded-md border border-transparent bg-transparent text-lg text-zinc-900 transition-colors duration-150 outline-none data-focus-visible:outline-2 data-focus-visible:outline-offset-1 data-focus-visible:outline-blue-500 data-hover:border-black/10 data-hover:bg-zinc-50 data-press:bg-zinc-100 data-selected:bg-[#f01e2b] data-selected:text-white dark:text-zinc-100 dark:data-focus-visible:outline-blue-400 dark:data-hover:border-zinc-800 dark:data-hover:bg-zinc-900 dark:data-press:bg-zinc-800 dark:data-selected:bg-[#ff4651]"
          type="button"
          ngpButton
          ngpToggleGroupItem
          ngpToggleGroupItemValue="left"
          aria-label="Align left"
        >
          <ng-icon name="heroBars3BottomLeft" />
        </button>

        <button
          class="flex h-8 w-8 items-center justify-center rounded-md border border-transparent bg-transparent text-lg text-zinc-900 transition-colors duration-150 outline-none data-focus-visible:outline-2 data-focus-visible:outline-offset-1 data-focus-visible:outline-blue-500 data-hover:border-black/10 data-hover:bg-zinc-50 data-press:bg-zinc-100 data-selected:bg-[#f01e2b] data-selected:text-white dark:text-zinc-100 dark:data-focus-visible:outline-blue-400 dark:data-hover:border-zinc-800 dark:data-hover:bg-zinc-900 dark:data-press:bg-zinc-800 dark:data-selected:bg-[#ff4651]"
          type="button"
          ngpButton
          ngpToggleGroupItem
          ngpToggleGroupItemValue="center"
          aria-label="Align center"
        >
          <ng-icon name="heroBars3" />
        </button>

        <button
          class="flex h-8 w-8 items-center justify-center rounded-md border border-transparent bg-transparent text-lg text-zinc-900 transition-colors duration-150 outline-none data-focus-visible:outline-2 data-focus-visible:outline-offset-1 data-focus-visible:outline-blue-500 data-hover:border-black/10 data-hover:bg-zinc-50 data-press:bg-zinc-100 data-selected:bg-[#f01e2b] data-selected:text-white dark:text-zinc-100 dark:data-focus-visible:outline-blue-400 dark:data-hover:border-zinc-800 dark:data-hover:bg-zinc-900 dark:data-press:bg-zinc-800 dark:data-selected:bg-[#ff4651]"
          type="button"
          ngpButton
          ngpToggleGroupItem
          ngpToggleGroupItemValue="right"
          aria-label="Align right"
        >
          <ng-icon name="heroBars3BottomRight" />
        </button>
      </div>

      <div class="mx-1 h-6 w-px bg-black/10 dark:bg-zinc-800" ngpSeparator></div>

      <button
        class="flex h-8 w-8 items-center justify-center rounded-md border border-transparent bg-transparent text-lg text-zinc-900 transition-colors duration-150 outline-none data-focus-visible:outline-2 data-focus-visible:outline-offset-1 data-focus-visible:outline-blue-500 data-hover:border-black/10 data-hover:bg-zinc-50 data-press:bg-zinc-100 data-selected:bg-[#f01e2b] data-selected:text-white dark:text-zinc-100 dark:data-focus-visible:outline-blue-400 dark:data-hover:border-zinc-800 dark:data-hover:bg-zinc-900 dark:data-press:bg-zinc-800 dark:data-selected:bg-[#ff4651]"
        type="button"
        ngpButton
        ngpRovingFocusItem
      >
        <ng-icon name="heroCog6Tooth" />
      </button>
    </div>
  `,
})
export default class ToolbarExample {}
