import { NumberInput } from '@angular/cdk/coercion';
import { Directive, input, numberAttribute, output } from '@angular/core';
import { NgpOrientation } from 'ng-primitives/common';
import { injectNavigationMenuConfig } from '../config/navigation-menu-config';
import { ngpNavigationMenu, provideNavigationMenuState } from './navigation-menu-state';

/**
 * The `NgpNavigationMenu` directive is the root container for a navigation menu.
 * Apply this to a `<nav>` element for proper semantics.
 */
@Directive({
  selector: '[ngpNavigationMenu]',
  exportAs: 'ngpNavigationMenu',
  providers: [provideNavigationMenuState({ inherit: false })],
  host: {
    role: 'navigation',
  },
})
export class NgpNavigationMenu {
  /**
   * Access the global navigation menu configuration.
   */
  private readonly config = injectNavigationMenuConfig();

  /**
   * The orientation of the navigation menu.
   * @default 'horizontal'
   */
  readonly orientation = input<NgpOrientation>(this.config.orientation, {
    alias: 'ngpNavigationMenuOrientation',
  });

  /**
   * The delay in milliseconds before showing content on hover.
   * @default 200
   */
  readonly showDelay = input<number, NumberInput>(this.config.showDelay, {
    alias: 'ngpNavigationMenuShowDelay',
    transform: numberAttribute,
  });

  /**
   * The delay in milliseconds before hiding content.
   * @default 150
   */
  readonly hideDelay = input<number, NumberInput>(this.config.hideDelay, {
    alias: 'ngpNavigationMenuHideDelay',
    transform: numberAttribute,
  });

  /**
   * The currently active (open) item value.
   */
  readonly value = input<string | null>(null, {
    alias: 'ngpNavigationMenuValue',
  });

  /**
   * Emits when the active item changes.
   */
  readonly valueChange = output<string | null>({
    alias: 'ngpNavigationMenuValueChange',
  });

  private readonly state = ngpNavigationMenu({
    orientation: this.orientation,
    showDelay: this.showDelay,
    hideDelay: this.hideDelay,
    value: this.value,
    onValueChange: value => this.valueChange.emit(value),
  });

  /**
   * Set the active item programmatically.
   * @param value The item value to activate (or null to close all)
   */
  setActiveItem(value: string | null): void {
    this.state.setActiveItem(value);
  }

  /**
   * Set the orientation programmatically.
   * @param orientation The orientation
   */
  setOrientation(orientation: NgpOrientation): void {
    this.state.setOrientation(orientation);
  }
}
