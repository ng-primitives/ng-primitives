import { Component, signal } from '@angular/core';
import { NgpButton } from 'ng-primitives/button';
import { NgpMenu, NgpMenuItem, NgpMenuTrigger } from 'ng-primitives/menu';

@Component({
  selector: 'app-menu-dynamic-anchor-tailwind',
  imports: [NgpButton, NgpMenu, NgpMenuTrigger, NgpMenuItem],
  template: `
    <div class="flex flex-col items-start gap-4">
      <div class="flex flex-wrap gap-2">
        @for (token of tokens; track token) {
          <button
            class="h-[2.125rem] cursor-pointer rounded-lg border-none bg-white px-2.5 font-mono text-[0.8125rem] tracking-[-0.006em] text-gray-600 outline-hidden transition-colors duration-150 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue-500 active:bg-gray-200 dark:bg-transparent dark:text-gray-400 dark:hover:bg-white/10 dark:focus-visible:outline-blue-400 dark:active:bg-white/20"
            #element
            [class]="
              anchor() === element
                ? 'font-[510] text-gray-900 ring-2 ring-[#f01e2b] dark:text-gray-100 dark:ring-[#ff4651]'
                : 'ring-1 ring-black/5 dark:ring-white/10'
            "
            (click)="claim(trigger, element)"
            (pointerdown)="claim(trigger, element)"
            type="button"
          >
            {{ token }}
          </button>
        }
      </div>

      <!-- Below the tokens, so the menu it opens never covers the row it moves across. -->
      <button
        class="h-[2.125rem] rounded-[0.625rem] border-none bg-white px-2.5 text-sm font-[510] tracking-[-0.006em] text-gray-900 shadow-sm ring-1 ring-black/5 outline-hidden transition-colors duration-150 data-focus-visible:outline-2 data-focus-visible:outline-offset-1 data-focus-visible:outline-blue-500 data-hover:bg-gray-100 data-press:bg-gray-200 dark:bg-transparent dark:text-gray-100 dark:ring-white/10 dark:data-focus-visible:outline-blue-400 dark:data-hover:bg-white/10 dark:data-press:bg-white/20"
        #trigger="ngpMenuTrigger"
        [ngpMenuTrigger]="menu"
        ngpMenuTriggerPlacement="bottom-start"
        ngpMenuTriggerOffset="8"
        ngpButton
      >
        Format value
      </button>
    </div>

    <ng-template #menu>
      <div
        class="fixed flex w-max origin-(--ngp-menu-transform-origin) flex-col rounded-[0.625rem] border border-gray-200 bg-white p-1 shadow-lg outline-none dark:border-zinc-800 dark:bg-zinc-950"
        ngpMenu
      >
        <button
          class="min-w-[140px] cursor-pointer rounded-md border-none bg-transparent px-3 py-1.5 text-left text-sm font-[510] tracking-[-0.006em] text-gray-900 outline-hidden transition-colors data-focus-visible:bg-gray-100 data-hover:bg-gray-100 data-press:bg-gray-200 dark:text-gray-100 dark:data-focus-visible:bg-white/10 dark:data-hover:bg-white/10 dark:data-press:bg-white/20"
          ngpMenuItem
        >
          Copy
        </button>
        <button
          class="min-w-[140px] cursor-pointer rounded-md border-none bg-transparent px-3 py-1.5 text-left text-sm font-[510] tracking-[-0.006em] text-gray-900 outline-hidden transition-colors data-focus-visible:bg-gray-100 data-hover:bg-gray-100 data-press:bg-gray-200 dark:text-gray-100 dark:data-focus-visible:bg-white/10 dark:data-hover:bg-white/10 dark:data-press:bg-white/20"
          ngpMenuItem
        >
          Copy path
        </button>
        <button
          class="min-w-[140px] cursor-pointer rounded-md border-none bg-transparent px-3 py-1.5 text-left text-sm font-[510] tracking-[-0.006em] text-gray-900 outline-hidden transition-colors data-focus-visible:bg-gray-100 data-hover:bg-gray-100 data-press:bg-gray-200 dark:text-gray-100 dark:data-focus-visible:bg-white/10 dark:data-hover:bg-white/10 dark:data-press:bg-white/20"
          ngpMenuItem
        >
          Filter on value
        </button>
      </div>
    </ng-template>
  `,
})
export default class MenuDynamicAnchorExample {
  /** Drives the highlight only - the menu is re-anchored through `setAnchor`. */
  readonly anchor = signal<HTMLElement | null>(null);

  readonly tokens = ['"id"', '"name"', '"createdAt"', '"tags"'];

  /**
   * Called on `pointerdown` so the anchor is claimed before the capture-phase `mouseup`
   * that decides whether the press landed outside - on `click` alone the press would
   * dismiss the menu instead of moving it. `setAnchor` rather than the input, because an
   * input only reaches the trigger on the next change detection pass and a fast tap can
   * outrun it. The `click` binding keeps the targets usable without a pointer, where it
   * claims the anchor for the next open rather than moving a menu already on screen.
   */
  claim(trigger: NgpMenuTrigger, element: HTMLElement): void {
    trigger.setAnchor(element);
    this.anchor.set(element);
  }
}
