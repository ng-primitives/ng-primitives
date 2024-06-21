import { Component, signal } from '@angular/core';
import { Dimensions, NgpResize } from 'ng-primitives/resize';

@Component({
  standalone: true,
  selector: 'app-resize',
  imports: [NgpResize],
  template: `
    <div
      class="flex h-28 max-h-[200px] min-w-28 resize items-center justify-center overflow-hidden rounded border border-dashed border-neutral-950 p-4"
      (ngpResize)="dimensions.set($event)"
    >
      {{ dimensions().width }} x {{ dimensions().height }}
    </div>
  `,
})
export default class ResizeExample {
  /**
   * Store the current size of the element.
   */
  readonly dimensions = signal<Dimensions>({ width: 0, height: 0 });
}
