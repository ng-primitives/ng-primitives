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
      color: rgb(10 10 10);
      border: none;
      font-weight: 500;
      background-color: #fff;
      box-shadow:
        0 1px 3px 0 rgb(0 0 0 / 0.1),
        0 1px 2px -1px rgb(0 0 0 / 0.1),
        0 0 0 1px rgb(0 0 0 / 0.05);
      cursor: move;
      user-select: none;
      touch-action: none;
      position: absolute;
      width: 100px;
      height: 100px;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    div:focus-visible {
      box-shadow:
        0 0 0 2px #f5f5f5,
        0 0 0 4px rgb(59 130 246);
    }

    div[data-move='true'] {
      box-shadow:
        0 1px 3px 0 rgb(0 0 0 / 0.1),
        0 1px 2px -1px rgb(0 0 0 / 0.1),
        0 0 0 1px rgb(0 0 0 / 0.05),
        0 0 0 2px rgb(59 130 246);
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
