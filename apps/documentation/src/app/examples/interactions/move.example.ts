import { Component, signal } from '@angular/core';
import { NgpMove } from 'ng-primitives/interactions';
import { NgpMoveEvent } from 'packages/ng-primitives/interactions/src/move/move.directive';

@Component({
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
      color: var(--ngp-text-primary);
      border: 1px solid var(--ngp-border);
      font-weight: 500;
      background-color: var(--ngp-background);
      box-shadow: none;
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
      outline: 2px solid var(--ngp-focus-ring);
    }

    div[data-move] {
      box-shadow: var(--ngp-button-shadow);
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
