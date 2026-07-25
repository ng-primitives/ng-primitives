import { Component, signal } from '@angular/core';
import { NgpMove, NgpMoveEvent } from 'ng-primitives/interactions';

@Component({
  selector: 'app-move',
  imports: [NgpMove],
  template: `
    <div
      class="absolute flex h-[100px] w-[100px] cursor-move touch-none items-center justify-center rounded-lg border border-black/10 bg-white p-4 font-[510] text-zinc-900 shadow-none outline-none select-none focus-visible:outline-2 focus-visible:outline-blue-500 data-move:shadow-[0_1px_3px_0_rgb(0_0_0/0.1),0_1px_2px_-1px_rgb(0_0_0/0.1),0_0_0_1px_rgb(0_0_0/0.05)] dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus-visible:outline-blue-400 dark:data-move:shadow-[0_1px_3px_0_rgb(255_255_255/0.1),0_1px_2px_-1px_rgb(255_255_255/0.1),0_0_0_1px_rgb(255_255_255/0.05)]"
      [style.left.px]="x()"
      [style.top.px]="y()"
      (ngpMove)="onMove($event)"
      tabindex="0"
    >
      Move me!
    </div>
  `,
})
export default class MoveExample {
  readonly x = signal<number>(60);
  readonly y = signal<number>(60);

  onMove(event: NgpMoveEvent) {
    this.x.update(x => x + event.deltaX);
    this.y.update(y => y + event.deltaY);
  }
}
