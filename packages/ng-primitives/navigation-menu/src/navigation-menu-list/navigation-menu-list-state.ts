import { signal, Signal } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { attrBinding, createPrimitive, dataBinding } from 'ng-primitives/state';
import { injectNavigationMenuState } from '../navigation-menu/navigation-menu-state';

/**
 * The state for the NgpNavigationMenuList directive.
 */
export interface NgpNavigationMenuListState {
  /**
   * Register a trigger element.
   * @internal
   */
  registerTrigger(trigger: NgpNavigationMenuTriggerRef): void;

  /**
   * Unregister a trigger element.
   * @internal
   */
  unregisterTrigger(id: string): void;

  /**
   * Get the registered triggers.
   * @internal
   */
  readonly triggers: Signal<NgpNavigationMenuTriggerRef[]>;
}

export const [
  NgpNavigationMenuListStateToken,
  ngpNavigationMenuList,
  injectNavigationMenuListState,
  provideNavigationMenuListState,
] = createPrimitive('NgpNavigationMenuList', (): NgpNavigationMenuListState => {
  const element = injectElementRef();
  const menu = injectNavigationMenuState();

  // Track registered triggers for indicator positioning
  const triggers = signal<NgpNavigationMenuTriggerRef[]>([]);

  // Host bindings
  attrBinding(element, 'role', 'menubar');
  dataBinding(element, 'data-orientation', menu().orientation);

  function registerTrigger(trigger: NgpNavigationMenuTriggerRef): void {
    triggers.update(currentTriggers => [...currentTriggers, trigger]);
  }

  function unregisterTrigger(id: string): void {
    triggers.update(currentTriggers => currentTriggers.filter(t => t.id !== id));
  }

  return {
    registerTrigger,
    unregisterTrigger,
    triggers,
  } satisfies NgpNavigationMenuListState;
});

export interface NgpNavigationMenuTriggerRef {
  /**
   * The id of the trigger.
   */
  readonly id: string;

  /**
   * The item value.
   */
  readonly value: Signal<string>;

  /**
   * The trigger element.
   */
  readonly element: HTMLElement;
}
