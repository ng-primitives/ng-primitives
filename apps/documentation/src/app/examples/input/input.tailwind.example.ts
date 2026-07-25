import { Component } from '@angular/core';
import { NgpInput } from 'ng-primitives/input';

@Component({
  selector: 'app-input-tailwind',
  imports: [NgpInput],
  template: `
    <input
      class="h-[2.125rem] w-[300px] min-w-0 rounded-lg border-none bg-white px-4 text-sm tracking-[-0.006em] text-zinc-900 shadow-[0_1px_2px_rgba(0,0,0,0.05),0_0_0_1px_rgba(0,0,0,0.1)] outline-hidden placeholder:text-zinc-400 focus:outline-2 focus:outline-offset-2 focus:outline-blue-500 dark:bg-zinc-950 dark:text-zinc-100 dark:shadow-[0_1px_2px_rgba(255,255,255,0.007),0_0_0_1px_rgba(255,255,255,0.1)] dark:focus:outline-blue-400"
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
