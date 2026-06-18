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
      overflow: hidden;
    }

    [ngpAccordionItem]:has(+ [ngpAccordionItem]) {
      border-bottom: 1px solid var(--ngp-border);
    }

    /* Reset default heading margins inside accordion items to avoid layout shifts */
    [ngpAccordionItem] h3 {
      margin: 0;
    }

    [ngpAccordionTrigger] {
      display: flex;
      gap: 0.75rem;
      padding-left: 1rem;
      padding-right: 1rem;
      font-size: 0.875rem;
      line-height: 1.25rem;
      font-weight: 510;
      letter-spacing: -0.006em;
      text-align: left;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      height: 3rem;
      outline: none;
      cursor: pointer;
      color: var(--ngp-text-primary);
      background-color: transparent;
      border: none;
      transition: background-color 150ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    [ngpAccordionTrigger][data-hover] {
      background-color: var(--ngp-background-hover);
    }

    [ngpAccordionTrigger][data-focus-visible] {
      outline: 2px solid var(--ngp-focus-ring);
      outline-offset: -2px;
    }

    [ngpAccordionContent] {
      font-size: 0.875rem;
      line-height: 1.5;
      color: var(--ngp-text-secondary);
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

    .accordion-content {
      padding: 0 16px 16px;
    }

    ng-icon {
      flex: none;
      font-size: 1.125rem;
      color: var(--ngp-text-tertiary);
      transition:
        transform 200ms cubic-bezier(0.4, 0, 0.2, 1),
        color 150ms ease;
    }

    [ngpAccordionTrigger][data-hover] ng-icon {
      color: var(--ngp-text-secondary);
    }

    [ngpAccordionTrigger][data-open] ng-icon {
      transform: rotate(180deg);
      color: var(--ngp-text-secondary);
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
        <h3>
          <button ngpAccordionTrigger ngpButton>
            Would you like to learn more?

            <ng-icon [attr.data-open]="panel1.open()" name="heroChevronDownMini" />
          </button>
        </h3>
        <div ngpAccordionContent>
          <div class="accordion-content">
            If you would like to learn more please reach out to us on GitHub.
          </div>
        </div>
      </div>

      <div #panel2="ngpAccordionItem" ngpAccordionItem ngpAccordionItemValue="item-2">
        <h3>
          <button ngpAccordionTrigger ngpButton>
            Can I use this in my project?

            <ng-icon [attr.data-open]="panel2.open()" name="heroChevronDownMini" />
          </button>
        </h3>
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
