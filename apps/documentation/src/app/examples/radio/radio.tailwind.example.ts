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
        class="group grid cursor-pointer grid-cols-[auto_1fr] grid-rows-[repeat(2,auto)] gap-x-2.5 gap-y-0.5 rounded-[0.625rem] bg-white px-4 py-3 shadow-[0_1px_3px_0_rgb(0_0_0/0.1),0_1px_2px_-1px_rgb(0_0_0/0.1),0_0_0_1px_rgb(0_0_0/0.05)] transition-shadow duration-150 outline-none data-checked:shadow-[0_1px_3px_0_rgb(0_0_0/0.1),0_1px_2px_-1px_rgb(0_0_0/0.1),0_0_0_1px_rgb(0_0_0/0.05),inset_0_0_0_1.5px_#f01e2b] data-focus-visible:outline-2 data-focus-visible:outline-offset-2 data-focus-visible:outline-blue-500 data-hover:bg-zinc-50 data-press:bg-zinc-100 dark:bg-zinc-950 dark:shadow-[0_1px_3px_0_rgb(255_255_255/0.1),0_1px_2px_-1px_rgb(255_255_255/0.1),0_0_0_1px_rgb(255_255_255/0.05)] dark:data-checked:shadow-[0_1px_3px_0_rgb(255_255_255/0.1),0_1px_2px_-1px_rgb(255_255_255/0.1),0_0_0_1px_rgb(255_255_255/0.05),inset_0_0_0_1.5px_#ff4651] dark:data-focus-visible:outline-blue-400 dark:data-hover:bg-zinc-900 dark:data-press:bg-zinc-800"
        ngpRadioItem
        ngpRadioItemValue="indie"
      >
        <div
          class="inline-flex h-4 w-4 items-center justify-center self-center rounded-full border border-black/10 transition-colors duration-200 group-data-checked:border-[#f01e2b] dark:border-zinc-800 dark:group-data-checked:border-[#ff4651]"
          ngpRadioIndicator
        >
          <span
            class="h-2 w-2 scale-0 rounded-full bg-[#f01e2b] transition-transform group-data-checked:scale-100 dark:bg-[#ff4651]"
          ></span>
        </div>
        <p
          class="col-start-2 row-start-1 m-0 font-[510] tracking-[-0.006em] text-zinc-900 dark:text-zinc-100"
        >
          Indie Plan
        </p>
        <p
          class="col-start-2 row-start-2 m-0 text-xs/4! tracking-[-0.006em] text-zinc-600 dark:text-zinc-300"
        >
          For those who want to are just starting out
        </p>
      </div>

      <div
        class="group grid cursor-pointer grid-cols-[auto_1fr] grid-rows-[repeat(2,auto)] gap-x-2.5 gap-y-0.5 rounded-[0.625rem] bg-white px-4 py-3 shadow-[0_1px_3px_0_rgb(0_0_0/0.1),0_1px_2px_-1px_rgb(0_0_0/0.1),0_0_0_1px_rgb(0_0_0/0.05)] transition-shadow duration-150 outline-none data-checked:shadow-[0_1px_3px_0_rgb(0_0_0/0.1),0_1px_2px_-1px_rgb(0_0_0/0.1),0_0_0_1px_rgb(0_0_0/0.05),inset_0_0_0_1.5px_#f01e2b] data-focus-visible:outline-2 data-focus-visible:outline-offset-2 data-focus-visible:outline-blue-500 data-hover:bg-zinc-50 data-press:bg-zinc-100 dark:bg-zinc-950 dark:shadow-[0_1px_3px_0_rgb(255_255_255/0.1),0_1px_2px_-1px_rgb(255_255_255/0.1),0_0_0_1px_rgb(255_255_255/0.05)] dark:data-checked:shadow-[0_1px_3px_0_rgb(255_255_255/0.1),0_1px_2px_-1px_rgb(255_255_255/0.1),0_0_0_1px_rgb(255_255_255/0.05),inset_0_0_0_1.5px_#ff4651] dark:data-focus-visible:outline-blue-400 dark:data-hover:bg-zinc-900 dark:data-press:bg-zinc-800"
        ngpRadioItem
        ngpRadioItemValue="growth"
      >
        <div
          class="inline-flex h-4 w-4 items-center justify-center self-center rounded-full border border-black/10 transition-colors duration-200 group-data-checked:border-[#f01e2b] dark:border-zinc-800 dark:group-data-checked:border-[#ff4651]"
          ngpRadioIndicator
        >
          <span
            class="h-2 w-2 scale-0 rounded-full bg-[#f01e2b] transition-transform group-data-checked:scale-100 dark:bg-[#ff4651]"
          ></span>
        </div>
        <p
          class="col-start-2 row-start-1 m-0 font-[510] tracking-[-0.006em] text-zinc-900 dark:text-zinc-100"
        >
          Growth Plan
        </p>
        <p
          class="col-start-2 row-start-2 m-0 text-xs/4! tracking-[-0.006em] text-zinc-600 dark:text-zinc-300"
        >
          For those who want to grow their business
        </p>
      </div>

      <div
        class="group grid cursor-pointer grid-cols-[auto_1fr] grid-rows-[repeat(2,auto)] gap-x-2.5 gap-y-0.5 rounded-[0.625rem] bg-white px-4 py-3 shadow-[0_1px_3px_0_rgb(0_0_0/0.1),0_1px_2px_-1px_rgb(0_0_0/0.1),0_0_0_1px_rgb(0_0_0/0.05)] transition-shadow duration-150 outline-none data-checked:shadow-[0_1px_3px_0_rgb(0_0_0/0.1),0_1px_2px_-1px_rgb(0_0_0/0.1),0_0_0_1px_rgb(0_0_0/0.05),inset_0_0_0_1.5px_#f01e2b] data-focus-visible:outline-2 data-focus-visible:outline-offset-2 data-focus-visible:outline-blue-500 data-hover:bg-zinc-50 data-press:bg-zinc-100 dark:bg-zinc-950 dark:shadow-[0_1px_3px_0_rgb(255_255_255/0.1),0_1px_2px_-1px_rgb(255_255_255/0.1),0_0_0_1px_rgb(255_255_255/0.05)] dark:data-checked:shadow-[0_1px_3px_0_rgb(255_255_255/0.1),0_1px_2px_-1px_rgb(255_255_255/0.1),0_0_0_1px_rgb(255_255_255/0.05),inset_0_0_0_1.5px_#ff4651] dark:data-focus-visible:outline-blue-400 dark:data-hover:bg-zinc-900 dark:data-press:bg-zinc-800"
        ngpRadioItem
        ngpRadioItemValue="unicorn"
      >
        <div
          class="inline-flex h-4 w-4 items-center justify-center self-center rounded-full border border-black/10 transition-colors duration-200 group-data-checked:border-[#f01e2b] dark:border-zinc-800 dark:group-data-checked:border-[#ff4651]"
          ngpRadioIndicator
        >
          <span
            class="h-2 w-2 scale-0 rounded-full bg-[#f01e2b] transition-transform group-data-checked:scale-100 dark:bg-[#ff4651]"
          ></span>
        </div>
        <p
          class="col-start-2 row-start-1 m-0 font-[510] tracking-[-0.006em] text-zinc-900 dark:text-zinc-100"
        >
          Unicorn Plan
        </p>
        <p
          class="col-start-2 row-start-2 m-0 text-xs/4! tracking-[-0.006em] text-zinc-600 dark:text-zinc-300"
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
