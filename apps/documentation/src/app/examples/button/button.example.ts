import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgpButton } from 'ng-primitives/button';

@Component({
  selector: 'app-button',
  imports: [NgpButton, RouterLink],
  template: `
    <button ngpButton>Button</button>
    <a ngpButton>Button</a>
    <a ngpButton routerLink="/">Button</a>
  `,
  styles: `
    [ngpButton] {
      padding-left: 1rem;
      padding-right: 1rem;
      border-radius: 0.5rem;
      color: var(--ngp-text-primary);
      border: none;
      height: 2.5rem;
      font-weight: 500;
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
export default class ButtonExample {}
