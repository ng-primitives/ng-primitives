import { Component } from '@angular/core';
import { NgpInput } from 'ng-primitives/input';

@Component({
  selector: 'app-input-tailwind',
  imports: [NgpInput],
  template: `
    <input
      class="h-[2.125rem] w-[300px] min-w-0 rounded-lg border-none bg-white px-4 text-sm tracking-[-0.006em] text-gray-900 shadow-xs ring-1 ring-black/10 outline-hidden placeholder:text-gray-400 focus:outline-2 focus:outline-offset-2 focus:outline-blue-500 dark:bg-zinc-900 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:outline-blue-400"
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
