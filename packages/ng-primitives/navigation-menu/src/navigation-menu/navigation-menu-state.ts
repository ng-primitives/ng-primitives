import { Directionality } from '@angular/cdk/bidi';
import { inject, signal, Signal } from '@angular/core';
import { NgpOrientation } from 'ng-primitives/common';
import { injectElementRef } from 'ng-primitives/internal';
import { controlled, createPrimitive, dataBinding } from 'ng-primitives/state';
import { injectDisposables, uniqueId } from 'ng-primitives/utils';

/**
 * The state for the NgpNavigationMenu directive.
 */
export interface NgpNavigationMenuState {
  /**
   * The unique id for the navigation menu.
   */
  readonly id: Signal<string>;

  /**
   * The currently open item value.
   */
  readonly value: Signal<string | undefined>;

  /**
   * The orientation of the navigation menu.
   */
  readonly orientation: Signal<NgpOrientation>;

  /**
   * The text direction (from CDK Directionality).
   */
  readonly dir: Signal<'ltr' | 'rtl'>;

  /**
   * The delay duration before opening.
   */
  readonly showDelay: Signal<number>;

  /**
   * The duration to skip delay after closing.
   */
  readonly skipDelayDuration: Signal<number>;

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
   * Set the value of the navigation menu.
   */
  setValue(value: string | undefined): void;

  /**
   * Set the orientation of the navigation menu.
   */
  setOrientation(orientation: NgpOrientation): void;

  /**
   * Set the delay duration.
   */
  setDelayDuration(duration: number): void;

  /**
   * Set the skip delay duration.
   */
  setSkipDelayDuration(duration: number): void;

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
   * Register an item with the navigation menu.
   * @internal
   */
  registerItem(item: NgpNavigationMenuItemRef): void;

  /**
   * Unregister an item from the navigation menu.
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

/**
 * The props for the NgpNavigationMenu state.
 */
export interface NgpNavigationMenuProps {
  /**
   * The unique id for the navigation menu.
   */
  readonly id?: Signal<string>;

  /**
   * The currently open item value.
   */
  readonly value?: Signal<string | undefined>;

  /**
   * The orientation of the navigation menu.
   */
  readonly orientation?: Signal<NgpOrientation>;

  /**
   * The delay duration before opening.
   */
  readonly showDelay?: Signal<number>;

  /**
   * The duration to skip delay after closing.
   */
  readonly skipDelayDuration?: Signal<number>;

  /**
   * Callback when the value changes.
   */
  readonly onValueChange?: (value: string | undefined) => void;
}

export const [
  NgpNavigationMenuStateToken,
  ngpNavigationMenu,
  injectNavigationMenuState,
  provideNavigationMenuState,
] = createPrimitive(
  'NgpNavigationMenu',
  ({
    id = signal(uniqueId('ngp-navigation-menu')),
    value: _value = signal(undefined),
    orientation: _orientation = signal('horizontal'),
    showDelay: _showDelay = signal(200),
    skipDelayDuration: _skipDelayDuration = signal(300),
    onValueChange,
  }: NgpNavigationMenuProps) => {
    const element = injectElementRef();
    const disposables = injectDisposables();
    const directionality = inject(Directionality);

    // Track registered items
    const items = signal<NgpNavigationMenuItemRef[]>([]);

    // Track viewport
    const viewport = signal<NgpNavigationMenuViewportRef | null>(null);

    // Controlled properties
    const value = controlled(_value);
    const orientation = controlled(_orientation);
    const showDelay = controlled(_showDelay);
    const skipDelayDuration = controlled(_skipDelayDuration);

    // Track previous value for motion direction
    const previousValue = signal<string | undefined>(undefined);

    // Timer state
    let openTimerDispose: (() => void) | undefined;
    let closeTimerDispose: (() => void) | undefined;
    let skipDelayTimerDispose: (() => void) | undefined;
    let isSkippingDelay = false;

    // Host bindings
    dataBinding(element, 'data-orientation', orientation);

    function open(itemValue: string): void {
      if (value() === itemValue) {
        return;
      }

      // Store previous value for motion direction
      previousValue.set(value());

      value.set(itemValue);
      onValueChange?.(itemValue);
    }

    function close(): void {
      if (value() === undefined) {
        return;
      }

      // Store previous value for motion direction
      previousValue.set(value());

      value.set(undefined);
      onValueChange?.(undefined);

      // Start skip delay timer
      startSkipDelayTimer();
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

    function setDelayDuration(duration: number): void {
      showDelay.set(duration);
    }

    function setSkipDelayDuration(duration: number): void {
      skipDelayDuration.set(duration);
    }

    function startOpenTimer(itemValue: string): void {
      cancelOpenTimer();

      // If we're skipping delay, open immediately
      if (isSkippingDelay) {
        open(itemValue);
        return;
      }

      const delay = showDelay();

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
      }, 150); // Short delay to allow moving to content
    }

    function cancelCloseTimer(): void {
      if (closeTimerDispose) {
        closeTimerDispose();
        closeTimerDispose = undefined;
      }
    }

    function startSkipDelayTimer(): void {
      cancelSkipDelayTimer();

      isSkippingDelay = true;

      skipDelayTimerDispose = disposables.setTimeout(() => {
        isSkippingDelay = false;
        skipDelayTimerDispose = undefined;
      }, skipDelayDuration());
    }

    function cancelSkipDelayTimer(): void {
      if (skipDelayTimerDispose) {
        skipDelayTimerDispose();
        skipDelayTimerDispose = undefined;
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
      dir: directionality.valueSignal as Signal<'ltr' | 'rtl'>,
      showDelay,
      skipDelayDuration,
      previousValue,
      open,
      close,
      setValue,
      setOrientation,
      setDelayDuration,
      setSkipDelayDuration,
      startOpenTimer,
      cancelOpenTimer,
      startCloseTimer,
      cancelCloseTimer,
      registerItem,
      unregisterItem,
      items,
      registerViewport,
      viewport,
    } satisfies NgpNavigationMenuState;
  },
);

export interface NgpNavigationMenuItemRef {
  /**
   * The value of the item.
   */
  readonly value: Signal<string>;

  /**
   * The trigger element.
   */
  readonly triggerElement: Signal<HTMLElement | null>;

  /**
   * The content element.
   */
  readonly contentElement: Signal<HTMLElement | null>;
}

export interface NgpNavigationMenuViewportRef {
  /**
   * The viewport element.
   */
  readonly element: HTMLElement;

  /**
   * Update the viewport dimensions.
   */
  updateDimensions(width: number, height: number): void;
}
