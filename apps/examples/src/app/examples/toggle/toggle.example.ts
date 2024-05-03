import { Component, signal } from '@angular/core';
import { NgpToggleDirective } from '@ng-primitives/ng-primitives/toggle';

@Component({
  standalone: true,
  selector: 'app-toggle',
  imports: [NgpToggleDirective],
  template: `
    <button
      class="h-10 rounded-lg bg-white px-4 font-medium text-zinc-950 shadow outline-none ring-1 ring-black/5 transition-all hover:bg-zinc-50 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-100 active:bg-zinc-100 data-[state=on]:bg-zinc-950 data-[state=on]:text-white"
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
