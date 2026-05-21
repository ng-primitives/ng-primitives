import { Directive, OnDestroy } from '@angular/core';
import { ngpComboboxPortal } from './combobox-portal-state';

@Directive({
  selector: '[ngpComboboxPortal]',
  exportAs: 'ngpComboboxPortal',
})
export class NgpComboboxPortal implements OnDestroy {
  private readonly state = ngpComboboxPortal({});

  /** Cleanup the portal. */
  ngOnDestroy(): void {
    this.state.destroy();
  }

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
  async detach(): Promise<void> {
    this.state.detach();
  }
}
