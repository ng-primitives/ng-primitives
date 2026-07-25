import { Component } from '@angular/core';
import { NgpPreviewCard, NgpPreviewCardTrigger } from 'ng-primitives/preview-card';

@Component({
  selector: 'app-preview-card-delays',
  imports: [NgpPreviewCardTrigger, NgpPreviewCard],
  template: `
    <p class="text-sm tracking-[-0.006em] text-zinc-600 dark:text-zinc-400">
      The
      <a
        class="inline-flex rounded font-[510] text-zinc-950 underline underline-offset-2 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 dark:text-white dark:focus-visible:outline-blue-400"
        [ngpPreviewCardTrigger]="slow"
        href="https://angularprimitives.com"
      >
        default delay
      </a>
      waits 600ms, while a
      <a
        class="inline-flex rounded font-[510] text-zinc-950 underline underline-offset-2 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 dark:text-white dark:focus-visible:outline-blue-400"
        [ngpPreviewCardTrigger]="fast"
        ngpPreviewCardTriggerShowDelay="150"
        ngpPreviewCardTriggerHideDelay="100"
        href="https://angularprimitives.com"
      >
        shorter delay
      </a>
      responds almost immediately.
    </p>

    <ng-template #slow>
      <div
        class="absolute w-60 max-w-[var(--ngp-preview-card-available-width)] origin-[var(--ngp-preview-card-transform-origin)] rounded-xl border border-zinc-200 bg-white p-3 text-sm tracking-[-0.006em] text-zinc-600 shadow-lg outline-none data-[enter]:animate-[preview-card-delays-show_150ms_ease-out] motion-reduce:data-[enter]:animate-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400"
        ngpPreviewCard
      >
        Opened after the default 600ms dwell.
      </div>
    </ng-template>

    <ng-template #fast>
      <div
        class="absolute w-60 max-w-[var(--ngp-preview-card-available-width)] origin-[var(--ngp-preview-card-transform-origin)] rounded-xl border border-zinc-200 bg-white p-3 text-sm tracking-[-0.006em] text-zinc-600 shadow-lg outline-none data-[enter]:animate-[preview-card-delays-show_150ms_ease-out] motion-reduce:data-[enter]:animate-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400"
        ngpPreviewCard
      >
        Opened after 150ms.
      </div>
    </ng-template>
  `,
})
export default class PreviewCardDelaysExample {}
