import { Component, signal } from '@angular/core';
import { NgpHover } from 'ng-primitives/interactions';

@Component({
  standalone: true,
  selector: 'app-hover',
  imports: [NgpHover],
  styles: `
    :host {
      --hover-button-color: rgb(10 10 10);
      --hover-button-background-color: rgb(255 255 255);
      --hover-button-background-color-hover: rgb(219 234 254);
      --hover-button-pressed-background-color: rgb(245 245 245);

      --hover-button-color-dark: rgb(255 255 255);
      --hover-button-background-color-dark: rgb(43 43 47);
      --hover-button-background-color-hover-dark: rgba(95, 160, 246, 0.274);
      --hover-button-pressed-background-color-dark: rgb(39 39 42);
    }

    div {
      display: flex;
      width: 10rem;
      height: 6rem;
      background-color: light-dark(
        var(--hover-button-background-color),
        var(--hover-button-background-color-dark)
      );
      align-items: center;
      justify-content: center;
      border-radius: 0.5rem;
      box-shadow:
        0 1px 2px light-dark(rgba(0, 0, 0, 0.05), rgba(255, 255, 255, 0.007)),
        0 0 0 1px light-dark(rgba(0, 0, 0, 0.1), rgba(255, 255, 255, 0.1));
      transition: all 0.2s;
      cursor: pointer;
    }

    div[data-hover] {
      background-color: light-dark(
        var(--hover-button-background-color-hover),
        var(--hover-button-background-color-hover-dark)
      );
      box-shadow:
        0 1px 2px light-dark(rgba(0, 0, 0, 0.05), rgba(255, 255, 255, 0.007)),
        0 0 0 1px light-dark(rgb(96 165 250), rgb(25, 128, 255));
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
