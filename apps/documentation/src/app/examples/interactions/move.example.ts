import { Component, signal } from '@angular/core';
import { NgpMove } from 'ng-primitives/interactions';
import { NgpMoveEvent } from 'packages/ng-primitives/interactions/src/move/move.directive';

@Component({
  standalone: true,
  selector: 'app-move',
  imports: [NgpMove],
  template: `
    <div [style.left.px]="x()" [style.top.px]="y()" (ngpMove)="onMove($event)" tabindex="0">
      Move me!
    </div>
  `,
  styles: `
    div {
      padding: 1rem;
      border-radius: 0.5rem;
      color: light-dark(rgb(10 10 10), rgb(255 255 255));
      border: none;
      font-weight: 500;
      background-color: light-dark(#fff, #18181b);
      box-shadow:
        0 1px 3px 0 light-dark(rgba(0, 0, 0, 0.1), rgba(255, 255, 255, 0.007)),
        0 1px 2px -1px light-dark(rgba(0, 0, 0, 0.1), rgba(255, 255, 255, 0.1)),
        0 0 0 1px light-dark(rgba(0, 0, 0, 0.05), rgba(255, 255, 255, 0.007));
      cursor: move;
      user-select: none;
      touch-action: none;
      position: absolute;
      width: 100px;
      height: 100px;
      display: flex;
      justify-content: center;
      align-items: center;
      outline: none;
    }

    div:focus-visible {
      box-shadow:
        0 0 0 2px light-dark(#f5f5f5, #3f3f46),
        0 0 0 4px rgb(59 130 246);
    }

    div[data-move] {
      box-shadow:
        0 1px 3px 2px light-dark(rgba(0, 0, 0, 0.1), rgba(168, 168, 168, 0.007)),
        0 1px 2px 2px light-dark(rgba(0, 0, 0, 0.1), rgba(168, 168, 168, 0.1)),
        0 0 0 1px light-dark(rgba(0, 0, 0, 0.05), rgba(168, 168, 168, 0.007));
    }
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
