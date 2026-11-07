import { Component, signal } from '@angular/core';
import { NgpButton } from 'ng-primitives/button';
import { NgpPreviewCard, NgpPreviewCardTrigger } from 'ng-primitives/preview-card';

@Component({
  selector: 'app-preview-card-controlled',
  imports: [NgpPreviewCardTrigger, NgpPreviewCard, NgpButton],
  template: `
    <p class="text-sm tracking-[-0.006em] text-zinc-600 dark:text-zinc-400">
      <a
        class="inline-flex rounded font-[510] text-zinc-950 underline underline-offset-2 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 dark:text-white dark:focus-visible:outline-blue-400"
        [ngpPreviewCardTrigger]="profile"
        [ngpPreviewCardTriggerOpen]="open()"
        (ngpPreviewCardTriggerOpenChange)="onOpenChange($event)"
        href="https://github.com/ng-primitives"
      >
        &#64;sofiachen
      </a>
      requested your review on Add the preview card primitive.
    </p>

    <ng-template #profile>
      <div
        class="absolute flex w-68 max-w-[var(--ngp-preview-card-available-width)] origin-[var(--ngp-preview-card-transform-origin)] flex-col gap-2 rounded-xl border border-zinc-200 bg-white p-3 shadow-lg outline-none dark:border-zinc-800 dark:bg-zinc-950"
        ngpPreviewCard
      >
        <div class="flex items-start justify-between gap-2">
          <div>
            <p class="text-sm font-[590] tracking-[-0.014em] text-zinc-950 dark:text-white">
              Sofia Chen
            </p>
            <p class="text-xs tracking-[-0.011em] text-zinc-500 dark:text-zinc-500">
              &#64;sofiachen
            </p>
          </div>
          <button
            class="h-7 cursor-pointer rounded-full bg-white px-2.5 text-xs font-[510] tracking-[-0.011em] text-zinc-600 shadow-[inset_0_0_0_1px_rgb(228_228_231),0_1px_2px_0_rgba(0,0,0,0.04)] transition-colors duration-150 outline-none data-focus-visible:ring-2 data-focus-visible:ring-blue-500 data-hover:bg-zinc-50 data-pinned:text-[#f01e2b] data-pinned:shadow-[inset_0_0_0_1.5px_#f01e2b] data-press:bg-zinc-100 dark:bg-zinc-950 dark:text-zinc-400 dark:shadow-[inset_0_0_0_1px_rgb(39_39_42)] dark:data-focus-visible:ring-blue-400 dark:data-hover:bg-zinc-900 dark:data-pinned:text-[#ff4651] dark:data-pinned:shadow-[inset_0_0_0_1.5px_#ff4651] dark:data-press:bg-zinc-800"
            [attr.aria-pressed]="pinned()"
            [attr.data-pinned]="pinned() ? '' : null"
            (click)="pinned.set(!pinned())"
            ngpButton
            type="button"
          >
            Pin
          </button>
        </div>

        <p class="text-sm tracking-[-0.006em] text-zinc-600 dark:text-zinc-400">
          Design systems engineer. Building accessible components with Angular.
        </p>
      </div>
    </ng-template>
  `,
  // Angular scopes @keyframes names in component styles, so the enter/exit animations
  // live here alongside their keyframes.
  styles: `
    [ngpPreviewCard][data-enter] {
      animation: preview-card-show 150ms ease-out;
    }

    [ngpPreviewCard][data-exit] {
      animation: preview-card-hide 120ms ease-out;
    }

    @keyframes preview-card-show {
      0% {
        opacity: 0;
        transform: translateY(-2px);
      }
      100% {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes preview-card-hide {
      0% {
        opacity: 1;
      }
      100% {
        opacity: 0;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      [ngpPreviewCard][data-enter],
      [ngpPreviewCard][data-exit] {
        animation-duration: 0s;
      }
    }
  `,
})
export default class PreviewCardControlledExample {
  readonly open = signal(false);
  readonly pinned = signal(false);

  onOpenChange(open: boolean): void {
    // a pinned card ignores requests to close
    if (open || !this.pinned()) {
      this.open.set(open);
    }
  }
}
