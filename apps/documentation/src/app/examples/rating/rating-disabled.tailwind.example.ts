import { Component, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroStarSolid } from '@ng-icons/heroicons/solid';
import { NgpRating, NgpRatingItem } from 'ng-primitives/rating';

@Component({
  selector: 'app-rating-disabled',
  imports: [NgIcon, NgpRating, NgpRatingItem],
  providers: [provideIcons({ heroStarSolid })],
  template: `
    <div
      class="inline-flex cursor-pointer items-center gap-1 rounded-lg outline-none data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50"
      [ngpRatingValue]="value()"
      [ngpRatingCount]="5"
      ngpRating
      aria-label="Rating"
      ngpRatingDisabled
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
  `,
})
export default class RatingDisabledExample {
  readonly value = signal(2);
}
