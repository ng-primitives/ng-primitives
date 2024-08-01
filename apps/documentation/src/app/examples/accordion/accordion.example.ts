import { Component } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroChevronDownMini } from '@ng-icons/heroicons/mini';
import {
  NgpAccordion,
  NgpAccordionContent,
  NgpAccordionItem,
  NgpAccordionTrigger,
} from 'ng-primitives/accordion';

@Component({
  standalone: true,
  selector: 'app-accordion',
  imports: [NgIcon, NgpAccordion, NgpAccordionItem, NgpAccordionContent, NgpAccordionTrigger],
  viewProviders: [provideIcons({ heroChevronDownMini })],
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
      border: 1px solid light-dark(#e5e7eb, #3f3f46);
      background-color: light-dark(#fff, #18181b);
      box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    }

    [ngpAccordionItem]:has(+ [ngpAccordionItem]) {
      border-bottom: 1px solid light-dark(#e5e5e5, #3f3f46);
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
      color: light-dark(#0a0a0a, #fff);
      background-color: light-dark(#fff, #18181b);
      border: none;
    }

    [ngpAccordionTrigger][data-focus-visible='true'] {
      box-shadow: 0 0 0 2px #3b82f6;
    }

    [ngpAccordionContent] {
      font-size: 0.875rem;
      color: light-dark(737373, #e4e4e7);
      overflow: hidden;
      transition: height 0.3s ease;
    }

    [ngpAccordionContent][data-open='true'] {
      height: var(--ngp-accordion-content-height);
    }

    [ngpAccordionContent][data-open='false'] {
      height: 0;
    }

    .accordion-content {
      padding: 0 12px 16px;
    }

    ng-icon {
      font-size: 1.25rem;
      color: #737373;
    }

    ng-icon[data-open='true'] {
      transform: rotate(180deg);
    }
  `,
  template: `
    <div ngpAccordion ngpAccordionType="single" ngpAccordionCollapsible>
      <div #panel1="ngpAccordionItem" ngpAccordionItem ngpAccordionItemValue="item-1">
        <button ngpAccordionTrigger>
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
        <button ngpAccordionTrigger>
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
