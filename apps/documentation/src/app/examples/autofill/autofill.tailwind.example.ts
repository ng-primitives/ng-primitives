import { Component, signal } from '@angular/core';
import { NgpAutofill } from 'ng-primitives/autofill';
import { NgpLabel } from 'ng-primitives/form-field';

@Component({
  selector: 'app-autofill',
  imports: [NgpAutofill, NgpLabel],
  host: {
    class: 'contents',
  },
  template: `
    <form class="flex w-[300px] flex-col gap-1.5">
      <label
        class="m-0 text-sm/5 font-[510] tracking-[-0.014em] text-zinc-900 dark:text-zinc-100"
        ngpLabel
        for="address-one"
      >
        Address line

        @if (autofilled()) {
          <span class="text-zinc-500 dark:text-zinc-400">(Autofilled)</span>
        }
      </label>
      <input
        class="h-[2.125rem] w-[300px] min-w-0 rounded-lg border border-black/10 bg-white px-4 text-sm tracking-[-0.006em] text-zinc-900 shadow-xs outline-none placeholder:text-zinc-500 focus:border-blue-500 focus:shadow-[0_0_0_2px_rgb(59_130_246)] dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-400 dark:focus:border-blue-400 dark:focus:shadow-[0_0_0_2px_rgb(96_165_250)]"
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
})
export default class AutofillExample {
  /**
   * Store the autofill state.
   */
  readonly autofilled = signal(false);
}
