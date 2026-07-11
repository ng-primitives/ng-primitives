import { Component, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroStarSolid } from '@ng-icons/heroicons/solid';
import { NgpRating, NgpRatingItem } from 'ng-primitives/rating';

@Component({
  selector: 'app-rating-readonly',
  imports: [NgIcon, NgpRating, NgpRatingItem],
  providers: [provideIcons({ heroStarSolid })],
  styles: `
    .rating {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }

    [ngpRating] {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      outline: none;
      border-radius: 0.5rem;
    }

    [ngpRating][data-focus-visible] {
      outline: 2px solid var(--ngp-focus-ring);
      outline-offset: 2px;
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

    .rating-value {
      font-size: 0.875rem;
      font-weight: 510;
      letter-spacing: -0.006em;
      color: var(--ngp-text-secondary);
    }
  `,
  template: `
    <div class="rating">
      <div
        [attr.aria-label]="'Average rating ' + value()"
        [ngpRatingValue]="value()"
        [ngpRatingCount]="5"
        ngpRating
        ngpRatingReadonly
      >
        <span class="star" *ngpRatingItem="let star">
          <ng-icon name="heroStarSolid" />
          <span class="star-fill" [style.width.%]="star.fraction * 100">
            <ng-icon name="heroStarSolid" />
          </span>
        </span>
      </div>
      <span class="rating-value">{{ value() }} out of 5</span>
    </div>
  `,
})
export default class RatingReadonlyExample {
  readonly value = signal(3.7);
}
