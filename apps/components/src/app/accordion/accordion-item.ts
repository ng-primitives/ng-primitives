import { Component, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroChevronDownMini } from '@ng-icons/heroicons/mini';
import {
  NgpAccordionContent,
  NgpAccordionItem,
  NgpAccordionTrigger,
} from 'ng-primitives/accordion';
import { NgpButton } from 'ng-primitives/button';

@Component({
  selector: 'app-accordion-item',
  hostDirectives: [
    {
      directive: NgpAccordionItem,
      inputs: ['ngpAccordionItemValue:value', 'ngpAccordionItemDisabled:disabled'],
    },
  ],
  imports: [NgpAccordionContent, NgpAccordionTrigger, NgpButton, NgIcon],
  providers: [provideIcons({ heroChevronDownMini })],
  template: `
    <button ngpAccordionTrigger ngpButton>
      {{ heading() }}

      <ng-icon name="heroChevronDownMini" />
    </button>
    <div ngpAccordionContent>
      <ng-content />
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    :host:has(+ :host) {
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
      padding: 0 16px;
      box-sizing: border-box;
    }

    [ngpAccordionContent][data-open] {
      animation: slideDown 0.2s ease-in-out forwards;
    }

    [ngpAccordionContent][data-closed] {
      animation: slideUp 0.2s ease-in-out forwards;
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
})
export class AccordionItem {
  /** The accordion item heading */
  readonly heading = input.required<string>();
}
