import { Component } from '@angular/core';
import {
  NgpRadioGroupDirective,
  NgpRadioIndicatorDirective,
  NgpRadioItemDirective,
} from '@ng-primitives/ng-primitives/radio';

@Component({
  standalone: true,
  selector: 'app-radio',
  imports: [NgpRadioGroupDirective, NgpRadioItemDirective, NgpRadioIndicatorDirective],
  template: `
    <div class="flex flex-col gap-y-4" ngpRadioGroup>
      <div
        class="group grid cursor-pointer grid-cols-[auto,1fr] grid-rows-[repeat(2,auto)] gap-x-2.5 gap-y-0.5 rounded-lg bg-white px-4 py-3 shadow outline-none ring-1 ring-black/5 hover:bg-neutral-50 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-100 active:bg-neutral-100 data-[state=checked]:bg-neutral-950"
        ngpRadioItem
        ngpRadioItemValue="indie"
      >
        <div
          class="col-start-1 row-start-1 inline-flex size-4 items-center justify-center self-center rounded-full ring-1 ring-black/10 group-data-[state=checked]:ring-white/50"
          ngpRadioIndicator
        >
          <span class="size-2 rounded-full bg-white"></span>
        </div>

        <p
          class="col-start-2 row-start-1 font-medium text-neutral-950 group-data-[state=checked]:text-white"
        >
          Indie Plan
        </p>
        <p
          class="col-start-2 row-start-2 text-xs text-neutral-600 group-data-[state=checked]:text-neutral-300"
        >
          For those who want to are just starting out
        </p>
      </div>

      <div
        class="group grid cursor-pointer grid-cols-[auto,1fr] grid-rows-[repeat(2,auto)] gap-x-2.5 gap-y-0.5 rounded-lg bg-white px-4 py-3 shadow outline-none ring-1 ring-black/5 hover:bg-neutral-50 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-100 active:bg-neutral-100 data-[state=checked]:bg-neutral-950"
        ngpRadioItem
        ngpRadioItemValue="growth"
      >
        <div
          class="col-start-1 row-start-1 inline-flex size-4 items-center justify-center self-center rounded-full ring-1 ring-black/10 group-data-[state=checked]:ring-white/50"
          ngpRadioIndicator
        >
          <span class="size-2 rounded-full bg-white"></span>
        </div>

        <p
          class="col-start-2 row-start-1 font-medium text-neutral-950 group-data-[state=checked]:text-white"
        >
          Growth Plan
        </p>
        <p
          class="col-start-2 row-start-2 text-xs text-neutral-600 group-data-[state=checked]:text-neutral-300"
        >
          For those who want to grow their business
        </p>
      </div>

      <div
        class="group grid cursor-pointer grid-cols-[auto,1fr] grid-rows-[repeat(2,auto)] gap-x-2.5 gap-y-0.5 rounded-lg bg-white px-4 py-3 shadow outline-none ring-1 ring-black/5 hover:bg-neutral-50 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-100 active:bg-neutral-100 data-[state=checked]:bg-neutral-950"
        ngpRadioItem
        ngpRadioItemValue="unicorn"
      >
        <div
          class="col-start-1 row-start-1 inline-flex size-4 items-center justify-center self-center rounded-full ring-1 ring-black/10 group-data-[state=checked]:ring-white/50"
          ngpRadioIndicator
        >
          <span class="size-2 rounded-full bg-white"></span>
        </div>

        <p
          class="col-start-2 row-start-1 font-medium text-neutral-950 group-data-[state=checked]:text-white"
        >
          Unicorn Plan
        </p>
        <p
          class="col-start-2 row-start-2 text-xs text-neutral-600 group-data-[state=checked]:text-neutral-300"
        >
          For those who are going to the moon
        </p>
      </div>
    </div>
  `,
})
export default class RadioExample {}
