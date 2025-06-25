import { Directive } from '@angular/core';
import { injectToastContext } from './toast-context';

@Directive({
  selector: '[ngpToast]',
  exportAs: 'ngpToast',
  host: {
    '[attr.data-position-x]': 'x',
    '[attr.data-position-y]': 'y',
    '[style.--gravity]': 'gravity',
  },
})
export class NgpToast {
  private readonly context = injectToastContext();

  /**
   * The x position of the toast.
   */
  readonly x = this.context.position.split('-')[1] || 'end';

  /**
   * The y position of the toast.
   */
  readonly y = this.context.position.split('-')[0] || 'top';

  /**
   * Determine the gravity of the toast. This is used to determine the direction the toast will enter and exit the screen.
   * 1 is from the top down, -1 is from the bottom up.
   */
  readonly gravity = this.y === 'top' ? 1 : -1;

  constructor() {
    this.context.register(this);
  }
}
