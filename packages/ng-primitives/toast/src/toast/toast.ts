import { computed, Directive, inject } from '@angular/core';
import { injectDimensions } from 'ng-primitives/utils';
import { injectToastContext } from './toast-context';
import { NgpToastManager } from './toast-manager';

@Directive({
  selector: '[ngpToast]',
  exportAs: 'ngpToast',
  host: {
    '[attr.data-position-x]': 'x',
    '[attr.data-position-y]': 'y',
    '[style.--ngp-toast-gravity]': 'gravity',
    '[style.--ngp-toast-index]': 'index()',
    '[style.--ngp-toast-height.px]': 'dimensions().height',
  },
})
export class NgpToast {
  private readonly manager = inject(NgpToastManager);
  private readonly context = injectToastContext();

  /**
   * Get all toasts that are currently being displayed in the same position.
   */
  private readonly toasts = computed(() =>
    this.manager
      .toasts()
      .filter(toast => toast.instance.context.position === this.context.position),
  );

  /**
   * The number of toasts that are currently being displayed before this toast.
   */
  readonly index = computed(() => {
    return this.toasts().findIndex(toast => toast.instance === this);
  });

  /**
   * The height of the toast in pixels.
   */
  protected readonly dimensions = injectDimensions();

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

  hide(): void {
    this.context.hide(this);
  }
}
