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
  template: `
    <div
      class="w-full max-w-sm divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white shadow-md ring-1 ring-black/5 dark:divide-gray-800 dark:border-gray-800 dark:bg-black dark:ring-white/10"
      ngpAccordion
      ngpAccordionType="single"
      ngpAccordionCollapsible
    >
      <div #panel1="ngpAccordionItem" ngpAccordionItem ngpAccordionItemValue="item-1">
        <button
          class="flex h-11 w-full items-center justify-between rounded-xl bg-white px-4 text-sm font-medium text-gray-900 outline-none data-[focus-visible]:ring-2 data-[focus-visible]:ring-blue-500 dark:bg-black dark:text-gray-100"
          ngpAccordionTrigger
          ngpButton
        >
          Would you like to learn more?
          <ng-icon
            class="text-xl text-gray-500 transition-transform duration-200 ease-in-out data-[open=true]:rotate-180 dark:text-gray-400"
            [attr.data-open]="panel1.open()"
            name="heroChevronDownMini"
          />
        </button>
        <div
          class="overflow-hidden text-sm text-gray-500 data-[closed]:animate-[slideUp] data-[open]:animate-[slideDown] dark:text-gray-400"
          ngpAccordionContent
        >
          <div class="px-4 pb-4 pt-0">
            If you would like to learn more please reach out to us on GitHub.
          </div>
        </div>
      </div>

      <div #panel2="ngpAccordionItem" ngpAccordionItem ngpAccordionItemValue="item-2">
        <button
          class="flex h-11 w-full items-center justify-between rounded-xl bg-white px-4 text-sm font-medium text-gray-900 outline-none data-[focus-visible]:ring-2 data-[focus-visible]:ring-blue-500 dark:bg-black dark:text-gray-100"
          ngpAccordionTrigger
          ngpButton
        >
          Can I use this in my project?
          <ng-icon
            class="text-xl text-gray-500 transition-transform duration-200 ease-in-out data-[open=true]:rotate-180 dark:text-gray-400"
            [attr.data-open]="panel2.open()"
            name="heroChevronDownMini"
          />
        </button>
        <div
          class="overflow-hidden text-sm text-gray-500 data-[closed]:animate-[slideUp] data-[open]:animate-[slideDown] dark:text-gray-400"
          ngpAccordionContent
        >
          <div class="px-4 pb-4 pt-0">
            Yes, this is open source and you can use it in your project.
          </div>
        </div>
      </div>
    </div>
  `,
})
export default class AccordionTailwind {}
