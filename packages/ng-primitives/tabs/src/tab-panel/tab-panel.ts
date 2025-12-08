import { Directive, input } from '@angular/core';
import { ngpTabPanel, provideTabPanelState } from './tab-panel-state';

/**
 * Apply the `ngpTabPanel` directive to an element that represents the content of a tab.
 */
@Directive({
  selector: '[ngpTabPanel]',
  exportAs: 'ngpTabPanel',
  providers: [provideTabPanelState()],
})
export class NgpTabPanel {
  /**
   * The value of the tab
   * @required
   */
  readonly value = input<string>(undefined, { alias: 'ngpTabPanelValue' });

  /**
   * Determine the id of the tab panel
   * @internal
   */
  readonly id = input<string>();

  private readonly state = ngpTabPanel({
    value: this.value,
    id: this.id,
  });

  /**
   * Whether the tab is active
   */
  readonly active = this.state.active;
}
