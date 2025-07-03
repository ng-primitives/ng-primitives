import { Directive, OnInit, computed, input } from '@angular/core';
import { injectTabsetState } from '../tabset/tabset-state';
import { NgpTabPanelToken } from './tab-panel-token';

/**
 * Apply the `ngpTabPanel` directive to an element that represents the content of a tab.
 */
@Directive({
  selector: '[ngpTabPanel]',
  exportAs: 'ngpTabPanel',
  providers: [{ provide: NgpTabPanelToken, useExisting: NgpTabPanel }],
  host: {
    role: 'tabpanel',
    tabIndex: '0',
    '[id]': 'panelId()',
    '[attr.aria-labelledby]': 'labelledBy()',
    '[attr.data-active]': 'active() ? "" : null',
    '[attr.data-orientation]': 'state().orientation()',
  },
})
export class NgpTabPanel implements OnInit {
  /**
   * Access the tabset
   */
  protected readonly state = injectTabsetState();

  /**
   * The value of the tab
   */
  readonly value = input<string>(undefined, { alias: 'ngpTabPanelValue' });

  /**
   * Determine the id of the tab panel
   * @internal
   */
  readonly id = input<string>();

  /**
   * Determine a unique id for the tab panel if not provided
   * @internal
   */
  protected readonly panelId = computed(
    () => this.id() ?? `${this.state().id()}-panel-${this.value()}`,
  );

  /**
   * Determine the aria-labelledby of the tab panel
   * @internal
   */
  protected readonly labelledBy = computed(() => `${this.state().id()}-button-${this.value()}`);

  /**
   * Whether the tab is active
   */
  protected readonly active = computed(() => this.state().selectedTab() === this.value());

  ngOnInit(): void {
    if (this.value() === undefined) {
      throw new Error('ngpTabPanel: value is required');
    }
  }
}
