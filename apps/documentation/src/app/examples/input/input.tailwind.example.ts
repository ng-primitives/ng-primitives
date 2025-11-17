import { Component } from '@angular/core';
import { NgpInput } from 'ng-primitives/input';

@Component({
  selector: 'app-input-tailwind',
  imports: [NgpInput],
  template: `
    <input
      class="h-9 w-full min-w-0 rounded-lg border-none bg-white px-4 text-gray-900 shadow-xs outline-hidden ring-1 ring-black/10 placeholder:text-gray-400 focus:outline-2 focus:outline-offset-2 focus:outline-blue-500 dark:bg-zinc-900 dark:text-gray-100 dark:placeholder:text-gray-500"
      ngpInput
      type="text"
      placeholder="Enter your full name"
    />
  `,
  styles: `
    :host {
      display: contents;
    }
  `,
})
export default class InputTailwindExample {}
