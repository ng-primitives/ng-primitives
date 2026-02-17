import { Component, signal } from '@angular/core';
import { NgpDisable } from 'ng-primitives/disable';

@Component({
  selector: 'app-disable-example',
  imports: [NgpDisable],
  template: `
    <button
      [disabled]="disabled()"
      [focusableWhenDisabled]="focusable()"
      (click)="clicks.set(clicks() + 1)"
      type="button"
      ngpDisable
    >
      {{ disabled() ? (focusable() ? 'Disabled Focusable' : 'Disabled') : 'Fully Interactive' }}
    </button>

    <span class="options">
      <label>
        <input [checked]="disabled()" (change)="disabled.set(!disabled())" type="checkbox" />
        Disabled
      </label>

      <label>
        <input [checked]="focusable()" (change)="focusable.set(!focusable())" type="checkbox" />
        Focusable
      </label>
    </span>

    <p>
      Status:
      {{
        disabled()
          ? focusable()
            ? 'Disabled Focusable - Interactions except focusing are blocked'
            : 'Disabled - All interactions are blocked'
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

    [ngpDisable] {
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

    [ngpDisable]:focus-visible {
      outline: 2px solid var(--ngp-focus-ring);
    }

    [ngpDisable]:hover:not([data-disabled]) {
      background-color: var(--ngp-background-hover);
    }

    [ngpDisable]:active:not([data-disabled]) {
      background-color: var(--ngp-background-active);
    }

    [ngpDisable][data-disabled] {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `,
})
export default class DisableExample {
  readonly disabled = signal(false);
  readonly focusable = signal(true);
  readonly clicks = signal(0);
}
