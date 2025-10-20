import { Directive, OnInit, input } from '@angular/core';
import { ngpTabPanelPattern, provideTabPanelPattern } from './tab-panel-pattern';
import { provideTabPanel } from './tab-panel-token';

/**
 * Apply the `ngpTabPanel` directive to an element that represents the content of a tab.
 */
@Directive({
  selector: '[ngpTabPanel]',
  exportAs: 'ngpTabPanel',
  providers: [
    provideTabPanel(NgpTabPanel),
    provideTabPanelPattern(NgpTabPanel, instance => instance.pattern),
  ],
})
export class NgpTabPanel implements OnInit {
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

  protected readonly pattern = ngpTabPanelPattern({
    id: this.id,
    value: this.value,
  });

  ngOnInit(): void {
    if (this.value() === undefined) {
      throw new Error('ngpTabPanel: value is required');
    }
  }
}
