import { Directionality } from '@angular/cdk/bidi';
import { DOCUMENT } from '@angular/common';
import { effect, inject, signal, Signal } from '@angular/core';
import { Placement } from '@floating-ui/dom';
import { NgpOrientation } from 'ng-primitives/common';
import { injectElementRef } from 'ng-primitives/internal';
import { NgpOffset, NgpOverlay, NgpShift } from 'ng-primitives/portal';
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
   * The cooldown duration after closing before delays apply again.
   */
  readonly cooldown: Signal<number>;

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
   * Set the cooldown duration.
   */
  setCooldown(duration: number): void;

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

  /**
   * Register a portal with the navigation menu.
   * @internal
   */
  registerPortal(portal: NgpNavigationMenuPortalRef | null): void;

  /**
   * Get the portal.
   * @internal
   */
  readonly portal: Signal<NgpNavigationMenuPortalRef | null>;

  /**
   * Get the menu element.
   * @internal
   */
  readonly element: Signal<HTMLElement>;
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
   * The cooldown duration after closing before delays apply again.
   */
  readonly cooldown?: Signal<number>;

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
    cooldown: _cooldown = signal(300),
    onValueChange,
  }: NgpNavigationMenuProps) => {
    const element = injectElementRef();
    const disposables = injectDisposables();
    const directionality = inject(Directionality);
    const document = inject(DOCUMENT);

    // Track registered items
    const items = signal<NgpNavigationMenuItemRef[]>([]);

    // Track viewport
    const viewport = signal<NgpNavigationMenuViewportRef | null>(null);

    // Track portal
    const portal = signal<NgpNavigationMenuPortalRef | null>(null);

    // Controlled properties
    const value = controlled(_value);
    const orientation = controlled(_orientation);
    const showDelay = controlled(_showDelay);
    const cooldown = controlled(_cooldown);

    // Track previous value for motion direction
    const previousValue = signal<string | undefined>(undefined);

    // Timer state
    let openTimerDispose: (() => void) | undefined;
    let closeTimerDispose: (() => void) | undefined;
    let cooldownTimerDispose: (() => void) | undefined;
    let isInCooldown = false;

    // Host bindings
    dataBinding(element, 'data-orientation', orientation);

    // Close on outside click when menu is open
    effect(onCleanup => {
      const currentValue = value();

      // Only listen for clicks when menu is open
      if (currentValue === undefined) {
        return;
      }

      const handleOutsideClick = (event: MouseEvent) => {
        const path = event.composedPath();

        // Check if click is inside the menu element
        const isInsideMenu = path.includes(element.nativeElement);

        // Check if click is inside the viewport (which may be in a portal)
        const viewportEl = viewport()?.element;
        const isInsideViewport = viewportEl ? path.includes(viewportEl) : false;

        // Check if click is inside any content element
        const isInsideContent = items().some(item => {
          const contentEl = item.contentElement();
          return contentEl && path.includes(contentEl);
        });

        if (!isInsideMenu && !isInsideViewport && !isInsideContent) {
          close();
        }
      };

      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          close();

          // Focus the trigger that was open
          const activeItem = items().find(item => item.value() === currentValue);
          if (activeItem) {
            const triggerEl = activeItem.triggerElement();
            triggerEl?.focus();
          }
        }
      };

      // Use mouseup to match overlay behavior and avoid conflicts with click-to-toggle
      document.addEventListener('mouseup', handleOutsideClick, { capture: true });
      document.addEventListener('keydown', handleEscape, { capture: true });

      onCleanup(() => {
        document.removeEventListener('mouseup', handleOutsideClick, { capture: true });
        document.removeEventListener('keydown', handleEscape, { capture: true });
      });
    });

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

      // Start cooldown timer
      startCooldownTimer();
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

    function setCooldown(duration: number): void {
      cooldown.set(duration);
    }

    function startOpenTimer(itemValue: string): void {
      cancelOpenTimer();

      // If we're in cooldown period, open immediately (no delay)
      if (isInCooldown) {
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

    function startCooldownTimer(): void {
      cancelCooldownTimer();

      isInCooldown = true;

      cooldownTimerDispose = disposables.setTimeout(() => {
        isInCooldown = false;
        cooldownTimerDispose = undefined;
      }, cooldown());
    }

    function cancelCooldownTimer(): void {
      if (cooldownTimerDispose) {
        cooldownTimerDispose();
        cooldownTimerDispose = undefined;
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

    function registerPortal(portalState: NgpNavigationMenuPortalRef | null): void {
      portal.set(portalState);
    }

    return {
      id,
      value,
      orientation,
      dir: directionality.valueSignal as Signal<'ltr' | 'rtl'>,
      showDelay,
      cooldown,
      previousValue,
      open,
      close,
      setValue,
      setOrientation,
      setDelayDuration,
      setCooldown,
      startOpenTimer,
      cancelOpenTimer,
      startCloseTimer,
      cancelCloseTimer,
      registerItem,
      unregisterItem,
      items,
      registerViewport,
      viewport,
      registerPortal,
      portal,
      element: signal(element.nativeElement),
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

export interface NgpNavigationMenuPortalRef {
  /**
   * The portal element.
   */
  readonly element: HTMLElement;

  /**
   * The placement of the portal.
   */
  readonly placement: Signal<Placement>;

  /**
   * The offset of the portal.
   */
  readonly offset: Signal<NgpOffset>;

  /**
   * Whether to flip the portal.
   */
  readonly flip: Signal<boolean>;

  /**
   * The shift configuration.
   */
  readonly shift: Signal<NgpShift>;

  /**
   * The overlay instance.
   */
  readonly overlay: Signal<NgpOverlay<void> | null>;
}
