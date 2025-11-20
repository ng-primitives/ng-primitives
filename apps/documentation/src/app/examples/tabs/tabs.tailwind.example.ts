import { Component, signal } from '@angular/core';
import { NgpTabButton, NgpTabList, NgpTabPanel, NgpTabset } from 'ng-primitives/tabs';

@Component({
  selector: 'app-tabs-tailwind',
  standalone: true,
  imports: [NgpTabset, NgpTabList, NgpTabButton, NgpTabPanel],
  template: `
    <div
      class="w-full max-w-[512px] rounded-xl bg-white px-4 py-1 shadow-sm ring-1 ring-black/5 dark:bg-transparent dark:ring-white/10"
      [(ngpTabsetValue)]="selectedTab"
      ngpTabset
    >
      <div class="flex gap-6 border-b border-neutral-200/60 dark:border-neutral-700/60" ngpTabList>
        <button
          class="border-b-2 border-transparent bg-transparent py-2 text-neutral-600 outline-hidden transition-colors duration-150 ease-in-out data-active:border-black data-active:text-neutral-900 data-disabled:cursor-not-allowed data-disabled:text-neutral-400 data-focus-visible:ring-2 data-focus-visible:ring-blue-500 dark:text-neutral-300 dark:data-active:border-white dark:data-active:text-neutral-100 dark:data-disabled:text-neutral-600"
          ngpTabButton
          ngpTabButtonValue="overview"
        >
          Overview
        </button>
        <button
          class="border-b-2 border-transparent bg-transparent py-2 text-neutral-600 outline-hidden transition-colors duration-150 ease-in-out data-active:border-black data-active:text-neutral-900 data-disabled:cursor-not-allowed data-disabled:text-neutral-400 data-focus-visible:ring-2 data-focus-visible:ring-blue-500 dark:text-neutral-300 dark:data-active:border-white dark:data-active:text-neutral-100 dark:data-disabled:text-neutral-600"
          ngpTabButton
          ngpTabButtonValue="features"
        >
          Features
        </button>
        <button
          class="border-b-2 border-transparent bg-transparent py-2 text-neutral-600 outline-hidden transition-colors duration-150 ease-in-out data-active:border-black data-active:text-neutral-900 data-disabled:cursor-not-allowed data-disabled:text-neutral-400 data-focus-visible:ring-2 data-focus-visible:ring-blue-500 dark:text-neutral-300 dark:data-active:border-white dark:data-active:text-neutral-100 dark:data-disabled:text-neutral-600"
          ngpTabButton
          ngpTabButtonValue="pricing"
        >
          Pricing
        </button>
        <button
          class="border-b-2 border-transparent bg-transparent py-2 text-neutral-600 outline-hidden transition-colors duration-150 ease-in-out data-active:border-black data-active:text-neutral-900 data-disabled:cursor-not-allowed data-disabled:text-neutral-400 data-focus-visible:ring-2 data-focus-visible:ring-blue-500 dark:text-neutral-300 dark:data-active:border-white dark:data-active:text-neutral-100 dark:data-disabled:text-neutral-600"
          ngpTabButton
          ngpTabButtonValue="disabled"
          ngpTabButtonDisabled
        >
          Disabled
        </button>
      </div>

      <div
        class="hidden py-2 text-neutral-700 data-active:block dark:text-neutral-300"
        ngpTabPanel
        ngpTabPanelValue="overview"
      >
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam ultricies lacinia arcu,
          in dignissim magna mollis in. Proin ac faucibus sem. Aliquam sit amet augue non risus
          commodo volutpat id sit amet nisi. Integer posuere nisl in ligula faucibus vestibulum.
          Nulla facilisi. Aliquam erat volutpat.
        </p>
      </div>

      <div
        class="hidden py-2 text-neutral-700 data-active:block dark:text-neutral-300"
        ngpTabPanel
        ngpTabPanelValue="features"
      >
        <p>
          Cras eget sem ac velit pellentesque lobortis at in ex. Vestibulum nisl diam, eleifend eget
          malesuada a, cursus id ante. Morbi fringilla, metus nec consectetur maximus, leo purus
          gravida est, eu fringilla dui quam fermentum sapien. Vivamus tempus ullamcorper lectus,
          nec cursus sapien consectetur vel.
        </p>
      </div>

      <div
        class="hidden py-2 text-neutral-700 data-active:block dark:text-neutral-300"
        ngpTabPanel
        ngpTabPanelValue="pricing"
      >
        <p>
          Praesent vehicula erat ac massa egestas viverra. Pellentesque urna magna, consectetur
          convallis ante vel, posuere aliquet arcu. Duis eu nulla id sapien lobortis bibendum eget
          vel velit. Donec sed nisi ac lacus placerat iaculis. Donec blandit eros sit amet nibh
          accumsan cursus. Morbi sit amet ex et enim tempus porttitor non eu erat.
        </p>
      </div>
      <div
        class="hidden py-2 text-neutral-700 data-active:block dark:text-neutral-300"
        ngpTabPanel
        ngpTabPanelValue="disabled"
      >
        <p>Disabled content</p>
      </div>
    </div>
  `,
})
export default class TabsTailwindExample {
  /**
   * The selected tab
   */
  readonly selectedTab = signal<Tab>('overview');
}

type Tab = 'overview' | 'features' | 'pricing';
