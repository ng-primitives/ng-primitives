import { Component, signal } from '@angular/core';
import { NgpPress } from 'ng-primitives/interactions';

@Component({
  selector: 'app-press',
  imports: [NgpPress],
  template: `
    <div
      class="flex h-24 w-40 cursor-pointer items-center justify-center rounded-lg border border-black/10 bg-white shadow-none transition-all duration-200 select-none data-press:bg-gray-100 data-press:shadow-[0_1px_3px_0_rgb(0_0_0/0.1),0_1px_2px_-1px_rgb(0_0_0/0.1),0_0_0_1px_rgb(0_0_0/0.05)] dark:border-zinc-800 dark:bg-zinc-950 dark:data-press:bg-zinc-800 dark:data-press:shadow-[0_1px_3px_0_rgb(255_255_255/0.1),0_1px_2px_-1px_rgb(255_255_255/0.1),0_0_0_1px_rgb(255_255_255/0.05)]"
      (ngpPress)="isPressed.set($event)"
    >
      {{ isPressed() ? 'Pressed' : 'Not Pressed' }}
    </div>
  `,
})
export default class PressExample {
  isPressed = signal(false);
}
