import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, computed, Directive, input, output, signal } from '@angular/core';
import { NgpOrientation } from 'ng-primitives/common';
import { explicitEffect } from 'ng-primitives/internal';
import { injectRovingFocusGroupState, NgpRovingFocusGroup } from 'ng-primitives/roving-focus';
import { uniqueId } from 'ng-primitives/utils';
import { injectTabsConfig } from '../config/tabs-config';
import type { NgpTabButton } from '../tab-button/tab-button';
import { provideTabsetState, tabsetState } from './tabset-state';

/**
 * Apply the `ngpTabset` directive to an element to manage the tabs.
 */
@Directive({
  selector: '[ngpTabset]',
  exportAs: 'ngpTabset',
  providers: [provideTabsetState({ inherit: false })],
  hostDirectives: [NgpRovingFocusGroup],
  host: {
    '[attr.id]': 'state.id()',
    '[attr.data-orientation]': 'state.orientation()',
  },
})
export class NgpTabset {
  /**
   * Access the global tabset configuration
   */
  private readonly config = injectTabsConfig();

  /**
   * Access the roving focus group state
   */
  private readonly rovingFocusGroupState = injectRovingFocusGroupState();

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

  /**
   * Access the tabs within the tabset
   * @internal
   */
  readonly buttons = signal<NgpTabButton[]>([]);

  /**
   * @internal
   * Get the id of the selected tab
   */
  readonly selectedTab = computed(() => {
    const buttons = this.buttons();

    // if there are no tabs then return the selected value
    // if there is a value set and a tab with that value exists, return the value
    if (buttons.length === 0 || buttons.some(button => button.value() === this.state.value())) {
      return this.state.value();
    }

    // otherwise return the first non-disabled tab's value
    return buttons.find(button => !button.disabled())?.value();
  });

  /**
   * The state of the tabset
   */
  protected readonly state = tabsetState<NgpTabset>(this);

  constructor() {
    explicitEffect([this.state.orientation], ([orientation]) => {
      const rovingFocusGroupState = this.rovingFocusGroupState();
      rovingFocusGroupState?.setOrientation(orientation);
    });
  }

  /**
   * Select a tab by its value
   * @param value The value of the tab to select
   */
  select(value: string): void {
    // if the value is already selected, do nothing
    if (this.state.value() === value) {
      return;
    }

    this.state.value.set(value);
    this.valueChange.emit(value);
  }

  /**
   * @internal
   * Register a tab with the tabset
   */
  registerTab(tab: NgpTabButton): void {
    this.buttons.update(buttons => [...buttons, tab]);
  }

  /**
   * @internal
   * Unregister a tab with the tabset
   */
  unregisterTab(tab: NgpTabButton): void {
    this.buttons.update(buttons => buttons.filter(button => button !== tab));
  }
}
