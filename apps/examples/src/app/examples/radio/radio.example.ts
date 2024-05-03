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
        class="rounded-lg bg-white px-4 py-3 shadow outline-none ring-1 ring-black/5 focus-visible:ring-2 focus-visible:ring-blue-500"
        ngpRadioItem
        ngpRadioItemValue="hobby"
      >
        <p class="font-medium text-zinc-950">Startup Plan</p>
        <p class="text-xs text-zinc-600">For those who want to are just starting out</p>
      </div>

      <div
        class="rounded-lg bg-white px-4 py-3 shadow outline-none ring-1 ring-black/5 focus-visible:ring-2 focus-visible:ring-blue-500"
        ngpRadioItem
        ngpRadioItemValue="business"
      >
        <p class="font-medium text-zinc-950">Business Plan</p>
        <p class="text-xs text-zinc-600">For those who want to start a business</p>
      </div>

      <div
        class="rounded-lg bg-white px-4 py-3 shadow outline-none ring-1 ring-black/5 focus-visible:ring-2 focus-visible:ring-blue-500"
        ngpRadioItem
        ngpRadioItemValue="enterprise"
      >
        <p class="font-medium text-zinc-950">Enterprise Plan</p>
        <p class="text-xs text-zinc-600">For those who want to scale their business</p>
      </div>
    </div>
  `,
})
export default class RadioExample {}
