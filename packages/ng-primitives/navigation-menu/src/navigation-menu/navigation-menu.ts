import { NumberInput } from '@angular/cdk/coercion';
import {
  Directive,
  input,
  numberAttribute,
  output,
  signal,
} from '@angular/core';
import { NgpOrientation } from 'ng-primitives/common';
import { ngpRovingFocusGroup, provideRovingFocusGroupState } from 'ng-primitives/roving-focus';
import { uniqueId } from 'ng-primitives/utils';
import { injectNavigationMenuConfig } from '../config/navigation-menu-config';
import { ngpNavigationMenu, provideNavigationMenuState } from './navigation-menu-state';

/**
 * Apply the `ngpNavigationMenu` directive to an element to create a navigation menu.
 */
@Directive({
  selector: '[ngpNavigationMenu]',
  exportAs: 'ngpNavigationMenu',
  providers: [
    provideNavigationMenuState({ inherit: false }),
    provideRovingFocusGroupState({ inherit: false }),
  ],
})
export class NgpNavigationMenu {
  /**
   * Access the global navigation menu configuration.
   */
  private readonly config = injectNavigationMenuConfig();

  /**
   * Define the id for the navigation menu.
   */
  readonly id = input<string>(uniqueId('ngp-navigation-menu'));

  /**
   * The currently open item value.
   */
  readonly value = input<string | undefined>(undefined, {
    alias: 'ngpNavigationMenuValue',
  });

  /**
   * Emit the value when it changes.
   */
  readonly valueChange = output<string | undefined>({
    alias: 'ngpNavigationMenuValueChange',
  });

  /**
   * The orientation of the navigation menu.
   * @default 'horizontal'
   */
  readonly orientation = input<NgpOrientation>(this.config.orientation, {
    alias: 'ngpNavigationMenuOrientation',
  });

  /**
   * The duration from when the pointer enters the trigger until the content opens.
   * @default 200
   */
  readonly showDelay = input<number, NumberInput>(this.config.showDelay, {
    alias: 'ngpNavigationMenuDelayDuration',
    transform: numberAttribute,
  });

  /**
   * How much time a user has to enter another trigger without incurring a delay again.
   * @default 300
   */
  readonly skipDelayDuration = input<number, NumberInput>(this.config.skipDelayDuration, {
    alias: 'ngpNavigationMenuSkipDelayDuration',
    transform: numberAttribute,
  });

  private readonly state = ngpNavigationMenu({
    id: this.id,
    value: this.value,
    orientation: this.orientation,
    showDelay: this.showDelay,
    skipDelayDuration: this.skipDelayDuration,
    isSubmenu: signal(false),
    onValueChange: value => this.valueChange.emit(value),
  });

  constructor() {
    ngpRovingFocusGroup({
      orientation: this.orientation,
      disabled: signal(false),
      wrap: signal(true),
      homeEnd: signal(true),
    });
  }

  /**
   * Open an item by its value.
   * @param value The value of the item to open
   */
  open(value: string): void {
    this.state.open(value);
  }

  /**
   * Close the currently open item.
   */
  close(): void {
    this.state.close();
  }
}
