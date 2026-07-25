import { Component, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroStarSolid } from '@ng-icons/heroicons/solid';
import { NgpRating, NgpRatingItem } from 'ng-primitives/rating';

@Component({
  selector: 'app-rating-readonly',
  imports: [NgIcon, NgpRating, NgpRatingItem],
  providers: [provideIcons({ heroStarSolid })],
  template: `
    <div class="inline-flex items-center gap-2">
      <div
        class="inline-flex items-center gap-1 rounded-lg outline-none data-[focus-visible]:outline-2 data-[focus-visible]:outline-offset-2 data-[focus-visible]:outline-blue-500 dark:data-[focus-visible]:outline-blue-400"
        [attr.aria-label]="'Average rating ' + value()"
        [ngpRatingValue]="value()"
        [ngpRatingCount]="5"
        ngpRating
        ngpRatingReadonly
      >
        <span
          class="relative inline-flex text-2xl leading-none text-zinc-300 dark:text-zinc-700"
          *ngpRatingItem="let star"
        >
          <ng-icon name="heroStarSolid" />
          <span
            class="absolute inset-y-0 start-0 inline-flex overflow-hidden text-[#f01e2b] dark:text-[#ff4651]"
            [style.width.%]="star.fraction * 100"
          >
            <ng-icon name="heroStarSolid" />
          </span>
        </span>
      </div>
      <span class="text-sm font-[510] tracking-[-0.006em] text-zinc-600 dark:text-zinc-400">
        {{ value() }} out of 5
      </span>
    </div>
  `,
})
export default class RatingReadonlyExample {
  readonly value = signal(3.7);
}
