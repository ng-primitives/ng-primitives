import { Component, signal } from '@angular/core';
import { NgpHover } from 'ng-primitives/interactions';

@Component({
  selector: 'app-hover',
  imports: [NgpHover],
  template: `
    <div
      class="flex h-24 w-40 cursor-pointer items-center justify-center rounded-lg border border-black/10 bg-white shadow-xs transition-all duration-200 data-hover:border-[#f01e2b] data-hover:bg-[#feedee] dark:border-zinc-800 dark:bg-zinc-950 dark:data-hover:border-[#ff4651] dark:data-hover:bg-[#1d0e11]"
      (ngpHover)="isHovering.set($event)"
    >
      {{ isHovering() ? 'Hovering' : 'Not Hovering' }}
    </div>
  `,
})
export default class HoverExample {
  isHovering = signal(false);
}
