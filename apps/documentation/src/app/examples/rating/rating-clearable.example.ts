import { Component, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroStarSolid } from '@ng-icons/heroicons/solid';
import { NgpRating, NgpRatingItem } from 'ng-primitives/rating';

@Component({
  selector: 'app-rating-clearable',
  imports: [NgIcon, NgpRating, NgpRatingItem],
  providers: [provideIcons({ heroStarSolid })],
  styles: `
    .rating {
      display: inline-flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
    }

    [ngpRating] {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      outline: none;
      border-radius: 0.5rem;
      cursor: pointer;
    }

    [ngpRating][data-focus-visible] {
      outline: 2px solid var(--ngp-focus-ring);
      outline-offset: 2px;
    }

    .star {
      position: relative;
      display: inline-flex;
      font-size: 1.75rem;
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

    .hint {
      font-size: 0.75rem;
      letter-spacing: -0.011em;
      color: var(--ngp-text-tertiary);
    }
  `,
  template: `
    <div class="rating">
      <div
        [(ngpRatingValue)]="value"
        [ngpRatingCount]="5"
        [ngpRatingClearable]="true"
        ngpRating
        aria-label="Rate this product"
      >
        <span class="star" *ngpRatingItem="let star">
          <ng-icon name="heroStarSolid" />
          <span class="star-fill" [style.width.%]="star.fraction * 100">
            <ng-icon name="heroStarSolid" />
          </span>
        </span>
      </div>
      <span class="hint">Click the selected rating again to clear it.</span>
    </div>
  `,
})
export default class RatingClearableExample {
  readonly value = signal(3);
}
