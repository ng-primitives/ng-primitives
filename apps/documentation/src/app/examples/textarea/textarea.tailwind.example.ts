import { Component } from '@angular/core';
import { NgpTextarea } from 'ng-primitives/textarea';

@Component({
  selector: 'app-textarea',
  imports: [NgpTextarea],
  host: {
    class: 'contents',
  },
  template: `
    <textarea
      class="h-[72px] w-[90%] rounded-[0.625rem] border-none bg-white px-[14px] py-[10px] text-[0.875rem] tracking-[-0.006em] text-zinc-900 shadow-[0_1px_2px_rgba(0,0,0,0.05),0_0_0_1px_rgba(0,0,0,0.1)] outline-none placeholder:text-zinc-400 data-focus:outline-2 data-focus:outline-offset-2 data-focus:outline-blue-500 dark:bg-zinc-950 dark:text-zinc-100 dark:shadow-[0_1px_2px_rgba(255,255,255,0.007),0_0_0_1px_rgba(255,255,255,0.1)] dark:data-focus:outline-blue-400"
      ngpTextarea
      placeholder="Enter your message"
    ></textarea>
  `,
})
export default class TextareaExample {}
