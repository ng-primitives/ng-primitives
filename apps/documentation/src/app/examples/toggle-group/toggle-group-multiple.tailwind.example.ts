import { Component } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroBold,
  heroItalic,
  heroStrikethrough,
  heroUnderline,
} from '@ng-icons/heroicons/outline';
import { NgpButton } from 'ng-primitives/button';
import { NgpToggleGroup, NgpToggleGroupItem } from 'ng-primitives/toggle-group';

@Component({
  selector: 'app-toggle-group',
  imports: [NgpToggleGroup, NgpToggleGroupItem, NgpButton, NgIcon],
  providers: [provideIcons({ heroBold, heroItalic, heroStrikethrough, heroUnderline })],
  template: `
    <div
      class="flex items-center gap-x-1 rounded-[0.625rem] bg-white p-1 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.1),0_1px_2px_0_rgba(0,0,0,0.04)] dark:bg-zinc-950 dark:shadow-[inset_0_0_0_1px_#27272a,0_1px_2px_0_rgba(0,0,0,0.04)]"
      ngpToggleGroup
      ngpToggleGroupType="multiple"
      aria-label="Text formatting"
    >
      <button
        class="flex h-8 w-8 items-center justify-center rounded border border-transparent bg-transparent text-lg text-gray-900 transition-colors duration-150 outline-none data-focus-visible:outline-2 data-focus-visible:outline-blue-500 data-hover:border-black/10 data-hover:bg-gray-50 data-press:bg-gray-100 data-selected:border-transparent data-selected:bg-[#f01e2b] data-selected:text-white data-selected:data-hover:bg-[#d81825] data-selected:data-hover:text-white dark:text-gray-100 dark:data-focus-visible:outline-blue-400 dark:data-hover:border-zinc-800 dark:data-hover:bg-zinc-900 dark:data-press:bg-zinc-800 dark:data-selected:bg-[#ff4651] dark:data-selected:data-hover:bg-[#ff5d67]"
        ngpButton
        ngpToggleGroupItem
        ngpToggleGroupItemValue="bold"
        aria-label="Bold"
      >
        <ng-icon name="heroBold" />
      </button>

      <button
        class="flex h-8 w-8 items-center justify-center rounded border border-transparent bg-transparent text-lg text-gray-900 transition-colors duration-150 outline-none data-focus-visible:outline-2 data-focus-visible:outline-blue-500 data-hover:border-black/10 data-hover:bg-gray-50 data-press:bg-gray-100 data-selected:border-transparent data-selected:bg-[#f01e2b] data-selected:text-white data-selected:data-hover:bg-[#d81825] data-selected:data-hover:text-white dark:text-gray-100 dark:data-focus-visible:outline-blue-400 dark:data-hover:border-zinc-800 dark:data-hover:bg-zinc-900 dark:data-press:bg-zinc-800 dark:data-selected:bg-[#ff4651] dark:data-selected:data-hover:bg-[#ff5d67]"
        ngpButton
        ngpToggleGroupItem
        ngpToggleGroupItemValue="italic"
        aria-label="Italic"
      >
        <ng-icon name="heroItalic" />
      </button>

      <button
        class="flex h-8 w-8 items-center justify-center rounded border border-transparent bg-transparent text-lg text-gray-900 transition-colors duration-150 outline-none data-focus-visible:outline-2 data-focus-visible:outline-blue-500 data-hover:border-black/10 data-hover:bg-gray-50 data-press:bg-gray-100 data-selected:border-transparent data-selected:bg-[#f01e2b] data-selected:text-white data-selected:data-hover:bg-[#d81825] data-selected:data-hover:text-white dark:text-gray-100 dark:data-focus-visible:outline-blue-400 dark:data-hover:border-zinc-800 dark:data-hover:bg-zinc-900 dark:data-press:bg-zinc-800 dark:data-selected:bg-[#ff4651] dark:data-selected:data-hover:bg-[#ff5d67]"
        ngpButton
        ngpToggleGroupItem
        ngpToggleGroupItemValue="underline"
        aria-label="Underline"
      >
        <ng-icon name="heroUnderline" />
      </button>

      <button
        class="flex h-8 w-8 items-center justify-center rounded border border-transparent bg-transparent text-lg text-gray-900 transition-colors duration-150 outline-none data-focus-visible:outline-2 data-focus-visible:outline-blue-500 data-hover:border-black/10 data-hover:bg-gray-50 data-press:bg-gray-100 data-selected:border-transparent data-selected:bg-[#f01e2b] data-selected:text-white data-selected:data-hover:bg-[#d81825] data-selected:data-hover:text-white dark:text-gray-100 dark:data-focus-visible:outline-blue-400 dark:data-hover:border-zinc-800 dark:data-hover:bg-zinc-900 dark:data-press:bg-zinc-800 dark:data-selected:bg-[#ff4651] dark:data-selected:data-hover:bg-[#ff5d67]"
        ngpButton
        ngpToggleGroupItem
        ngpToggleGroupItemValue="strikethrough"
        aria-label="Strikethrough"
      >
        <ng-icon name="heroStrikethrough" />
      </button>
    </div>
  `,
})
export default class ToggleGroupExample {}
