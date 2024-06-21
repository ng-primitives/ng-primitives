import { Component, signal } from '@angular/core';
import { NgpHover } from 'ng-primitives/utils';

@Component({
  standalone: true,
  selector: 'app-hover',
  imports: [NgpHover],
  template: `
    <div
      class="flex h-24 w-40 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-black/10 transition-all data-[hover=true]:bg-blue-100 data-[hover=true]:ring-blue-400"
      (ngpHoverChange)="isHovering.set($event)"
      ngpHover
    >
      {{ isHovering() ? 'Hovering' : 'Not Hovering' }}
    </div>
  `,
})
export default class HoverExample {
  isHovering = signal(false);
}
