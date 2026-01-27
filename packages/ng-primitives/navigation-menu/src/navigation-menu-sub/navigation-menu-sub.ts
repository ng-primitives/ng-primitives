import { Directive, input, output, signal } from '@angular/core';
import { NgpOrientation } from 'ng-primitives/common';
import { ngpRovingFocusGroup, provideRovingFocusGroupState } from 'ng-primitives/roving-focus';
import { provideNavigationMenuState } from '../navigation-menu/navigation-menu-state';
import { ngpNavigationMenuSub, provideNavigationMenuSubState } from './navigation-menu-sub-state';

/**
 * Apply the `ngpNavigationMenuSub` directive to create a nested sub-menu.
 * This replaces NgpNavigationMenu for nested menus and inherits delay settings from the parent.
 */
@Directive({
  selector: '[ngpNavigationMenuSub]',
  exportAs: 'ngpNavigationMenuSub',
  providers: [
    provideNavigationMenuSubState({ inherit: false }),
    // Also provide as NavigationMenuState so child components can inject it
    provideNavigationMenuState({ inherit: true }),
    provideRovingFocusGroupState({ inherit: false }),
  ],
})
export class NgpNavigationMenuSub {
  /**
   * The currently open item value.
   */
  readonly value = input<string | undefined>(undefined, {
    alias: 'ngpNavigationMenuSubValue',
  });

  /**
   * Emit the value when it changes.
   */
  readonly valueChange = output<string | undefined>({
    alias: 'ngpNavigationMenuSubValueChange',
  });

  /**
   * The orientation of the sub menu.
   * @default 'horizontal'
   */
  readonly orientation = input<NgpOrientation>('horizontal', {
    alias: 'ngpNavigationMenuSubOrientation',
  });

  private readonly state = ngpNavigationMenuSub({
    value: this.value,
    orientation: this.orientation,
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
