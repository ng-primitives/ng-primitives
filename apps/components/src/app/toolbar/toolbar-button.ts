import { Component } from '@angular/core';
import { NgpButton } from 'ng-primitives/button';
import { NgpRovingFocusItem } from 'ng-primitives/roving-focus';

@Component({
  selector: 'button[app-toolbar-button]',
  hostDirectives: [
    { directive: NgpButton, inputs: ['disabled'] },
    {
      directive: NgpRovingFocusItem,
      inputs: ['ngpRovingFocusItemDisabled:disabled'],
    },
  ],
  host: {
    type: 'button',
  },
  template: `
    <ng-content />
  `,
  styles: `
    :host {
      display: flex;
      width: 2rem;
      height: 2rem;
      align-items: center;
      justify-content: center;
      border-radius: 0.25rem;
      border: 1px solid transparent;
      background: transparent;
      outline: none;
      transition: background-color 150ms cubic-bezier(0.4, 0, 0.2, 1);
      box-sizing: border-box;
      color: var(--ngp-text-primary);
      cursor: pointer;
    }

    :host[data-hover] {
      background-color: var(--ngp-background-hover);
      border-color: var(--ngp-border);
    }

    :host[data-focus-visible] {
      outline: 2px solid var(--ngp-focus-ring);
    }

    :host[data-press] {
      background-color: var(--ngp-background-active);
    }

    :host[data-selected] {
      background-color: var(--ngp-background-inverse);
      color: var(--ngp-text-inverse);
    }
  `,
})
export class ToolbarButton {}
