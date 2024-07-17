import { Component, signal } from '@angular/core';
import { NgpHover } from 'ng-primitives/interactions';

@Component({
  standalone: true,
  selector: 'app-hover',
  imports: [NgpHover],
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
    }

    div[data-hover='true'] {
      background-color: rgb(219 234 254);
      box-shadow:
        0 1px 2px rgba(0, 0, 0, 0.05),
        0 0 0 1px rgb(96 165 250);
    }
  `,
  template: `
    <div (ngpHover)="isHovering.set($event)">
      {{ isHovering() ? 'Hovering' : 'Not Hovering' }}
    </div>
  `,
})
export default class HoverExample {
  isHovering = signal(false);
}
