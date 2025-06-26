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
    [ngpAccordionContent][data-open] {
      animation: slideDown 0.2s ease-in-out forwards;
    }

    [ngpAccordionContent][data-closed] {
      animation: slideUp 0.2s ease-in-out forwards;
    }

    ng-icon[data-open='true'] {
      transform: rotate(180deg);
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
  template: `
    <div
      class="w-full max-w-sm divide-y divide-[var(--ngp-border)] rounded-xl border border-[var(--ngp-border)] bg-[var(--ngp-background)] shadow-[var(--ngp-shadow)]"
      ngpAccordion
      ngpAccordionType="single"
      ngpAccordionCollapsible
    >
      <div #panel1="ngpAccordionItem" ngpAccordionItem ngpAccordionItemValue="item-1">
        <button
          class="flex h-11 w-full items-center justify-between rounded-xl bg-[var(--ngp-background)] px-4 text-sm font-medium text-[var(--ngp-text-primary)] outline-none data-[focus-visible]:ring-2 data-[focus-visible]:ring-[var(--ngp-focus-ring)]"
          ngpAccordionTrigger
          ngpButton
        >
          Would you like to learn more?
          <ng-icon
            class="text-xl text-[var(--ngp-text-secondary)] transition-transform duration-200 ease-in-out"
            [attr.data-open]="panel1.open()"
            name="heroChevronDownMini"
          />
        </button>
        <div class="overflow-hidden text-sm text-[var(--ngp-text-secondary)]" ngpAccordionContent>
          <div class="px-4 pb-4 pt-0">
            If you would like to learn more please reach out to us on GitHub.
          </div>
        </div>
      </div>

      <div #panel2="ngpAccordionItem" ngpAccordionItem ngpAccordionItemValue="item-2">
        <button
          class="flex h-11 w-full items-center justify-between rounded-xl bg-[var(--ngp-background)] px-4 text-sm font-medium text-[var(--ngp-text-primary)] outline-none data-[focus-visible]:ring-2 data-[focus-visible]:ring-[var(--ngp-focus-ring)]"
          ngpAccordionTrigger
          ngpButton
        >
          Can I use this in my project?
          <ng-icon
            class="text-xl text-[var(--ngp-text-secondary)] transition-transform duration-200 ease-in-out"
            [attr.data-open]="panel2.open()"
            name="heroChevronDownMini"
          />
        </button>
        <div class="overflow-hidden text-sm text-[var(--ngp-text-secondary)]" ngpAccordionContent>
          <div class="px-4 pb-4 pt-0">
            Yes, this is open source and you can use it in your project.
          </div>
        </div>
      </div>
    </div>
  `,
})
export default class AccordionTailwind {}
