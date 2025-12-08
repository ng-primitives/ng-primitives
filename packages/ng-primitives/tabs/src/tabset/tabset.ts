import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input, output, signal } from '@angular/core';
import { NgpOrientation } from 'ng-primitives/common';
import { ngpRovingFocusGroup, provideRovingFocusGroupState } from 'ng-primitives/roving-focus';
import { uniqueId } from 'ng-primitives/utils';
import { injectTabsConfig } from '../config/tabs-config';
import { ngpTabset, provideTabsetState } from './tabset-state';

/**
 * Apply the `ngpTabset` directive to an element to manage the tabs.
 */
@Directive({
  selector: '[ngpTabset]',
  exportAs: 'ngpTabset',
  providers: [provideTabsetState(), provideRovingFocusGroupState({ inherit: false })],
})
export class NgpTabset {
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
  readonly value = input<string>(undefined, {
    alias: 'ngpTabsetValue',
  });

  /**
   * Emit the value of the selected tab when it changes
   */
  readonly valueChange = output<string | undefined>({
    alias: 'ngpTabsetValueChange',
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

  private readonly state = ngpTabset({
    rovingFocusGroup: ngpRovingFocusGroup({
      orientation: this.orientation,
      disabled: signal(false),
      wrap: signal(false),
      homeEnd: signal(true),
    }),
    id: this.id,
    value: this.value,
    orientation: this.orientation,
    activateOnFocus: this.activateOnFocus,
    onValueChange: value => this.valueChange.emit(value),
  });

  /**
   * @internal
   * Get the id of the selected tab
   */
  readonly selectedTab = this.state.selectedTab;

  /**
   * Select a tab by its value
   * @param value The value of the tab to select
   */
  select(value: string): void {
    this.state.select(value);
  }
}
