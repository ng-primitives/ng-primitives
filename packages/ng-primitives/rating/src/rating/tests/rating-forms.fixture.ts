import { Component } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { NgpRating, NgpRatingItem } from 'ng-primitives/rating';
import {
  ChangeFn,
  provideValueAccessor,
  safeTakeUntilDestroyed,
  TouchedFn,
} from 'ng-primitives/utils';
import { injectRatingState } from '../rating-state';

/**
 * Inline fixture mirroring `apps/components/.../reusable-components/rating/rating.ts`.
 * Used by the reusable-component form test suites.
 */
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
      ],
      outputs: ['ngpRatingValueChange:valueChange'],
    },
  ],
  imports: [NgpRatingItem],
  providers: [provideValueAccessor(Rating)],
  template: `
    <span class="star" *ngpRatingItem="let star"></span>
  `,
  host: {
    '(focusout)': 'onTouched?.()',
  },
})
export class Rating implements ControlValueAccessor {
  private readonly state = injectRatingState();
  private onChange?: ChangeFn<number>;
  protected onTouched?: TouchedFn;

  constructor() {
    this.state()
      .valueChange.pipe(safeTakeUntilDestroyed())
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
