import { computed, Directive, inject } from '@angular/core';
import { injectDimensions } from 'ng-primitives/utils';
import { injectToastConfig } from '../config/toast-config';
import { injectToastContext } from './toast-context';
import { NgpToastManager } from './toast-manager';

@Directive({
  selector: '[ngpToast]',
  exportAs: 'ngpToast',
  host: {
    '[attr.data-position-x]': 'x',
    '[attr.data-position-y]': 'y',
    '[attr.data-visible]': 'visible()',
    '[attr.data-front]': 'index() === 0',
    '[attr.data-expanded]': 'false',
    '[style.--ngp-toast-gap.px]': 'config.gap',
    '[style.--ngp-toast-z-index]': 'zIndex()',
    '[style.--ngp-toast-index]': 'index() + 1',
    '[style.--ngp-toast-width.px]': 'config.width',
    '[style.--ngp-toast-height.px]': 'dimensions().height',
    '[style.--ngp-toast-offset.px]': 'offset()',
    '[style.--ngp-toast-front-height.px]': 'frontToastHeight()',
  },
})
export class NgpToast {
  private readonly manager = inject(NgpToastManager);
  protected readonly config = injectToastConfig();
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
  protected readonly index = computed(() => {
    return this.toasts().findIndex(toast => toast.instance === this);
  });

  /**
   * Determine the position of the toast in the list of toasts.
   * This is the combination of the heights of all the toasts before this one, plus the gap between them.
   */
  protected readonly offset = computed(() => {
    const gap = this.config.gap;
    // get the offset from the edge of the viewport based on the placement of the toast
    const offsetFromEdge = this.y === 'top' ? this.config.offsetTop : this.config.offsetBottom;

    return this.toasts()
      .slice(0, this.index())
      .reduce((acc, toast) => acc + toast.instance.dimensions().height + gap, offsetFromEdge);
  });

  /**
   * Determine if this toast is visible.
   * Visible considers the maximum number of toasts that can be displayed at once, and the last x toasts that are currently being displayed.
   */
  protected readonly visible = computed(() => {
    const maxToasts = this.config.maxToasts;
    // determine if this toast is within the maximum number of toasts that can be displayed
    return this.index() < maxToasts || this.toasts().length <= maxToasts;
  });

  /**
   * Determine the height of the front toast.
   * This is used to determine the height of the toast when it is not expanded.
   */
  protected readonly frontToastHeight = computed(() => {
    return this.toasts().length > 0 ? this.toasts()[0].instance.dimensions().height : 0;
  });

  /**
   * Determine the z-index of the toast. This is the inverse of the index.
   * The first toast will have the highest z-index, and the last toast will have the lowest z-index.
   * This is used to ensure that the first toast is always on top of the others.
   */
  protected readonly zIndex = computed(() => this.toasts().length - this.index());

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

  constructor() {
    this.context.register(this);
  }

  hide(): void {
    this.context.hide(this);
  }
}
