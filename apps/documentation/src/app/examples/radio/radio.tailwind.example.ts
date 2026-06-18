import { Component, signal } from '@angular/core';
import { NgpRadioGroup, NgpRadioIndicator, NgpRadioItem } from 'ng-primitives/radio';

@Component({
  selector: 'app-radio-tailwind',
  imports: [NgpRadioGroup, NgpRadioItem, NgpRadioIndicator],
  template: `
    <div
      class="flex flex-col gap-4"
      [(ngpRadioGroupValue)]="plan"
      ngpRadioGroup
      ngpRadioGroupOrientation="vertical"
    >
      <div
        class="group grid h-[66px] cursor-pointer grid-cols-[auto_1fr] grid-rows-2 gap-x-2.5 gap-y-0.5 rounded-[0.625rem] bg-white px-4 py-3 text-black shadow-sm ring-1 ring-black/5 outline-hidden transition-shadow duration-200 data-checked:ring-[1.5px] data-checked:ring-[#f01e2b] data-focus-visible:outline-2 data-focus-visible:outline-offset-2 data-focus-visible:outline-blue-500 dark:bg-zinc-950 dark:text-white dark:shadow-sm dark:ring-white/10 dark:data-checked:ring-[#ff4651] dark:data-focus-visible:outline-blue-400 [&[data-hover]:not([data-checked])]:bg-gray-100 dark:[&[data-hover]:not([data-checked])]:bg-zinc-800 [&[data-press]:not([data-checked])]:bg-gray-200 dark:[&[data-press]:not([data-checked])]:bg-zinc-700"
        ngpRadioItem
        ngpRadioItemValue="indie"
      >
        <div
          class="inline-flex h-4 w-4 items-center justify-center self-center rounded-full border border-gray-300 bg-white transition-colors duration-200 data-checked:border-[#f01e2b] dark:border-zinc-700 dark:bg-transparent dark:data-checked:border-[#ff4651]"
          ngpRadioIndicator
        >
          <span
            class="h-2 w-2 scale-0 rounded-full bg-[#f01e2b] transition-transform group-data-checked:scale-100 dark:bg-[#ff4651]"
          ></span>
        </div>
        <p
          class="title col-start-2 row-start-1 m-0 text-sm leading-5 font-[510] tracking-[-0.006em]"
        >
          Indie Plan
        </p>
        <p
          class="description col-start-2 row-start-2 m-0 text-xs leading-4 tracking-[-0.006em] text-zinc-600 dark:text-zinc-400"
        >
          For those who want to are just starting out
        </p>
      </div>

      <div
        class="group grid h-[66px] cursor-pointer grid-cols-[auto_1fr] grid-rows-2 gap-x-2.5 gap-y-0.5 rounded-[0.625rem] bg-white px-4 py-3 text-black shadow-sm ring-1 ring-black/5 outline-hidden transition-shadow duration-200 data-checked:ring-[1.5px] data-checked:ring-[#f01e2b] data-focus-visible:outline-2 data-focus-visible:outline-offset-2 data-focus-visible:outline-blue-500 dark:bg-zinc-950 dark:text-white dark:shadow-sm dark:ring-white/10 dark:data-checked:ring-[#ff4651] dark:data-focus-visible:outline-blue-400 [&[data-hover]:not([data-checked])]:bg-gray-100 dark:[&[data-hover]:not([data-checked])]:bg-zinc-800 [&[data-press]:not([data-checked])]:bg-gray-200 dark:[&[data-press]:not([data-checked])]:bg-zinc-700"
        ngpRadioItem
        ngpRadioItemValue="growth"
      >
        <div
          class="inline-flex h-4 w-4 items-center justify-center self-center rounded-full border border-gray-300 bg-white transition-colors duration-200 data-checked:border-[#f01e2b] dark:border-zinc-700 dark:bg-transparent dark:data-checked:border-[#ff4651]"
          ngpRadioIndicator
        >
          <span
            class="h-2 w-2 scale-0 rounded-full bg-[#f01e2b] transition-transform group-data-checked:scale-100 dark:bg-[#ff4651]"
          ></span>
        </div>
        <p
          class="title col-start-2 row-start-1 m-0 text-sm leading-5 font-[510] tracking-[-0.006em]"
        >
          Growth Plan
        </p>
        <p
          class="description col-start-2 row-start-2 m-0 text-xs leading-4 tracking-[-0.006em] text-zinc-600 dark:text-zinc-400"
        >
          For those who want to grow their business
        </p>
      </div>

      <div
        class="group grid h-[66px] cursor-pointer grid-cols-[auto_1fr] grid-rows-2 gap-x-2.5 gap-y-0.5 rounded-[0.625rem] bg-white px-4 py-3 text-black shadow-sm ring-1 ring-black/5 outline-hidden transition-shadow duration-200 data-checked:ring-[1.5px] data-checked:ring-[#f01e2b] data-focus-visible:outline-2 data-focus-visible:outline-offset-2 data-focus-visible:outline-blue-500 dark:bg-zinc-950 dark:text-white dark:shadow-sm dark:ring-white/10 dark:data-checked:ring-[#ff4651] dark:data-focus-visible:outline-blue-400 [&[data-hover]:not([data-checked])]:bg-gray-100 dark:[&[data-hover]:not([data-checked])]:bg-zinc-800 [&[data-press]:not([data-checked])]:bg-gray-200 dark:[&[data-press]:not([data-checked])]:bg-zinc-700"
        ngpRadioItem
        ngpRadioItemValue="unicorn"
      >
        <div
          class="inline-flex h-4 w-4 items-center justify-center self-center rounded-full border border-gray-300 bg-white transition-colors duration-200 data-checked:border-[#f01e2b] dark:border-zinc-700 dark:bg-transparent dark:data-checked:border-[#ff4651]"
          ngpRadioIndicator
        >
          <span
            class="h-2 w-2 scale-0 rounded-full bg-[#f01e2b] transition-transform group-data-checked:scale-100 dark:bg-[#ff4651]"
          ></span>
        </div>
        <p
          class="title col-start-2 row-start-1 m-0 text-sm leading-5 font-[510] tracking-[-0.006em]"
        >
          Unicorn Plan
        </p>
        <p
          class="description col-start-2 row-start-2 m-0 text-xs leading-4 tracking-[-0.006em] text-zinc-600 dark:text-zinc-400"
        >
          For those who are going to the moon
        </p>
      </div>
    </div>
  `,
})
export default class RadioTailwindExample {
  readonly plan = signal<Plan>('indie');
}

type Plan = 'indie' | 'growth' | 'unicorn';
