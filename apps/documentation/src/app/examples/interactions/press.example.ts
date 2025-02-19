import { Component, signal } from '@angular/core';
import { NgpPress } from 'ng-primitives/interactions';

@Component({
  selector: 'app-press',
  imports: [NgpPress],
  styles: `
    div {
      display: flex;
      width: 10rem;
      height: 6rem;
      background-color: var(--background);
      align-items: center;
      justify-content: center;
      border-radius: 0.5rem;
      box-shadow: none;
      transition: all 0.2s;
      cursor: pointer;
      user-select: none;
      border: 1px solid var(--border);
    }

    div[data-press] {
      background-color: var(--background-active);
      box-shadow: var(--button-shadow);
    }
  `,
  template: `
    <div (ngpPress)="isPressed.set($event)">
      {{ isPressed() ? 'Pressed' : 'Not Pressed' }}
    </div>
  `,
})
export default class PressExample {
  isPressed = signal(false);
}
