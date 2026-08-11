import { Component, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroStarSolid } from '@ng-icons/heroicons/solid';
import { NgpRating, NgpRatingItem } from 'ng-primitives/rating';

@Component({
  selector: 'app-rating-disabled',
  imports: [NgIcon, NgpRating, NgpRatingItem],
  providers: [provideIcons({ heroStarSolid })],
  styles: `
    [ngpRating] {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      outline: none;
      border-radius: 0.5rem;
      cursor: pointer;
    }

    [ngpRating][data-disabled] {
      cursor: not-allowed;
      opacity: 0.5;
    }

    .star {
      position: relative;
      display: inline-flex;
      font-size: 1.5rem;
      line-height: 1;
      color: var(--ngp-background-secondary);
    }

    .star-fill {
      position: absolute;
      inset-block-start: 0;
      inset-inline-start: 0;
      display: inline-flex;
      overflow: hidden;
      color: var(--ngp-primary);
    }
  `,
  template: `
    <div
      [ngpRatingValue]="value()"
      [ngpRatingCount]="5"
      ngpRating
      aria-label="Rating"
      ngpRatingDisabled
    >
      <span class="star" *ngpRatingItem="let star">
        <ng-icon name="heroStarSolid" />
        <span class="star-fill" [style.width.%]="star.fraction * 100">
          <ng-icon name="heroStarSolid" />
        </span>
      </span>
    </div>
  `,
})
export default class RatingDisabledExample {
  readonly value = signal(2);
}
