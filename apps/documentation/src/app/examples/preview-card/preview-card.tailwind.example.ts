import { Component } from '@angular/core';
import { NgpAvatar, NgpAvatarFallback, NgpAvatarImage } from 'ng-primitives/avatar';
import { NgpPreviewCard, NgpPreviewCardTrigger } from 'ng-primitives/preview-card';

@Component({
  selector: 'app-preview-card',
  imports: [NgpPreviewCardTrigger, NgpPreviewCard, NgpAvatar, NgpAvatarImage, NgpAvatarFallback],
  template: `
    <p class="text-sm tracking-[-0.006em] text-zinc-600 dark:text-zinc-400">
      <a
        class="inline-flex rounded font-[510] text-zinc-950 underline underline-offset-2 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 dark:text-white dark:focus-visible:outline-blue-400"
        [ngpPreviewCardTrigger]="profile"
        href="https://github.com/ng-primitives"
      >
        &#64;sofiachen
      </a>
      requested your review on Add the preview card primitive.
    </p>

    <ng-template #profile>
      <div
        class="absolute flex w-68 max-w-[var(--ngp-preview-card-available-width)] origin-[var(--ngp-preview-card-transform-origin)] flex-col gap-2 rounded-xl border border-zinc-200 bg-white p-3 shadow-lg outline-none data-[enter]:animate-[preview-card-show_150ms_ease-out] data-[exit]:animate-[preview-card-hide_120ms_ease-out] motion-reduce:data-[enter]:animate-none motion-reduce:data-[exit]:animate-none dark:border-zinc-800 dark:bg-zinc-950"
        ngpPreviewCard
      >
        <span
          class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800"
          ngpAvatar
        >
          <img
            class="h-full w-full rounded-full object-cover object-bottom"
            ngpAvatarImage
            src="https://cdn.jsdelivr.net/gh/alohe/memojis/png/memo_5.png"
            alt="Sofia Chen"
          />
          <span
            class="text-[0.8125rem] font-[510] tracking-[-0.011em] text-zinc-600 dark:text-zinc-400"
            ngpAvatarFallback
          >
            SC
          </span>
        </span>

        <div>
          <p class="text-sm font-[590] tracking-[-0.014em] text-zinc-950 dark:text-white">
            Sofia Chen
          </p>
          <p class="text-xs tracking-[-0.011em] text-zinc-500 dark:text-zinc-500">&#64;sofiachen</p>
        </div>

        <p class="text-sm tracking-[-0.006em] text-zinc-600 dark:text-zinc-400">
          Design systems engineer. Building accessible components with Angular.
        </p>
      </div>
    </ng-template>
  `,
})
export default class PreviewCardExample {}
