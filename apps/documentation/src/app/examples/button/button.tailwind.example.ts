import { Component } from '@angular/core';
import { NgpButton } from 'ng-primitives/button';

@Component({
  selector: 'app-button',
  imports: [NgpButton],
  template: `
    <button
      class="inline-flex h-[2.125rem] items-center justify-center rounded-lg border-none bg-[#f01e2b] px-2.5 text-sm font-[510] tracking-[-0.006em] text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3),0_1px_1px_0_rgba(0,0,0,0.06)] transition-colors duration-200 outline-none data-focus-visible:ring-2 data-focus-visible:ring-blue-500/40 data-focus-visible:ring-offset-2 data-hover:bg-[#d81825] data-press:bg-[#c1141f] dark:bg-[#ff4651] dark:data-focus-visible:ring-blue-400/45 dark:data-focus-visible:ring-offset-zinc-950 dark:data-hover:bg-[#ff5d67] dark:data-press:bg-[#f0303c]"
      ngpButton
    >
      Get Started
    </button>
  `,
})
export default class ButtonExample {}
