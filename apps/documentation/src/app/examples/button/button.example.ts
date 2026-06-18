import { Component } from '@angular/core';
import { NgpButton } from 'ng-primitives/button';

@Component({
  selector: 'app-button',
  imports: [NgpButton],
  template: `
    <button ngpButton>Get Started</button>
  `,
  styles: `
    [ngpButton] {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      height: 2.125rem;
      padding-inline: 0.625rem;
      border: none;
      border-radius: 0.5rem;
      font-size: 0.875rem;
      font-weight: 510;
      letter-spacing: -0.006em;
      color: var(--ngp-primary-text);
      background-color: var(--ngp-primary);
      box-shadow:
        inset 0 1px 0 0 rgba(255, 255, 255, 0.3),
        0 1px 1px 0 rgba(0, 0, 0, 0.06);
      cursor: pointer;
      transition:
        background-color 180ms cubic-bezier(0.4, 0, 0.2, 1),
        transform 120ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    [ngpButton][data-hover] {
      background-color: var(--ngp-primary-hover);
    }

    [ngpButton][data-press] {
      background-color: var(--ngp-primary-active);
      transform: scale(0.98);
    }

    [ngpButton][data-focus-visible] {
      outline: none;
      box-shadow:
        inset 0 1px 0 0 rgba(255, 255, 255, 0.3),
        0 0 0 2px var(--ngp-background),
        0 0 0 4px var(--ngp-focus-ring);
    }
  `,
})
export default class ButtonExample {}
