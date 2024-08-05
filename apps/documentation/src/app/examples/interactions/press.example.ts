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
      background-color: light-dark(rgb(255 255 255), #18181b);
      align-items: center;
      justify-content: center;
      border-radius: 0.5rem;
      box-shadow:
        0 1px 2px light-dark(rgba(0, 0, 0, 0.05), rgba(255, 255, 255, 0.007)),
        0 0 0 1px light-dark(rgba(0, 0, 0, 0.05), rgba(255, 255, 255, 0.007));
      transition: all 0.2s;
      cursor: pointer;
      user-select: none;
    }

    div[data-press='true'] {
      background-color: light-dark(rgb(219 234 254), rgb(63, 139, 238));
      box-shadow:
        0 1px 2px light-dark(rgba(0, 0, 0, 0.05), rgba(255, 255, 255, 0.007)),
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
