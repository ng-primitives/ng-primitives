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
        class="absolute flex w-68 max-w-[var(--ngp-preview-card-available-width)] origin-[var(--ngp-preview-card-transform-origin)] flex-col gap-2 rounded-xl border border-zinc-200 bg-white p-3 shadow-lg outline-none dark:border-zinc-800 dark:bg-zinc-950"
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
  // Angular scopes @keyframes names in component styles, so the enter/exit animations
  // must live here alongside their keyframes rather than in arbitrary animate-[...] utilities.
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
export default class PreviewCardExample {}
