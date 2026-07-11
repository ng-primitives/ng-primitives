import { Component } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlValueAccessor } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroStarSolid } from '@ng-icons/heroicons/solid';
import { injectRatingState, NgpRating, NgpRatingItem } from 'ng-primitives/rating';
import { ChangeFn, provideValueAccessor, TouchedFn } from 'ng-primitives/utils';

@Component({
  selector: 'app-rating',
  hostDirectives: [
    {
      directive: NgpRating,
      inputs: [
        'ngpRatingValue:value',
        'ngpRatingCount:count',
        'ngpRatingAllowHalf:allowHalf',
        'ngpRatingDisabled:disabled',
        'ngpRatingReadonly:readonly',
        'ngpRatingClearable:clearable',
      ],
      outputs: ['ngpRatingValueChange:valueChange'],
    },
  ],
  imports: [NgIcon, NgpRatingItem],
  providers: [provideIcons({ heroStarSolid }), provideValueAccessor(Rating)],
  template: `
    <span class="star" *ngpRatingItem="let star">
      <ng-icon class="star-background" name="heroStarSolid" />
      <span class="star-fill" [style.width.%]="star.fraction * 100">
        <ng-icon name="heroStarSolid" />
      </span>
    </span>
  `,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      outline: none;
      border-radius: 0.5rem;
      cursor: pointer;
    }

    :host[data-disabled] {
      cursor: not-allowed;
      opacity: 0.5;
    }

    :host[data-readonly] {
      cursor: default;
    }

    :host[data-focus-visible] {
      outline: 2px solid var(--ngp-focus-ring);
      outline-offset: 2px;
    }

    .star {
      position: relative;
      display: inline-flex;
      font-size: 1.5rem;
      line-height: 1;
      color: var(--ngp-background-secondary);
      transition: color 150ms cubic-bezier(0.4, 0, 0.2, 1);
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
  host: {
    '(focusout)': 'onTouched?.()',
  },
})
export class Rating implements ControlValueAccessor {
  /** Access the rating state. */
  private readonly state = injectRatingState();

  /** The onChange callback function. */
  private onChange?: ChangeFn<number>;

  /** The onTouched callback function. */
  protected onTouched?: TouchedFn;

  constructor() {
    // Whenever the user interacts with the rating, call onChange with the new value.
    this.state()
      .valueChange.pipe(takeUntilDestroyed())
      .subscribe(value => this.onChange?.(value));
  }

  writeValue(value: number): void {
    // writing a value from the model must not re-emit through onChange
    this.state().setValue(value, { emit: false });
  }

  registerOnChange(fn: ChangeFn<number>): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: TouchedFn): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.state().setDisabled(isDisabled);
  }
}
