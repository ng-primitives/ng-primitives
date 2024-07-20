import { Component, signal } from '@angular/core';
import { NgpAutofill } from 'ng-primitives/autofill';
import { NgpLabel } from 'ng-primitives/form-field';

@Component({
  standalone: true,
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
      color: rgb(9 9 11);
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
      border: none;
      box-shadow:
        0 1px 2px rgba(0, 0, 0, 0.05),
        0 0 0 1px rgba(0, 0, 0, 0.1);
      outline: none;
    }

    input:focus {
      box-shadow: 0 0 0 2px rgb(59, 130, 246);
    }

    input::placeholder {
      color: rgb(161 161 170);
    }

    span {
      color: rgb(113 113 122);
    }
  `,
})
export default class AutofillExample {
  /**
   * Store the autofill state.
   */
  readonly autofilled = signal(false);
}
