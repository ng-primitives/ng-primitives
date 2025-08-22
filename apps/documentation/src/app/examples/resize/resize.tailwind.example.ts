import { Component, signal } from '@angular/core';
import { Dimensions, NgpResize } from 'ng-primitives/resize';

@Component({
  selector: 'app-resize-tailwind',
  imports: [NgpResize],
  template: `
    <div
      class="flex h-28 max-h-[200px] min-w-28 resize items-center justify-center overflow-hidden rounded border border-dashed border-black p-4 dark:border-white"
      (ngpResize)="dimensions.set($event)"
    >
      {{ dimensions().width }} x {{ dimensions().height }}
    </div>
  `,
})
export default class ResizeTailwindExample {
  /**
   * Store the current size of the element.
   */
  readonly dimensions = signal<Dimensions>({ width: 0, height: 0 });
}
