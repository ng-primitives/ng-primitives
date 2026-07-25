import { Component } from '@angular/core';
import { NgpPreviewCard, NgpPreviewCardTrigger } from 'ng-primitives/preview-card';

@Component({
  selector: 'app-preview-card',
  imports: [NgpPreviewCardTrigger, NgpPreviewCard],
  template: `
    <p class="text-sm tracking-[-0.006em] text-zinc-600 dark:text-zinc-400">
      Built with
      <a
        class="rounded font-medium text-zinc-950 underline underline-offset-2 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 dark:text-white dark:focus-visible:outline-blue-400"
        [ngpPreviewCardTrigger]="card"
        href="https://angularprimitives.com"
      >
        Angular Primitives
      </a>
      and Angular.
    </p>

    <ng-template #card>
      <div
        class="absolute flex w-72 max-w-[var(--ngp-preview-card-available-width)] origin-[var(--ngp-preview-card-transform-origin)] flex-col gap-1 rounded-xl border border-zinc-200 bg-white p-3 shadow-lg outline-none data-[enter]:animate-[preview-card-show_150ms_ease-out] data-[exit]:animate-[preview-card-hide_120ms_ease-out] motion-reduce:data-[enter]:animate-none motion-reduce:data-[exit]:animate-none dark:border-zinc-800 dark:bg-zinc-950"
        ngpPreviewCard
      >
        <p class="text-sm font-semibold tracking-[-0.014em] text-zinc-950 dark:text-white">
          Angular Primitives
        </p>
        <p class="text-sm tracking-[-0.006em] text-zinc-600 dark:text-zinc-400">
          Headless, accessible UI primitives that leave the styling entirely to you.
        </p>
        <p class="mt-1 text-xs tracking-[-0.011em] text-zinc-500 dark:text-zinc-500">
          angularprimitives.com
        </p>
      </div>
    </ng-template>
  `,
})
export default class PreviewCardExample {}
