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
      width: 90%;
    }

    [ngpLabel] {
      color: var(--ngp-text-primary);
      font-size: 0.875rem;
      line-height: 1.25rem;
      font-weight: 500;
      margin: 0;
    }

    input {
      height: 36px;
      width: 90%;
      border-radius: 8px;
      padding: 0 16px;
      border: 1px solid var(--ngp-border);
      box-shadow: var(--ngp-shadow);
      background-color: var(--ngp-background);
      outline: none;
    }

    input:focus {
      box-shadow: 0 0 0 2px rgb(59, 130, 246);
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
