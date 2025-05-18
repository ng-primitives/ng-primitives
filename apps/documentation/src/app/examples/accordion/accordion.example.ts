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
    :host {
      display: flex;
      justify-content: center;
      width: 100%;
    }

    [ngpAccordion] {
      width: 100%;
      max-width: 24rem;
      border-radius: 0.75rem;
      border: 1px solid var(--ngp-border);
      background-color: var(--ngp-background);
      box-shadow: var(--ngp-shadow);
    }

    [ngpAccordionItem]:has(+ [ngpAccordionItem]) {
      border-bottom: 1px solid var(--ngp-border);
    }

    [ngpAccordionTrigger] {
      display: flex;
      padding-left: 1rem;
      padding-right: 1rem;
      font-size: 0.875rem;
      line-height: 1.25rem;
      font-weight: 500;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      height: 2.75rem;
      border-radius: 0.75rem;
      outline: none;
      color: var(--ngp-text-primary);
      background-color: var(--ngp-background);
      border: none;
    }

    [ngpAccordionTrigger][data-focus-visible] {
      outline: 2px solid var(--ngp-focus-ring);
    }

    [ngpAccordionContent] {
      font-size: 0.875rem;
      color: var(--ngp-text-secondary);
      overflow: hidden;
    }

    [ngpAccordionContent][data-open] {
      animation: slideDown 0.2s ease-in-out forwards;
    }

    [ngpAccordionContent][data-closed] {
      animation: slideUp 0.2s ease-in-out forwards;
    }

    .accordion-content {
      padding: 0 16px 16px;
    }

    ng-icon {
      font-size: 1.25rem;
      color: var(--ngp-text-secondary);
    }

    [ngpAccordionTrigger][data-open] ng-icon {
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
    <div ngpAccordion ngpAccordionType="single" ngpAccordionCollapsible>
      <div #panel1="ngpAccordionItem" ngpAccordionItem ngpAccordionItemValue="item-1">
        <button ngpAccordionTrigger ngpButton>
          Would you like to learn more?

          <ng-icon [attr.data-open]="panel1.open()" name="heroChevronDownMini" />
        </button>
        <div ngpAccordionContent>
          <div class="accordion-content">
            If you would like to learn more please reach out to us on GitHub.
          </div>
        </div>
      </div>

      <div #panel2="ngpAccordionItem" ngpAccordionItem ngpAccordionItemValue="item-2">
        <button ngpAccordionTrigger ngpButton>
          Can I use this in my project?

          <ng-icon [attr.data-open]="panel2.open()" name="heroChevronDownMini" />
        </button>
        <div ngpAccordionContent>
          <div class="accordion-content">
            Yes, this is open source and you can use it in your project.
          </div>
        </div>
      </div>
    </div>
  `,
})
export default class AccordionExample {}
