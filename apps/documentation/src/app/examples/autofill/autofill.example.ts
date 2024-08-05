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
      --input-label-color: rgb(9 9 11);
      --input-focus-shadow: 0 0 0 2px rgb(59, 130, 246);
      --input-placeholder-color: rgb(161 161 170);

      --input-label-color-dark: #e4e4e7;
      --input-focus-shadow-dark: 0 0 0 2px rgb(59, 130, 246);
      --input-placeholder-color-dark: rgb(161 161 170);
    }

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
      color: light-dark(var(--input-label-color), var(--input-label-color-dark));
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
        0 1px 2px light-dark(rgba(0, 0, 0, 0.05), #3f3f46),
        0 0 0 1px light-dark(rgba(0, 0, 0, 0.1), #3f3f46);
      outline: none;
    }

    input:focus {
      box-shadow: 0 0 0 2px rgb(59, 130, 246);
    }

    input::placeholder {
      color: light-dark(var(--input-placeholder-color), var(--input-placeholder-color-dark));
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
