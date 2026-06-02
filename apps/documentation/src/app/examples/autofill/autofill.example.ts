import { Component, signal } from '@angular/core';
import { NgpAutofill } from 'ng-primitives/autofill';
import { NgpLabel } from 'ng-primitives/form-field';

@Component({
  selector: 'app-autofill',
  imports: [NgpAutofill, NgpLabel],
  template: `
    <form>
      <label ngpLabel for="address-one">
        Address line

        @if (autofilled()) {
          <span>(Autofilled)</span>
        }
      </label>
      <input
        id="address-one"
        (ngpAutofill)="autofilled.set($event)"
        autocomplete="address-line1"
        required
        type="text"
        name="address-one"
        placeholder="Enter your address"
      />
    </form>
  `,
  styles: `
    :host {
      display: contents;
    }

    form {
      display: flex;
      flex-direction: column;
      gap: 6px;
      width: 300px;
    }

    [ngpLabel] {
      color: var(--ngp-text-primary);
      font-size: 0.875rem;
      line-height: 1.25rem;
      font-weight: 510;
      letter-spacing: -0.014em;
      margin: 0;
    }

    input {
      height: 2.125rem;
      width: 300px;
      border-radius: 0.5rem;
      padding: 0 16px;
      border: 1px solid var(--ngp-border);
      box-shadow: var(--ngp-shadow);
      background-color: var(--ngp-background);
      color: var(--ngp-text-primary);
      font-size: 0.875rem;
      letter-spacing: -0.006em;
      outline: none;
    }

    input:focus {
      border-color: var(--ngp-focus-ring);
      box-shadow: 0 0 0 2px var(--ngp-focus-ring);
    }

    input::placeholder {
      color: var(--ngp-text-tertiary);
    }

    span {
      color: var(--ngp-text-tertiary);
    }
  `,
})
export default class AutofillExample {
  /**
   * Store the autofill state.
   */
  readonly autofilled = signal(false);
}
