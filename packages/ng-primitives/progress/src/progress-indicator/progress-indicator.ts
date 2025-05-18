import { computed, Directive } from '@angular/core';
import { injectProgressState } from '../progress/progress-state';

/**
 * Apply the `ngpProgressIndicator` directive to an element that represents the current progress.
 * The width of this element can be set to the percentage of the progress value.
 */
@Directive({
  selector: '[ngpProgressIndicator]',
  host: {
    '[style.width.%]': 'percentage()',
    '[attr.data-progressing]': 'state().progressing() ? "" : null',
    '[attr.data-indeterminate]': 'state().indeterminate() ? "" : null',
    '[attr.data-complete]': 'state().complete() ? "" : null',
  },
})
export class NgpProgressIndicator {
  /**
   * Access the progress state.
   */
  protected readonly state = injectProgressState();

  /**
   * Get the percentage of the progress value.
   */
  protected readonly percentage = computed(() =>
    this.state().value() === null
      ? null
      : ((this.state().value()! - this.state().min()) / (this.state().max() - this.state().min())) *
        100,
  );
}
