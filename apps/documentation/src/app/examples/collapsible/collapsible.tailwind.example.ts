import { Component } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroChevronDownMini } from '@ng-icons/heroicons/mini';
import { NgpButton } from 'ng-primitives/button';
import {
  NgpCollapsible,
  NgpCollapsibleContent,
  NgpCollapsibleTrigger,
} from 'ng-primitives/collapsible';

@Component({
  selector: 'app-collapsible',
  imports: [NgpButton, NgIcon, NgpCollapsible, NgpCollapsibleTrigger, NgpCollapsibleContent],
  providers: [provideIcons({ heroChevronDownMini })],
  styles: `
    [ngpCollapsibleContent] {
      overflow: hidden;
      height: 0;
    }

    [ngpCollapsibleContent][data-open] {
      height: var(--ngp-collapsible-content-height, 0px);
    }

    [ngpCollapsibleContent][data-enter] {
      animation: slideDown 0.2s ease-in-out forwards;
    }

    [ngpCollapsibleContent][data-exit] {
      height: var(--ngp-collapsible-content-height, 0px);
      animation: slideUp 0.2s ease-in-out forwards;
    }

    @keyframes slideDown {
      from {
        height: 0;
      }
      to {
        height: var(--ngp-collapsible-content-height);
      }
    }

    @keyframes slideUp {
      from {
        height: var(--ngp-collapsible-content-height);
      }
      to {
        height: 0;
      }
    }
  `,
  host: {
    class: 'w-full flex justify-center',
  },
  template: `
    <div
      class="w-full max-w-sm overflow-hidden rounded-xl border border-black/10 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-950"
      ngpCollapsible
    >
      <button
        class="group flex h-12 w-full cursor-pointer items-center justify-between gap-3 bg-transparent px-4 text-left text-sm font-medium tracking-[-0.006em] text-zinc-900 outline-hidden transition-colors data-focus-visible:ring-2 data-focus-visible:ring-blue-500 data-focus-visible:ring-inset data-hover:bg-zinc-50 dark:text-zinc-100 dark:data-focus-visible:ring-blue-400 dark:data-hover:bg-zinc-900"
        ngpCollapsibleTrigger
        ngpButton
      >
        What is a headless component library?
        <ng-icon
          class="shrink-0 text-lg text-zinc-500! transition-transform duration-200 ease-in-out group-data-[open]:rotate-180 dark:text-zinc-400!"
          name="heroChevronDownMini"
        />
      </button>
      <div class="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400" ngpCollapsibleContent>
        <div class="px-4 pt-0 pb-4">
          A headless library provides the behaviour and accessibility of a component without any
          styling, leaving you in full control of the markup and design.
        </div>
      </div>
    </div>
  `,
})
export default class CollapsibleExample {}
