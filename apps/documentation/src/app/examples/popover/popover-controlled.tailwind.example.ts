import { Component, signal } from '@angular/core';
import { NgpButton } from 'ng-primitives/button';
import { NgpPopover, NgpPopoverTrigger } from 'ng-primitives/popover';

@Component({
  selector: 'app-popover-controlled',
  imports: [NgpPopoverTrigger, NgpPopover, NgpButton],
  template: `
    <div class="flex items-center gap-2">
      <button
        class="h-[2.125rem] cursor-pointer rounded-lg px-2.5 text-[0.9375rem] font-[590] tracking-[-0.014em] text-zinc-950 transition-colors duration-150 outline-none data-focus-visible:ring-2 data-focus-visible:ring-blue-500 data-hover:bg-zinc-100 data-press:bg-zinc-200 dark:text-white dark:data-focus-visible:ring-blue-400 dark:data-hover:bg-zinc-800 dark:data-press:bg-zinc-700"
        [(ngpPopoverTriggerOpen)]="open"
        [ngpPopoverTrigger]="rename"
        ngpPopoverTriggerPlacement="bottom-start"
        ngpButton
        type="button"
      >
        {{ name() }}
      </button>
      <button
        class="h-[2.125rem] cursor-pointer rounded-lg bg-white px-2.5 text-sm font-[510] tracking-[-0.006em] text-zinc-950 shadow-[inset_0_0_0_1px_rgb(228_228_231),0_1px_2px_0_rgba(0,0,0,0.04)] transition-colors duration-150 outline-none data-focus-visible:ring-2 data-focus-visible:ring-blue-500 data-hover:bg-zinc-50 data-press:bg-zinc-100 dark:bg-zinc-950 dark:text-white dark:shadow-[inset_0_0_0_1px_rgb(39_39_42)] dark:data-focus-visible:ring-blue-400 dark:data-hover:bg-zinc-900 dark:data-press:bg-zinc-800"
        (click)="open.set(true)"
        ngpButton
        type="button"
      >
        Rename
      </button>
    </div>

    <ng-template #rename>
      <form
        class="absolute m-0 flex w-64 origin-[var(--ngp-popover-transform-origin)] flex-col gap-2 rounded-xl border border-zinc-200 bg-white p-3 shadow-lg outline-none dark:border-zinc-800 dark:bg-zinc-950"
        (submit)="save($event, input.value)"
        ngpPopover
      >
        <label
          class="text-[0.8125rem] font-[510] tracking-[-0.014em] text-zinc-950 dark:text-white"
          for="popover-controlled-name"
        >
          Name
        </label>
        <input
          class="h-[2.125rem] rounded-lg bg-white px-2.5 text-sm tracking-[-0.006em] text-zinc-950 shadow-[inset_0_0_0_1px_rgb(228_228_231)] outline-none focus:shadow-[inset_0_0_0_2px_var(--color-blue-500)] dark:bg-zinc-950 dark:text-white dark:shadow-[inset_0_0_0_1px_rgb(39_39_42)] dark:focus:shadow-[inset_0_0_0_2px_var(--color-blue-400)]"
          id="popover-controlled-name"
          #input
          [value]="name()"
        />
        <div class="flex justify-end">
          <button
            class="h-[2.125rem] cursor-pointer rounded-lg bg-[#f01e2b] px-3.5 text-sm font-[510] tracking-[-0.006em] text-white transition-colors duration-150 outline-none data-focus-visible:ring-2 data-focus-visible:ring-blue-500 data-hover:bg-[#d81825] data-press:bg-[#c1141f] dark:bg-[#ff4651] dark:data-focus-visible:ring-blue-400 dark:data-hover:bg-[#ff5d67] dark:data-press:bg-[#f0303c]"
            ngpButton
            type="submit"
          >
            Save
          </button>
        </div>
      </form>
    </ng-template>
  `,
  // Angular scopes @keyframes names in component styles, so the enter/exit animations
  // live here alongside their keyframes.
  styles: `
    [ngpPopover][data-enter] {
      animation: popover-show 150ms ease-out;
    }

    [ngpPopover][data-exit] {
      animation: popover-hide 120ms ease-out;
    }

    @keyframes popover-show {
      0% {
        opacity: 0;
        transform: translateY(-2px);
      }
      100% {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes popover-hide {
      0% {
        opacity: 1;
      }
      100% {
        opacity: 0;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      [ngpPopover][data-enter],
      [ngpPopover][data-exit] {
        animation-duration: 0s;
      }
    }
  `,
})
export default class PopoverControlledExample {
  readonly open = signal(false);
  readonly name = signal('Q3 roadmap');

  save(event: Event, name: string): void {
    event.preventDefault();
    this.name.set(name.trim() || this.name());
    this.open.set(false);
  }
}
