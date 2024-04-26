/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the CC BY-ND 4.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Directive, computed, input } from '@angular/core';
import { injectTabset } from '../tabset/tabset.token';
import { NgpTabPanelToken } from './tab-panel.token';

@Directive({
  standalone: true,
  selector: '[ngpTabPanel]',
  exportAs: 'ngpTabPanel',
  providers: [{ provide: NgpTabPanelToken, useExisting: NgpTabPanelDirective }],
  host: {
    role: 'tabpanel',
    tabIndex: '0',
    '[attr.aria-labelledby]': 'labelledBy()',
    '[attr.data-state]': 'active() ? "active" : "inactive"',
    '[attr.data-orientation]': 'tabset.orientation()',
    '[hidden]': '!active()',
  },
})
export class NgpTabPanelDirective {
  /**
   * Access the tabset
   */
  protected readonly tabset = injectTabset();

  /**
   * The value of the tab
   */
  readonly value = input.required<string>({ alias: 'ngpTabPanelValue' });

  /**
   * Determine the id of the tab panel
   * @internal
   */
  readonly id = input<string>();

  /**
   * Determine a unique id for the tab panel if not provided
   * @internal
   */
  readonly defaultId = computed(() => `${this.tabset.id()}-panel-${this.value()}`);

  /**
   * Determine the aria-labelledby of the tab panel
   * @internal
   */
  readonly labelledBy = computed(() => `${this.tabset.id()}-button-${this.value()}`);

  /**
   * Whether the tab is active
   */
  readonly active = computed(() => this.tabset.selectedTab() === this.value());
}
