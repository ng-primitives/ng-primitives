import { Directive } from '@angular/core';
import { ngpToastPattern, provideToastPattern } from './toast-pattern';

@Directive({
  selector: '[ngpToast]',
  exportAs: 'ngpToast',
  providers: [provideToastPattern(NgpToast, instance => instance.pattern)],
})
export class NgpToast {
  /**
   * The pattern instance.
   */
  protected readonly pattern = ngpToastPattern({});
}

export type NgpToastSwipeDirection = 'top' | 'right' | 'bottom' | 'left';

export type NgpToastPlacement =
  | 'top-start'
  | 'top-end'
  | 'top-center'
  | 'bottom-start'
  | 'bottom-end'
  | 'bottom-center';
