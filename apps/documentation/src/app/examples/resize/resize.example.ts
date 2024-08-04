import { Component, signal } from '@angular/core';
import { Dimensions, NgpResize } from 'ng-primitives/resize';

@Component({
  standalone: true,
  selector: 'app-resize',
  imports: [NgpResize],
  styles: `
    div {
      display: flex;
      height: 7rem;
      max-height: 200px;
      min-width: 7rem;
      resize: both;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      border-radius: 0.25rem;
      border: 1px dashed light-dark(rgb(10 10 10), rgb(200, 200, 200));
      padding: 1rem;
    }
  `,
  template: `
    <div (ngpResize)="dimensions.set($event)">
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
