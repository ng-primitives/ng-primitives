import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input, output } from '@angular/core';
import { NgpOrientation } from 'ng-primitives/common';
import { uniqueId } from 'ng-primitives/utils';
import { injectTabsConfig } from '../config/tabs-config';
import { ngpTabsetPattern, provideTabsetPattern } from './tabset-pattern';

/**
 * Apply the `ngpTabset` directive to an element to manage the tabs.
 */
@Directive({
  selector: '[ngpTabset]',
  exportAs: 'ngpTabset',
  providers: [provideTabsetPattern(NgpTabset, instance => instance.pattern)],
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

  /**
   * The pattern instance.
   */
  protected readonly pattern = ngpTabsetPattern({
    id: this.id,
    value: this.value,
    orientation: this.orientation,
    activateOnFocus: this.activateOnFocus,
    onValueChange: value => this.valueChange.emit(value),
  });

  /**
   * Select a tab by its value
   * @param value The value of the tab to select
   */
  select(value: string): void {
    this.pattern.select(value);
  }
}
