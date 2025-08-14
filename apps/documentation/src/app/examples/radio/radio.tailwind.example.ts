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
        class="grid h-[66px] cursor-pointer grid-cols-[auto,1fr] grid-rows-2 gap-x-[0.625rem] gap-y-[0.125rem] rounded-lg bg-gray-50 px-4 py-3 text-black shadow outline-none ring-1 ring-black/5 transition-colors duration-200 data-[checked]:bg-black data-[hover]:bg-gray-100 data-[press]:bg-gray-200 data-[checked]:text-white data-[focus-visible]:outline-2 data-[focus-visible]:outline-offset-2 data-[focus-visible]:outline-blue-500 dark:bg-black dark:text-white dark:shadow dark:ring-white/10 dark:data-[checked]:bg-white dark:data-[hover]:bg-zinc-800 dark:data-[press]:bg-zinc-700 dark:data-[checked]:text-black"
        ngpRadioItem
        ngpRadioItemValue="indie"
      >
        <div
          class="group inline-flex h-4 w-4 items-center justify-center self-center rounded-full border border-gray-300 bg-white transition-colors duration-200 data-[checked]:border-gray-900 data-[checked]:bg-black dark:border-zinc-700 dark:bg-black dark:data-[checked]:border-black dark:data-[checked]:bg-white"
          ngpRadioIndicator
        >
          <span
            class="h-2 w-2 rounded-full bg-white transition-colors group-[data-checked]:bg-white dark:group-[data-checked]:bg-black"
          ></span>
        </div>
        <p class="title col-start-2 row-start-1 m-0 text-sm font-medium leading-5">Indie Plan</p>
        <p class="description col-start-2 row-start-2 m-0 text-xs leading-4">
          For those who want to are just starting out
        </p>
      </div>

      <div
        class="grid h-[66px] cursor-pointer grid-cols-[auto,1fr] grid-rows-2 gap-x-[0.625rem] gap-y-[0.125rem] rounded-lg bg-gray-50 px-4 py-3 text-black shadow outline-none ring-1 ring-black/5 transition-colors duration-200 data-[checked]:bg-black data-[hover]:bg-gray-100 data-[press]:bg-gray-200 data-[checked]:text-white data-[focus-visible]:outline-2 data-[focus-visible]:outline-offset-2 data-[focus-visible]:outline-blue-500 dark:bg-black dark:text-white dark:shadow dark:ring-white/10 dark:data-[checked]:bg-white dark:data-[hover]:bg-zinc-800 dark:data-[press]:bg-zinc-700 dark:data-[checked]:text-black"
        ngpRadioItem
        ngpRadioItemValue="growth"
      >
        <div
          class="group inline-flex h-4 w-4 items-center justify-center self-center rounded-full border border-gray-300 bg-white transition-colors duration-200 data-[checked]:border-gray-900 data-[checked]:bg-black dark:border-zinc-700 dark:bg-black dark:data-[checked]:border-black dark:data-[checked]:bg-white"
          ngpRadioIndicator
        >
          <span
            class="h-2 w-2 rounded-full bg-white transition-colors group-[data-checked]:bg-white dark:group-[data-checked]:bg-black"
          ></span>
        </div>
        <p class="title col-start-2 row-start-1 m-0 text-sm font-medium leading-5">Growth Plan</p>
        <p class="description col-start-2 row-start-2 m-0 text-xs leading-4">
          For those who want to grow their business
        </p>
      </div>

      <div
        class="grid h-[66px] cursor-pointer grid-cols-[auto,1fr] grid-rows-2 gap-x-[0.625rem] gap-y-[0.125rem] rounded-lg bg-gray-50 px-4 py-3 text-black shadow outline-none ring-1 ring-black/5 transition-colors duration-200 data-[checked]:bg-black data-[hover]:bg-gray-100 data-[press]:bg-gray-200 data-[checked]:text-white data-[focus-visible]:outline-2 data-[focus-visible]:outline-offset-2 data-[focus-visible]:outline-blue-500 dark:bg-black dark:text-white dark:shadow dark:ring-white/10 dark:data-[checked]:bg-white dark:data-[hover]:bg-zinc-800 dark:data-[press]:bg-zinc-700 dark:data-[checked]:text-black"
        ngpRadioItem
        ngpRadioItemValue="unicorn"
      >
        <div
          class="group inline-flex h-4 w-4 items-center justify-center self-center rounded-full border border-gray-300 bg-white transition-colors duration-200 data-[checked]:border-gray-900 data-[checked]:bg-black dark:border-zinc-700 dark:bg-black dark:data-[checked]:border-black dark:data-[checked]:bg-white"
          ngpRadioIndicator
        >
          <span
            class="h-2 w-2 rounded-full bg-white transition-colors group-[data-checked]:bg-white dark:group-[data-checked]:bg-black"
          ></span>
        </div>
        <p class="title col-start-2 row-start-1 m-0 text-sm font-medium leading-5">Unicorn Plan</p>
        <p class="description col-start-2 row-start-2 m-0 text-xs leading-4">
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
