import { Component } from '@angular/core';
import { NgpButton } from 'ng-primitives/button';
import { PopoverTrigger } from './popover-trigger';

@Component({
  selector: 'app-popover-example',
  imports: [NgpButton, PopoverTrigger],
  template: `
    <button ngpButton appPopoverTrigger="Popover content">Popover</button>
  `,
  styles: `
    [ngpButton] {
      padding-left: 1rem;
      padding-right: 1rem;
      border-radius: 0.5rem;
      color: var(--ngp-text-primary);
      outline: none;
      height: 2.5rem;
      font-weight: 500;
      border: none;
      background-color: var(--ngp-background);
      transition: background-color 300ms cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: var(--ngp-button-shadow);
    }

    [ngpButton][data-hover] {
      background-color: var(--ngp-background-hover);
    }

    [ngpButton][data-focus-visible] {
      outline: 2px solid var(--ngp-focus-ring);
    }

    [ngpButton][data-press] {
      background-color: var(--ngp-background-active);
    }
  `,
})
export default class App {}
