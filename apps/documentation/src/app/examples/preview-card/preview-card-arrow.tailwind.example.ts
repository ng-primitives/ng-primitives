import { Component } from '@angular/core';
import {
  NgpPreviewCard,
  NgpPreviewCardArrow,
  NgpPreviewCardTrigger,
} from 'ng-primitives/preview-card';

@Component({
  selector: 'app-preview-card-arrow',
  imports: [NgpPreviewCardTrigger, NgpPreviewCard, NgpPreviewCardArrow],
  template: `
    <p class="text-sm tracking-[-0.006em] text-zinc-600 dark:text-zinc-400">
      Built with
      <a
        class="rounded font-[510] text-zinc-950 underline underline-offset-2 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 dark:text-white dark:focus-visible:outline-blue-400"
        [ngpPreviewCardTrigger]="card"
        href="https://angularprimitives.com"
      >
        Angular Primitives
      </a>
      and Angular.
    </p>

    <ng-template #card>
      <div
        class="absolute flex w-64 max-w-[var(--ngp-preview-card-available-width)] origin-[var(--ngp-preview-card-transform-origin)] flex-col gap-1 rounded-xl border border-zinc-200 bg-white p-3 shadow-lg outline-none dark:border-zinc-800 dark:bg-zinc-950"
        ngpPreviewCard
      >
        <p class="text-sm font-[590] tracking-[-0.014em] text-zinc-950 dark:text-white">
          Angular Primitives
        </p>
        <p class="text-sm tracking-[-0.006em] text-zinc-600 dark:text-zinc-400">
          The arrow points back at the trigger it was opened from.
        </p>

        <!-- Two stacked triangles: the lower draws the border, the upper the surface. -->
        <div
          class="pointer-events-none absolute data-[placement=bottom]:top-0 data-[placement=top]:bottom-0 [&:after]:absolute [&:after]:left-0 [&:after]:block [&:after]:h-0 [&:after]:w-0 [&:after]:border-6 [&:after]:border-transparent [&:after]:content-[''] data-[placement=bottom]:[&:after]:bottom-[calc(100%-1px)] data-[placement=bottom]:[&:after]:border-b-white data-[placement=top]:[&:after]:top-[calc(100%-1px)] data-[placement=top]:[&:after]:border-t-white dark:data-[placement=bottom]:[&:after]:border-b-zinc-950 dark:data-[placement=top]:[&:after]:border-t-zinc-950 [&:before]:absolute [&:before]:left-0 [&:before]:block [&:before]:h-0 [&:before]:w-0 [&:before]:border-6 [&:before]:border-transparent [&:before]:content-[''] data-[placement=bottom]:[&:before]:bottom-full data-[placement=bottom]:[&:before]:border-b-zinc-200 data-[placement=top]:[&:before]:top-full data-[placement=top]:[&:before]:border-t-zinc-200 dark:data-[placement=bottom]:[&:before]:border-b-zinc-800 dark:data-[placement=top]:[&:before]:border-t-zinc-800"
          ngpPreviewCardArrow
        ></div>
      </div>
    </ng-template>
  `,
})
export default class PreviewCardArrowExample {}
