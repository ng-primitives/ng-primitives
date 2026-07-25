import { Component, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroStarSolid } from '@ng-icons/heroicons/solid';
import { NgpRating, NgpRatingItem } from 'ng-primitives/rating';

@Component({
  selector: 'app-rating-half',
  imports: [NgIcon, NgpRating, NgpRatingItem],
  providers: [provideIcons({ heroStarSolid })],
  template: `
    <div
      class="inline-flex cursor-pointer items-center gap-1 rounded-lg outline-none data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 data-[focus-visible]:outline-2 data-[focus-visible]:outline-offset-2 data-[focus-visible]:outline-blue-500 dark:data-[focus-visible]:outline-blue-400"
      [(ngpRatingValue)]="value"
      [ngpRatingCount]="5"
      ngpRating
      aria-label="Rate this product"
      ngpRatingAllowHalf
    >
      <span
        class="relative inline-flex text-[1.75rem] leading-none text-zinc-300 transition-transform data-[highlighted]:scale-110 dark:text-zinc-700"
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
  `,
})
export default class RatingHalfExample {
  readonly value = signal(2.5);
}
