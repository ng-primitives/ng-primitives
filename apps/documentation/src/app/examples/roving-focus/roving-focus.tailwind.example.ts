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
import { NgpRovingFocusGroup, NgpRovingFocusItem } from 'ng-primitives/roving-focus';
import { NgpSeparator } from 'ng-primitives/separator';

@Component({
  selector: 'app-roving-focus-tailwind',
  imports: [NgpRovingFocusGroup, NgpRovingFocusItem, NgIcon, NgpButton, NgpSeparator],
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
      class="flex items-center gap-1 rounded-md bg-white p-1 shadow-sm ring-1 ring-black/5 outline-hidden dark:bg-transparent dark:shadow-sm dark:ring-white/10"
      ngpRovingFocusGroup
      ngpRovingFocusGroupOrientation="horizontal"
      ngpRovingFocusGroupWrap="true"
      ngpRovingFocusGroupHomeEnd="true"
    >
      <button
        class="flex h-8 w-8 items-center justify-center rounded-xs border border-transparent bg-transparent outline-hidden transition-colors duration-150 data-focus-visible:outline-2 data-focus-visible:outline-blue-500 data-hover:border-gray-200 data-hover:bg-gray-100 data-press:bg-gray-200 dark:data-hover:border-zinc-700 dark:data-hover:bg-zinc-800 dark:data-press:bg-zinc-700"
        type="button"
        ngpButton
        ngpRovingFocusItem
      >
        <ng-icon class="text-lg text-gray-900 dark:text-gray-100" name="heroDocument" />
      </button>
      <button
        class="flex h-8 w-8 items-center justify-center rounded-xs border border-transparent bg-transparent outline-hidden transition-colors duration-150 data-focus-visible:outline-2 data-focus-visible:outline-blue-500 data-hover:border-gray-200 data-hover:bg-gray-100 data-press:bg-gray-200 dark:data-hover:border-zinc-700 dark:data-hover:bg-zinc-800 dark:data-press:bg-zinc-700"
        type="button"
        ngpButton
        ngpRovingFocusItem
      >
        <ng-icon class="text-lg text-gray-900 dark:text-gray-100" name="heroFolder" />
      </button>

      <div class="mx-1 h-6 w-px bg-gray-300 dark:bg-gray-800" ngpSeparator></div>

      <button
        class="flex h-8 w-8 items-center justify-center rounded-xs border border-transparent bg-transparent outline-hidden transition-colors duration-150 data-focus-visible:outline-2 data-focus-visible:outline-blue-500 data-hover:border-gray-200 data-hover:bg-gray-100 data-press:bg-gray-200 dark:data-hover:border-zinc-700 dark:data-hover:bg-zinc-800 dark:data-press:bg-zinc-700"
        type="button"
        ngpButton
        ngpRovingFocusItem
      >
        <ng-icon class="text-lg text-gray-900 dark:text-gray-100" name="heroBars3BottomLeft" />
      </button>

      <button
        class="flex h-8 w-8 items-center justify-center rounded-xs border border-transparent bg-transparent outline-hidden transition-colors duration-150 data-focus-visible:outline-2 data-focus-visible:outline-blue-500 data-hover:border-gray-200 data-hover:bg-gray-100 data-press:bg-gray-200 dark:data-hover:border-zinc-700 dark:data-hover:bg-zinc-800 dark:data-press:bg-zinc-700"
        type="button"
        ngpButton
        ngpRovingFocusItem
      >
        <ng-icon class="text-lg text-gray-900 dark:text-gray-100" name="heroBars3" />
      </button>

      <button
        class="flex h-8 w-8 items-center justify-center rounded-xs border border-transparent bg-transparent outline-hidden transition-colors duration-150 data-focus-visible:outline-2 data-focus-visible:outline-blue-500 data-hover:border-gray-200 data-hover:bg-gray-100 data-press:bg-gray-200 dark:data-hover:border-zinc-700 dark:data-hover:bg-zinc-800 dark:data-press:bg-zinc-700"
        type="button"
        ngpButton
        ngpRovingFocusItem
      >
        <ng-icon class="text-lg text-gray-900 dark:text-gray-100" name="heroBars3BottomRight" />
      </button>

      <div class="mx-1 h-6 w-px bg-gray-300 dark:bg-gray-800" ngpSeparator></div>

      <button
        class="flex h-8 w-8 items-center justify-center rounded-xs border border-transparent bg-transparent outline-hidden transition-colors duration-150 data-focus-visible:outline-2 data-focus-visible:outline-blue-500 data-hover:border-gray-200 data-hover:bg-gray-100 data-press:bg-gray-200 dark:data-hover:border-zinc-700 dark:data-hover:bg-zinc-800 dark:data-press:bg-zinc-700"
        type="button"
        ngpButton
        ngpRovingFocusItem
      >
        <ng-icon class="text-lg text-gray-900 dark:text-gray-100" name="heroCog6Tooth" />
      </button>
    </div>
  `,
})
export default class RovingFocusTailwindExample {}
