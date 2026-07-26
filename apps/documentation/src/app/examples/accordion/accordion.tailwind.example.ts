import { Component } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroChevronDownMini } from '@ng-icons/heroicons/mini';
import {
  NgpAccordion,
  NgpAccordionContent,
  NgpAccordionItem,
  NgpAccordionTrigger,
} from 'ng-primitives/accordion';
import { NgpButton } from 'ng-primitives/button';

@Component({
  selector: 'app-accordion',
  imports: [
    NgpButton,
    NgIcon,
    NgpAccordion,
    NgpAccordionItem,
    NgpAccordionContent,
    NgpAccordionTrigger,
  ],
  providers: [provideIcons({ heroChevronDownMini })],
  styles: `
    [ngpAccordionContent] {
      overflow: hidden;
      height: 0;
    }

    [ngpAccordionContent][data-open] {
      height: var(--ngp-accordion-content-height, 0px);
    }

    [ngpAccordionContent][data-enter] {
      animation: slideDown 0.2s ease-in-out forwards;
    }

    [ngpAccordionContent][data-exit] {
      height: var(--ngp-accordion-content-height, 0px);
      animation: slideUp 0.2s ease-in-out forwards;
    }

    @keyframes slideDown {
      from {
        height: 0;
      }
      to {
        height: var(--ngp-accordion-content-height);
      }
    }

    @keyframes slideUp {
      from {
        height: var(--ngp-accordion-content-height);
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
      class="w-full max-w-sm divide-y divide-black/10 overflow-hidden rounded-xl border border-black/10 bg-white shadow-xs dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950"
      ngpAccordion
      ngpAccordionType="single"
      ngpAccordionCollapsible
    >
      <div #panel1="ngpAccordionItem" ngpAccordionItem ngpAccordionItemValue="item-1">
        <h3 class="m-0!">
          <button
            class="flex h-12 w-full cursor-pointer items-center justify-between gap-3 bg-transparent px-4 text-left text-sm font-medium tracking-[-0.006em] text-zinc-900 outline-hidden transition-colors data-focus-visible:ring-2 data-focus-visible:ring-blue-500 data-focus-visible:ring-inset data-hover:bg-zinc-50 dark:text-zinc-100 dark:data-focus-visible:ring-blue-400 dark:data-hover:bg-zinc-900"
            ngpAccordionTrigger
            ngpButton
          >
            Would you like to learn more?
            <ng-icon
              class="shrink-0 text-lg text-zinc-500! transition-transform duration-200 ease-in-out data-[open=true]:rotate-180 dark:text-zinc-400!"
              [attr.data-open]="panel1.open()"
              name="heroChevronDownMini"
            />
          </button>
        </h3>
        <div class="text-sm/[1.5] text-zinc-600 dark:text-zinc-300" ngpAccordionContent>
          <div class="px-4 pt-0 pb-4">
            If you would like to learn more please reach out to us on GitHub.
          </div>
        </div>
      </div>

      <div #panel2="ngpAccordionItem" ngpAccordionItem ngpAccordionItemValue="item-2">
        <h3 class="m-0!">
          <button
            class="flex h-12 w-full cursor-pointer items-center justify-between gap-3 bg-transparent px-4 text-left text-sm font-medium tracking-[-0.006em] text-zinc-900 outline-hidden transition-colors data-focus-visible:ring-2 data-focus-visible:ring-blue-500 data-focus-visible:ring-inset data-hover:bg-zinc-50 dark:text-zinc-100 dark:data-focus-visible:ring-blue-400 dark:data-hover:bg-zinc-900"
            ngpAccordionTrigger
            ngpButton
          >
            Can I use this in my project?
            <ng-icon
              class="shrink-0 text-lg text-zinc-500! transition-transform duration-200 ease-in-out data-[open=true]:rotate-180 dark:text-zinc-400!"
              [attr.data-open]="panel2.open()"
              name="heroChevronDownMini"
            />
          </button>
        </h3>
        <div class="text-sm/[1.5] text-zinc-600 dark:text-zinc-300" ngpAccordionContent>
          <div class="px-4 pt-0 pb-4">
            Yes, this is open source and you can use it in your project.
          </div>
        </div>
      </div>
    </div>
  `,
})
export default class AccordionExample {}
