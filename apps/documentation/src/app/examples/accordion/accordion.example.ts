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
  standalone: true,
  selector: 'app-accordion',
  imports: [
    NgpButton,
    NgIcon,
    NgpAccordion,
    NgpAccordionItem,
    NgpAccordionContent,
    NgpAccordionTrigger,
  ],
  viewProviders: [provideIcons({ heroChevronDownMini })],
  styles: `
    :host {
      --accordion-border-color: rgb(229 231 235);
      --accordion-background-color: rgb(255 255 255);
      --accordion-shadow: 0 1px 2px 0 rgba(0 0 0 0.05);
      --accordion-separator-color: rgb(229 231 235);
      --accordion-trigger-color: rgb(10 10 10);
      --accordion-trigger-background-color: rgb(255 255 255);
      --accordion-trigger-outline-focus: rgb(59 130 246);

      --accordion-content-color: rgb(115 115 115);
      --accordion-icon-color: rgb(115 115 115);

      --accordion-border-color-dark: rgb(63 63 70);
      --accordion-background-color-dark: rgb(24 24 27);
      --accordion-shadow-dark: 0 1px 2px 0 rgba(0 0 0 0.05);
      --accordion-separator-color-dark: rgb(63 63 70);
      --accordion-trigger-color-dark: rgb(255 255 255);
      --accordion-trigger-background-color-dark: rgb(24 24 27);
      --accordion-trigger-outline-focus-dark: rgb(59 130 246);
      --accordion-content-color-dark: rgb(228 228 231);
      --accordion-icon-color-dark: rgb(228 228 231);
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
      outline: 2px solid
        light-dark(
          var(--accordion-trigger-outline-focus),
          var(--accordion-trigger-outline-focus-dark)
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
