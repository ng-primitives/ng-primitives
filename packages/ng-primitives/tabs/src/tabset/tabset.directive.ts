/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
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
import { NgpOrientation } from 'ng-primitives/common';
import { NgpCanOrientate, NgpOrientationToken } from 'ng-primitives/internal';
import { NgpRovingFocusGroup } from 'ng-primitives/roving-focus';
import { uniqueId } from 'ng-primitives/utils';
import { injectTabsConfig } from '../config/tabs.config';
import { NgpTabPanelToken } from '../tab-panel/tab-panel.token';
import { NgpTabsetToken } from './tabset.token';

@Directive({
  standalone: true,
  selector: '[ngpTabset]',
  exportAs: 'ngpTabset',
  providers: [
    { provide: NgpTabsetToken, useExisting: NgpTabset },
    { provide: NgpOrientationToken, useExisting: NgpTabset },
  ],
  hostDirectives: [NgpRovingFocusGroup],
  host: {
    '[attr.id]': 'id()',
    '[attr.data-orientation]': 'orientation()',
  },
})
export class NgpTabset implements NgpCanOrientate {
  /**
   * Access the global tabset configuration
   */
  private readonly config = injectTabsConfig();

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
  readonly orientation = input<NgpOrientation>(this.config.orientation, {
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

  /**
   * Select a tab by its value
   * @param value The value of the tab to select
   */
  select(value: string): void {
    this.value.set(value);
  }
}
