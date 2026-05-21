import { Directive, OnDestroy } from '@angular/core';
import { ngpSelectPortal } from './select-portal-state';

@Directive({
  selector: '[ngpSelectPortal]',
  exportAs: 'ngpSelectPortal',
})
export class NgpSelectPortal implements OnDestroy {
  protected readonly state = ngpSelectPortal({});

  /**
   * Attach the portal.
   * @internal
   */
  show(): Promise<void> {
    return this.state.show();
  }

  /**
   * Detach the portal.
   * @internal
   */
  detach(): void {
    this.state.hide();
  }

  ngOnDestroy(): void {
    this.state.destroy();
  }
}
