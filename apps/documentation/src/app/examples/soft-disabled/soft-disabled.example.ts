import { Component, signal } from '@angular/core';
import { NgpButton } from 'ng-primitives/button';
import { NgpSoftDisabled } from 'ng-primitives/soft-disabled';

@Component({
  selector: 'app-soft-disabled-example',
  imports: [NgpButton, NgpSoftDisabled],
  template: `
    <button
      [softDisabled]="softDisabled()"
      [softDisabledFocusable]="focusable()"
      (click)="clicks.set(clicks() + 1)"
      ngpButton
      ngpSoftDisabled
      type="button"
    >
      {{
        softDisabled()
          ? focusable()
            ? 'Soft Disabled - Focusable'
            : 'Soft Disabled'
          : 'Fully Interactive'
      }}
    </button>

    <span class="options">
      <label>
        <input
          [checked]="softDisabled()"
          (change)="softDisabled.set(!softDisabled())"
          type="checkbox"
        />
        Soft Disabled
      </label>

      <label>
        <input [checked]="focusable()" (change)="focusable.set(!focusable())" type="checkbox" />
        Focusable
      </label>
    </span>

    <p>
      Status:
      {{
        softDisabled()
          ? focusable()
            ? 'Soft Disabled - Interactions except focusing are blocked'
            : 'Soft Disabled - All interactions are blocked'
          : 'Enabled - Interactions work normally'
      }}
      <br />
      {{ clicks() }} clicks
    </p>
  `,
  styles: `
    :host {
      display: grid;
      place-items: center;
      gap: 1.5rem;
      text-align: center;
    }

    .options {
      display: flex;
      gap: 1rem;
    }

    input:focus-visible {
      outline: 2px solid var(--ngp-focus-ring);
      outline-offset: 2px;
    }

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
      box-sizing: border-box;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }

    [ngpButton][data-focus-visible] {
      outline: 2px solid var(--ngp-focus-ring);
    }

    [ngpButton][data-hover]:not([data-soft-disabled]) {
      background-color: var(--ngp-background-hover);
    }

    [ngpButton][data-press]:not([data-soft-disabled]) {
      background-color: var(--ngp-background-active);
    }

    [ngpButton][data-soft-disabled] {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `,
})
export default class SoftDisabledExample {
  readonly softDisabled = signal(false);
  readonly focusable = signal(true);
  readonly clicks = signal(0);
}
