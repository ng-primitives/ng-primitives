import { Component, signal } from '@angular/core';
import { NgpPress } from 'ng-primitives/interactions';

@Component({
  standalone: true,
  selector: 'app-press',
  imports: [NgpPress],
  styles: `
    div {
      display: flex;
      width: 10rem;
      height: 6rem;
      background-color: rgb(255 255 255);
      align-items: center;
      justify-content: center;
      border-radius: 0.5rem;
      background-color: rgb(255 255 255);
      box-shadow:
        0 1px 2px rgba(0, 0, 0, 0.05),
        0 0 0 1px rgb(0 0 0 / 0.05);
      transition: all 0.2s;
      cursor: pointer;
      user-select: none;
    }

    div[data-press='true'] {
      background-color: rgb(219 234 254);
      box-shadow:
        0 1px 2px rgba(0, 0, 0, 0.05),
        0 0 0 1px rgb(96 165 250);
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
