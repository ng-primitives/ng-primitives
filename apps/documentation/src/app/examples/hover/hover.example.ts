import { Component, signal } from '@angular/core';
import { NgpHover } from 'ng-primitives/interactions';

@Component({
  selector: 'app-hover',
  imports: [NgpHover],
  styles: `
    div {
      display: flex;
      width: 10rem;
      height: 6rem;
      background-color: var(--background);
      border: 1px solid var(--border);
      align-items: center;
      justify-content: center;
      border-radius: 0.5rem;
      box-shadow: var(--shadow);
      transition: all 0.2s;
      cursor: pointer;
    }

    div[data-hover] {
      background-color: var(--background-blue);
      border-color: var(--border-blue);
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
