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
      --accordion-border-color: #e5e7eb;
      --accordion-background-color: #fff;
      --accordion-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
      --accordion-separator-color: #e5e7eb;
      --accordion-trigger-color: #0a0a0a;
      --accordion-trigger-background-color: #fff;
      --accordion-trigger-focus-shadow: 0 0 0 2px #3b82f6;
      --accordion-content-color: #737373;
      --accordion-icon-color: #737373;

      --accordion-border-color-dark: #3f3f46;
      --accordion-background-color-dark: #18181b;
      --accordion-shadow-dark: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
      --accordion-separator-color-dark: #3f3f46;
      --accordion-trigger-color-dark: #fff;
      --accordion-trigger-background-color-dark: #18181b;
      --accordion-trigger-focus-shadow-dark: 0 0 0 2px #3b82f6;
      --accordion-content-color-dark: #e4e4e7;
      --accordion-icon-color-dark: #e4e4e7;
    }

    :host {
      display: flex;
      justify-content: center;
      width: 100%;
    }

    [ngpAccordion] {
      width: 100%;
      max-width: 24rem;
      border-radius: 0.75rem;
      border: 1px solid
        light-dark(var(--accordion-border-color), var(--accordion-border-color-dark));
      background-color: light-dark(
        var(--accordion-background-color),
        var(--accordion-background-color-dark)
      );
      box-shadow: light-dark(var(--accordion-shadow), var(--accordion-shadow-dark));
    }

    [ngpAccordionItem]:has(+ [ngpAccordionItem]) {
      border-bottom: 1px solid
        light-dark(var(--accordion-separator-color), var(--accordion-separator-color-dark));
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
      color: light-dark(var(--accordion-trigger-color), var(--accordion-trigger-color-dark));
      background-color: light-dark(
        var(--accordion-trigger-background-color),
        var(--accordion-trigger-background-color-dark)
      );
      border: none;
    }

    [ngpAccordionTrigger][data-focus-visible='true'] {
      box-shadow: light-dark(
        var(--accordion-trigger-focus-shadow),
        var(--accordion-trigger-focus-shadow-dark)
      );
    }

    [ngpAccordionContent] {
      font-size: 0.875rem;
      color: light-dark(var(--accordion-content-color), var(--accordion-content-color-dark));
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
      color: light-dark(var(--accordion-icon-color), var(--accordion-icon-color-dark));
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
