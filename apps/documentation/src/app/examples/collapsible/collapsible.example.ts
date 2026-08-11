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
    :host {
      display: flex;
      justify-content: center;
      width: 100%;
    }

    [ngpCollapsible] {
      width: 100%;
      max-width: 24rem;
      border-radius: 0.75rem;
      border: 1px solid var(--ngp-border);
      background-color: var(--ngp-background);
      box-shadow: var(--ngp-shadow);
      overflow: hidden;
    }

    [ngpCollapsibleTrigger] {
      display: flex;
      gap: 0.75rem;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      height: 3rem;
      padding: 0 1rem;
      font-size: 0.875rem;
      line-height: 1.25rem;
      font-weight: 510;
      letter-spacing: -0.006em;
      text-align: left;
      color: var(--ngp-text-primary);
      background-color: transparent;
      border: none;
      outline: none;
      cursor: pointer;
      transition: background-color 150ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    [ngpCollapsibleTrigger][data-hover] {
      background-color: var(--ngp-background-hover);
    }

    [ngpCollapsibleTrigger][data-focus-visible] {
      outline: 2px solid var(--ngp-focus-ring);
      outline-offset: -2px;
    }

    [ngpCollapsibleContent] {
      font-size: 0.875rem;
      line-height: 1.5;
      color: var(--ngp-text-secondary);
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

    .collapsible-content {
      padding: 0 1rem 1rem;
    }

    ng-icon {
      flex: none;
      font-size: 1.125rem;
      color: var(--ngp-text-tertiary);
      transition:
        transform 200ms cubic-bezier(0.4, 0, 0.2, 1),
        color 150ms ease;
    }

    [ngpCollapsibleTrigger][data-hover] ng-icon {
      color: var(--ngp-text-secondary);
    }

    [ngpCollapsibleTrigger][data-open] ng-icon {
      transform: rotate(180deg);
      color: var(--ngp-text-secondary);
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
  template: `
    <div ngpCollapsible>
      <button ngpCollapsibleTrigger ngpButton>
        What is a headless component library?

        <ng-icon name="heroChevronDownMini" />
      </button>
      <div ngpCollapsibleContent>
        <div class="collapsible-content">
          A headless library provides the behaviour and accessibility of a component without any
          styling, leaving you in full control of the markup and design.
        </div>
      </div>
    </div>
  `,
})
export default class CollapsibleExample {}
