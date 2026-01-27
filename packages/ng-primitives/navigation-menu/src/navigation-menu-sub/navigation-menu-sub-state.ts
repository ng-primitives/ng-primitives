import { signal, Signal } from '@angular/core';
import { NgpOrientation } from 'ng-primitives/common';
import { injectElementRef } from 'ng-primitives/internal';
import { controlled, createPrimitive, dataBinding } from 'ng-primitives/state';
import { injectDisposables, uniqueId } from 'ng-primitives/utils';
import {
  injectNavigationMenuState,
  NgpNavigationMenuItemRef,
  NgpNavigationMenuViewportRef,
} from '../navigation-menu/navigation-menu-state';

/**
 * The state for the NgpNavigationMenuSub directive.
 */
export interface NgpNavigationMenuSubState {
  /**
   * The unique id for the sub menu.
   */
  readonly id: Signal<string>;

  /**
   * The currently open item value.
   */
  readonly value: Signal<string | undefined>;

  /**
   * The orientation of the sub menu.
   */
  readonly orientation: Signal<NgpOrientation>;

  /**
   * The previous open item value (for motion direction).
   */
  readonly previousValue: Signal<string | undefined>;

  /**
   * Open an item by its value.
   */
  open(value: string): void;

  /**
   * Close the currently open item.
   */
  close(): void;

  /**
   * Set the value.
   */
  setValue(value: string | undefined): void;

  /**
   * Set the orientation.
   */
  setOrientation(orientation: NgpOrientation): void;

  /**
   * Start the open timer for an item.
   * @internal
   */
  startOpenTimer(value: string): void;

  /**
   * Cancel the open timer.
   * @internal
   */
  cancelOpenTimer(): void;

  /**
   * Start the close timer.
   * @internal
   */
  startCloseTimer(): void;

  /**
   * Cancel the close timer.
   * @internal
   */
  cancelCloseTimer(): void;

  /**
   * Register an item with the sub menu.
   * @internal
   */
  registerItem(item: NgpNavigationMenuItemRef): void;

  /**
   * Unregister an item from the sub menu.
   * @internal
   */
  unregisterItem(itemValue: string): void;

  /**
   * Get the registered items.
   * @internal
   */
  readonly items: Signal<NgpNavigationMenuItemRef[]>;

  /**
   * Register the viewport element.
   * @internal
   */
  registerViewport(viewport: NgpNavigationMenuViewportRef | null): void;

  /**
   * Get the viewport element.
   * @internal
   */
  readonly viewport: Signal<NgpNavigationMenuViewportRef | null>;
}

export interface NgpNavigationMenuSubProps {
  /**
   * The currently open item value.
   */
  readonly value?: Signal<string | undefined>;

  /**
   * The orientation of the sub menu.
   */
  readonly orientation?: Signal<NgpOrientation>;

  /**
   * Callback when the value changes.
   */
  readonly onValueChange?: (value: string | undefined) => void;
}

export const [
  NgpNavigationMenuSubStateToken,
  ngpNavigationMenuSub,
  injectNavigationMenuSubState,
  provideNavigationMenuSubState,
] = createPrimitive(
  'NgpNavigationMenuSub',
  ({
    value: _value = signal(undefined),
    orientation: _orientation = signal('horizontal'),
    onValueChange,
  }: NgpNavigationMenuSubProps): NgpNavigationMenuSubState => {
    const element = injectElementRef();
    const parentMenu = injectNavigationMenuState();
    const disposables = injectDisposables();

    const id = signal(uniqueId('ngp-navigation-menu-sub'));

    // Track registered items
    const items = signal<NgpNavigationMenuItemRef[]>([]);

    // Track viewport
    const viewport = signal<NgpNavigationMenuViewportRef | null>(null);

    // Controlled properties
    const value = controlled(_value);
    const orientation = controlled(_orientation);

    // Track previous value for motion direction
    const previousValue = signal<string | undefined>(undefined);

    // Timer state - inherit delay settings from parent
    let openTimerDispose: (() => void) | undefined;
    let closeTimerDispose: (() => void) | undefined;

    // Host bindings
    dataBinding(element, 'data-orientation', orientation);

    function open(itemValue: string): void {
      if (value() === itemValue) {
        return;
      }

      previousValue.set(value());
      value.set(itemValue);
      onValueChange?.(itemValue);
    }

    function close(): void {
      if (value() === undefined) {
        return;
      }

      previousValue.set(value());
      value.set(undefined);
      onValueChange?.(undefined);
    }

    function setValue(newValue: string | undefined): void {
      if (newValue === undefined) {
        close();
      } else {
        open(newValue);
      }
    }

    function setOrientation(newOrientation: NgpOrientation): void {
      orientation.set(newOrientation);
    }

    function startOpenTimer(itemValue: string): void {
      cancelOpenTimer();

      // Inherit delay from parent menu
      const delay = parentMenu().showDelay();

      if (delay <= 0) {
        open(itemValue);
        return;
      }

      openTimerDispose = disposables.setTimeout(() => {
        open(itemValue);
        openTimerDispose = undefined;
      }, delay);
    }

    function cancelOpenTimer(): void {
      if (openTimerDispose) {
        openTimerDispose();
        openTimerDispose = undefined;
      }
    }

    function startCloseTimer(): void {
      cancelCloseTimer();

      closeTimerDispose = disposables.setTimeout(() => {
        close();
        closeTimerDispose = undefined;
      }, 150);
    }

    function cancelCloseTimer(): void {
      if (closeTimerDispose) {
        closeTimerDispose();
        closeTimerDispose = undefined;
      }
    }

    function registerItem(item: NgpNavigationMenuItemRef): void {
      items.update(currentItems => [...currentItems, item]);
    }

    function unregisterItem(itemValue: string): void {
      items.update(currentItems => currentItems.filter(item => item.value() !== itemValue));
    }

    function registerViewport(viewportState: NgpNavigationMenuViewportRef | null): void {
      viewport.set(viewportState);
    }

    return {
      id,
      value,
      orientation,
      previousValue,
      open,
      close,
      setValue,
      setOrientation,
      startOpenTimer,
      cancelOpenTimer,
      startCloseTimer,
      cancelCloseTimer,
      registerItem,
      unregisterItem,
      items,
      registerViewport,
      viewport,
    } satisfies NgpNavigationMenuSubState;
  },
);
