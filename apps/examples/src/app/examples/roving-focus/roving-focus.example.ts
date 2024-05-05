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
import {
  NgpRovingFocusGroupDirective,
  NgpRovingFocusItemDirective,
} from '@ng-primitives/ng-primitives/roving-focus';

@Component({
  standalone: true,
  selector: 'app-roving-focus',
  imports: [NgpRovingFocusGroupDirective, NgpRovingFocusItemDirective, NgIcon],
  viewProviders: [
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
      class="flex items-center gap-x-1 rounded-md bg-white p-1 shadow ring-1 ring-black/5"
      ngpRovingFocusGroup
      ngpRovingFocusGroupOrientation="horizontal"
      ngpRovingFocusGroupWrap="true"
      ngpRovingFocusGroupHomeEnd="true"
    >
      <button
        class="inline-flex size-8 items-center justify-center rounded outline-none transition-all hover:bg-neutral-50 hover:ring-1 hover:ring-black/5 focus-visible:ring-2 focus-visible:ring-blue-500 active:bg-neutral-100"
        type="button"
        ngpRovingFocusItem
      >
        <ng-icon class="text-lg text-neutral-700" name="heroDocument" />
      </button>
      <button
        class="inline-flex size-8 items-center justify-center rounded outline-none transition-all hover:bg-neutral-50 hover:ring-1 hover:ring-black/5 focus-visible:ring-2 focus-visible:ring-blue-500 active:bg-neutral-100"
        type="button"
        ngpRovingFocusItem
      >
        <ng-icon class="text-lg text-neutral-700" name="heroFolder" />
      </button>

      <div class="mx-1 h-6 w-px bg-neutral-200"></div>

      <button
        class="inline-flex size-8 items-center justify-center rounded outline-none transition-all hover:bg-neutral-50 hover:ring-1 hover:ring-black/5 focus-visible:ring-2 focus-visible:ring-blue-500 active:bg-neutral-100"
        type="button"
        ngpRovingFocusItem
      >
        <ng-icon class="text-lg text-neutral-700" name="heroBars3BottomLeft" />
      </button>

      <button
        class="inline-flex size-8 items-center justify-center rounded outline-none transition-all hover:bg-neutral-50 hover:ring-1 hover:ring-black/5 focus-visible:ring-2 focus-visible:ring-blue-500 active:bg-neutral-100"
        type="button"
        ngpRovingFocusItem
      >
        <ng-icon class="text-lg text-neutral-700" name="heroBars3" />
      </button>

      <button
        class="inline-flex size-8 items-center justify-center rounded outline-none transition-all hover:bg-neutral-50 hover:ring-1 hover:ring-black/5 focus-visible:ring-2 focus-visible:ring-blue-500 active:bg-neutral-100"
        type="button"
        ngpRovingFocusItem
      >
        <ng-icon class="text-lg text-neutral-700" name="heroBars3BottomRight" />
      </button>

      <div class="mx-1 h-6 w-px bg-neutral-200"></div>

      <button
        class="inline-flex size-8 items-center justify-center rounded outline-none transition-all hover:bg-neutral-50 hover:ring-1 hover:ring-black/5 focus-visible:ring-2 focus-visible:ring-blue-500 active:bg-neutral-100"
        type="button"
        ngpRovingFocusItem
      >
        <ng-icon class="text-lg text-neutral-700" name="heroCog6Tooth" />
      </button>
    </div>
  `,
})
export default class RovingFocusExample {}
