import { Directive, inject, input } from '@angular/core';
import { uniqueId } from 'ng-primitives/utils';
import { explicitEffect } from '../../../internal/src';
import { NgpProgress } from '../progress/progress';
import { ngpProgressLabelPattern, provideProgressLabelPattern } from './progress-label-pattern';

@Directive({
  selector: '[ngpProgressLabel]',
  exportAs: 'ngpProgressLabel',
  providers: [provideProgressLabelPattern(NgpProgressLabel, instance => instance.pattern)],
})
export class NgpProgressLabel {
  /**
   * Access the progress state.
   */
  protected readonly progress = inject(NgpProgress);

  /**
   * The unique identifier for the progress label.
   */
  readonly id = input<string>(uniqueId('ngp-progress-label'));

  /**
   * The pattern instance.
   */
  protected readonly pattern = ngpProgressLabelPattern({
    id: this.id,
  });

  constructor() {
    explicitEffect([this.id], () => this.progress.setLabel(this.id()));
  }
}
