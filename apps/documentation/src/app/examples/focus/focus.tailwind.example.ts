import { Component, signal } from '@angular/core';
import { NgpFocus } from 'ng-primitives/interactions';

@Component({
  selector: 'app-focus',
  imports: [NgpFocus],
  host: {
    class: 'flex flex-col',
  },
  template: `
    <input
      class="h-9 rounded-lg border border-black/10 px-3 shadow-xs outline-none data-focus:outline-2 data-focus:outline-offset-2 data-focus:outline-blue-500 dark:border-zinc-800 dark:data-focus:outline-blue-400"
      (ngpFocus)="isFocused.set($event)"
      placeholder="Try focusing me!"
    />
    <p class="mt-1 text-xs text-gray-600 dark:text-gray-300">
      Input is {{ isFocused() ? 'focused' : 'blurred' }}.
    </p>
  `,
})
export default class FocusExample {
  /**
   * Whether the input is currently focused.
   */
  readonly isFocused = signal<boolean>(false);
}
