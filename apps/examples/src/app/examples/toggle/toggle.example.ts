import { Component, signal } from '@angular/core';
import { NgpToggleDirective } from '@ng-primitives/ng-primitives/toggle';

@Component({
  standalone: true,
  selector: 'app-toggle',
  imports: [NgpToggleDirective],
  template: `
    <button
      class="h-10 rounded-lg bg-white px-4 font-medium text-neutral-950 shadow outline-none ring-1 ring-black/5 transition-all hover:bg-neutral-50 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-100 active:bg-neutral-100 data-[state=on]:bg-neutral-950 data-[state=on]:text-white"
      [(ngpTogglePressed)]="pressed"
      ngpToggle
    >
      Toggle
    </button>
  `,
})
export default class ToggleExample {
  /**
   * Whether the toggle is pressed.
   */
  readonly pressed = signal(false);
}
