import { Component, signal } from '@angular/core';
import {
  NgpTabButtonDirective,
  NgpTabListDirective,
  NgpTabPanelDirective,
  NgpTabsetDirective,
} from '@ng-primitives/ng-primitives/tabs';

@Component({
  standalone: true,
  selector: 'app-tabs',
  imports: [NgpTabsetDirective, NgpTabListDirective, NgpTabButtonDirective, NgpTabPanelDirective],
  template: `
    <div
      class="w-full max-w-[512px] rounded-xl bg-white px-4 py-2 shadow ring-1 ring-black/5"
      [(ngpTabsetValue)]="selectedTab"
      ngpTabset
    >
      <div class="flex gap-x-4 py-2" ngpTabList>
        <button
          class="w-24 rounded-lg px-3 py-2 shadow outline-none ring-1 ring-black/5 transition-all hover:bg-neutral-50 focus-visible:ring-2 focus-visible:ring-blue-500 data-[state=active]:bg-neutral-950 data-[state=active]:text-white"
          ngpTabButton
          ngpTabButtonValue="overview"
        >
          Overview
        </button>
        <button
          class="w-24 rounded-lg px-3 py-2 shadow outline-none ring-1 ring-black/5 transition-all hover:bg-neutral-50 focus-visible:ring-2 focus-visible:ring-blue-500 data-[state=active]:bg-neutral-950 data-[state=active]:text-white"
          ngpTabButton
          ngpTabButtonValue="features"
        >
          Features
        </button>
        <button
          class="w-24 rounded-lg px-3 py-2 shadow outline-none ring-1 ring-black/5 transition-all hover:bg-neutral-50 focus-visible:ring-2 focus-visible:ring-blue-500 data-[state=active]:bg-neutral-950 data-[state=active]:text-white"
          ngpTabButton
          ngpTabButtonValue="pricing"
        >
          Pricing
        </button>
      </div>

      <div class="py-2" ngpTabPanel ngpTabPanelValue="overview">
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam ultricies lacinia arcu,
          in dignissim magna mollis in. Proin ac faucibus sem. Aliquam sit amet augue non risus
          commodo volutpat id sit amet nisi. Integer posuere nisl in ligula faucibus vestibulum.
          Nulla facilisi. Aliquam erat volutpat.
        </p>
      </div>

      <div class="py-2" ngpTabPanel ngpTabPanelValue="features">
        <p>
          Cras eget sem ac velit pellentesque lobortis at in ex. Vestibulum nisl diam, eleifend eget
          malesuada a, cursus id ante. Morbi fringilla, metus nec consectetur maximus, leo purus
          gravida est, eu fringilla dui quam fermentum sapien. Vivamus tempus ullamcorper lectus,
          nec cursus sapien consectetur vel.
        </p>
      </div>

      <div class="py-2" ngpTabPanel ngpTabPanelValue="pricing">
        <p>
          Praesent vehicula erat ac massa egestas viverra. Pellentesque urna magna, consectetur
          convallis ante vel, posuere aliquet arcu. Duis eu nulla id sapien lobortis bibendum eget
          vel velit. Donec sed nisi ac lacus placerat iaculis. Donec blandit eros sit amet nibh
          accumsan cursus. Morbi sit amet ex et enim tempus porttitor non eu erat.
        </p>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: contents;
    }
  `,
})
export default class TabsExample {
  /**
   * The selected tab
   */
  readonly selectedTab = signal<Tab>('overview');
}

type Tab = 'overview' | 'features' | 'pricing';
