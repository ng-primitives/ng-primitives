import { Directive } from '@angular/core';
import { ngpComboboxPortal, provideComboboxPortalState } from './combobox-portal-state';

@Directive({
  selector: '[ngpComboboxPortal]',
  exportAs: 'ngpComboboxPortal',
  providers: [provideComboboxPortalState()],
})
export class NgpComboboxPortal {
  protected readonly state = ngpComboboxPortal({});

  /**
   * The overlay that manages the popover
   * @internal
   */
  readonly overlay = this.state.overlay;

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
  detach(): Promise<void> {
    return this.state.detach();
  }
}
