import { Directive } from '@angular/core';
import { ngpSelectPortal } from './select-portal-state';

@Directive({
  selector: '[ngpSelectPortal]',
  exportAs: 'ngpSelectPortal',
})
export class NgpSelectPortal {
  protected readonly state = ngpSelectPortal({});

  /**
   * Attach the portal.
   * @internal
   */
  show(): void {
    this.state.show();
  }

  /**
   * Detach the portal.
   * @internal
   */
  detach(): void {
    this.state.hide();
  }
}
