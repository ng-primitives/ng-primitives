/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the CC BY-ND 4.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { BooleanInput } from '@angular/cdk/coercion';
import {
  Directive,
  booleanAttribute,
  computed,
  contentChildren,
  input,
  model,
} from '@angular/core';
import {
  NgpRovingFocusGroupDirective,
  injectRovingFocusGroup,
} from '@ng-primitives/ng-primitives/roving-focus';
import { uniqueId } from '@ng-primitives/ng-primitives/utils';
import { injectTabsConfig } from '../config/tabs.config';
import { NgpTabPanelToken } from '../tab-panel/tab-panel.token';
import { NgpTabsetToken } from './tabset.token';

@Directive({
  standalone: true,
  selector: '[ngpTabset]',
  exportAs: 'ngpTabset',
  providers: [{ provide: NgpTabsetToken, useExisting: NgpTabsetDirective }],
  hostDirectives: [
    {
      directive: NgpRovingFocusGroupDirective,
      inputs: ['ngpRovingFocusGroupOrientation:ngpTabsetOrientation'],
    },
  ],
  host: {
    '[attr.id]': 'id()',
    '[attr.data-orientation]': 'orientation()',
  },
})
export class NgpTabsetDirective {
  /**
   * Access the global tabset configuration
   */
  private readonly config = injectTabsConfig();

  /**
   * Access the roving focus group directive
   */
  private readonly rovingFocusGroup = injectRovingFocusGroup();

  /**
   * Define the id for the tabset
   */
  readonly id = input<string>(uniqueId('ngp-tabset'));

  /**
   * Define the active tab
   */
  readonly value = model<string | null>(null, {
    alias: 'ngpTabsetValue',
  });

  /**
   * The orientation of the tabset
   * @default 'horizontal'
   */
  readonly orientation = input<'horizontal' | 'vertical'>(this.config.orientation, {
    alias: 'ngpTabsetOrientation',
  });

  /**
   * Whether tabs should activate on focus
   */
  readonly activateOnFocus = input<boolean, BooleanInput>(this.config.activateOnFocus, {
    alias: 'ngpTabsetActivateOnFocus',
    transform: booleanAttribute,
  });

  /**
   * Access the tabs within the tabset
   */
  readonly panels = contentChildren(NgpTabPanelToken, { descendants: true });

  /**
   * Get the id of the selected tab
   */
  readonly selectedTab = computed(() => {
    const panels = this.panels();

    // if there is a value set and a tab with that value exists, return the value
    if (panels.some(panel => panel.value() === this.value())) {
      return this.value();
    }

    // otherwise return the first tab
    return panels[0]?.value();
  });

  constructor() {
    // default the orientation to horizontal
    this.rovingFocusGroup.orientation = this.orientation();
  }

  /**
   * Select a tab by its value
   * @param value The value of the tab to select
   */
  select(value: string): void {
    this.value.set(value);
  }
}
