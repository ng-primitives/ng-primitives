import { BooleanInput } from '@angular/cdk/coercion';
import { Directive, booleanAttribute, computed, input, output, signal } from '@angular/core';
import { NgpOrientation } from 'ng-primitives/common';
import { NgpCanOrientate, provideOrientation } from 'ng-primitives/internal';
import { NgpRovingFocusGroup } from 'ng-primitives/roving-focus';
import { uniqueId } from 'ng-primitives/utils';
import { injectTabsConfig } from '../config/tabs-config';
import type { NgpTabPanel } from '../tab-panel/tab-panel';
import { provideTabsetState, tabsetState } from './tabset-state';
import { provideTabset } from './tabset-token';

@Directive({
  selector: '[ngpTabset]',
  exportAs: 'ngpTabset',
  providers: [provideTabset(NgpTabset), provideTabsetState(), provideOrientation(NgpTabset)],
  hostDirectives: [NgpRovingFocusGroup],
  host: {
    '[attr.id]': 'state.id()',
    '[attr.data-orientation]': 'state.orientation()',
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
  readonly panels = signal<NgpTabPanel[]>([]);

  /**
   * @internal
   * Get the id of the selected tab
   */
  readonly selectedTab = computed(() => {
    const panels = this.panels();

    // if there is a value set and a tab with that value exists, return the value
    if (panels.some(panel => panel.value() === this.state.value())) {
      return this.state.value();
    }

    // otherwise return the first tab
    return panels[0]?.value();
  });

  /**
   * The state of the tabset
   */
  protected readonly state = tabsetState<NgpTabset>(this);

  /**
   * Select a tab by its value
   * @param value The value of the tab to select
   */
  select(value: string): void {
    this.state.value.set(value);
    this.state.valueChange.emit(value);
  }

  /**
   * Register a tab with the tabset
   */
  private registerTab(tab: NgpTabPanel): void {
    this.panels.update(panels => [...panels, tab]);
  }

  /**
   * Unregister a tab with the tabset
   */
  private unregisterTab(tab: NgpTabPanel): void {
    this.panels.update(panels => panels.filter(panel => panel !== tab));
  }
}
