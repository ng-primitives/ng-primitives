import { FocusOrigin } from '@angular/cdk/a11y';
import { computed, signal, Signal } from '@angular/core';
import { NgpOrientation } from 'ng-primitives/common';
import { injectElementRef } from 'ng-primitives/internal';
import { injectOverlay, NgpOverlay } from 'ng-primitives/portal';
import { injectRovingFocusGroupState } from 'ng-primitives/roving-focus';
import {
  attrBinding,
  controlled,
  createPrimitive,
  dataBinding,
  listener,
  onDestroy,
  onMount,
  styleBinding,
} from 'ng-primitives/state';
import { uniqueId } from 'ng-primitives/utils';
import { injectNavigationMenuState } from '../navigation-menu/navigation-menu-state';
import { injectNavigationMenuItemState } from '../navigation-menu-item/navigation-menu-item-state';
import { injectNavigationMenuTriggerState } from '../navigation-menu-trigger/navigation-menu-trigger-state';

/**
 * The state for the NgpNavigationMenuContent directive.
 */
export interface NgpNavigationMenuContentState {
  /**
   * The unique ID for this content panel.
   */
  readonly id: string;

  /**
   * Whether the content is currently open.
   */
  readonly open: Signal<boolean>;

  /**
   * The orientation for keyboard navigation within the content.
   */
  readonly orientation: Signal<NgpOrientation>;

  /**
   * Close the content.
   * @param origin The focus origin
   */
  close(origin?: FocusOrigin): void;

  /**
   * Focus the first focusable item in the content.
   */
  focusFirst(): void;

  /**
   * Focus the last focusable item in the content.
   */
  focusLast(): void;

  /**
   * Set the orientation for keyboard navigation within the content.
   * @param orientation The orientation ('vertical' for lists, 'horizontal' for grids)
   */
  setOrientation(orientation: NgpOrientation): void;
}

/**
 * The props for the NgpNavigationMenuContent state.
 */
export interface NgpNavigationMenuContentProps {
  /**
   * The orientation for keyboard navigation within the content.
   * Use 'horizontal' for grid layouts, 'vertical' for lists.
   */
  readonly orientation?: Signal<NgpOrientation>;
}

export const [
  NgpNavigationMenuContentStateToken,
  ngpNavigationMenuContent,
  injectNavigationMenuContentState,
  provideNavigationMenuContentState,
] = createPrimitive(
  'NgpNavigationMenuContent',
  ({ orientation: _orientation = signal('vertical') }: NgpNavigationMenuContentProps) => {
    const element = injectElementRef();
    const navigationMenuState = injectNavigationMenuState({ hoisted: true });
    const navigationMenuItemState = injectNavigationMenuItemState({ hoisted: true });
    const triggerState = injectNavigationMenuTriggerState({ hoisted: true });
    const rovingFocusGroup = injectRovingFocusGroupState();

    // Controlled properties
    const orientation = controlled(_orientation);

    // Try to get overlay - may not exist if content isn't in a portal
    let overlay: NgpOverlay | null = null;
    try {
      overlay = injectOverlay();
    } catch {
      // Overlay not available
    }

    const id = uniqueId('navigation-menu-content');
    const open = computed(() => navigationMenuItemState?.()?.active() ?? false);
    let isPointerOver = false;
    let isFocusInside = false;

    // Host bindings
    attrBinding(element, 'id', id);
    attrBinding(element, 'role', 'menu');
    attrBinding(element, 'aria-labelledby', () => triggerState?.()?.id ?? null);
    dataBinding(element, 'data-open', open);
    dataBinding(element, 'data-placement', () => overlay?.finalPlacement() ?? null);
    dataBinding(element, 'data-orientation', orientation);
    dataBinding(element, 'data-instant', () => overlay?.instantTransition() ?? false);

    // Style bindings for positioning
    styleBinding(element, 'left.px', () => overlay?.position().x ?? null);
    styleBinding(element, 'top.px', () => overlay?.position().y ?? null);
    styleBinding(element, '--ngp-navigation-menu-trigger-width.px', () => overlay?.triggerWidth() ?? null);
    styleBinding(element, '--ngp-navigation-menu-transform-origin', () => overlay?.transformOrigin() ?? null);

    // Event listeners
    listener(element, 'pointerenter', onPointerEnter);
    listener(element, 'pointerleave', onPointerLeave);
    listener(element, 'focusin', onFocusIn);
    listener(element, 'focusout', onFocusOut);
    listener(element, 'keydown', onKeydown);

    // Register content ID with trigger on mount
    onMount(() => {
      triggerState?.()?.setContentId(id);

      // Register focus functions with trigger
      triggerState?.()?.registerContentFocusFunctions(focusFirst, focusLast);
    });

    // Cleanup on destroy
    onDestroy(() => {
      // Notify trigger that pointer left content
      if (isPointerOver) {
        triggerState?.()?.setPointerOverContent(false);
      }
      // Notify trigger that focus left content
      if (isFocusInside) {
        triggerState?.()?.setFocusInsideContent(false);
      }
    });

    function onPointerEnter(event: PointerEvent): void {
      if (event.pointerType === 'touch') {
        return;
      }
      isPointerOver = true;
      triggerState?.()?.setPointerOverContent(true);
    }

    function onPointerLeave(event: PointerEvent): void {
      if (event.pointerType === 'touch') {
        return;
      }
      isPointerOver = false;
      triggerState?.()?.setPointerOverContent(false);
    }

    function onFocusIn(): void {
      isFocusInside = true;
      triggerState?.()?.setFocusInsideContent(true);
    }

    function onFocusOut(event: FocusEvent): void {
      // Check if focus is moving outside the content
      const relatedTarget = event.relatedTarget as HTMLElement | null;
      const contentElement = element.nativeElement;

      // If focus is moving to another element inside the content, don't mark as lost
      if (relatedTarget && contentElement.contains(relatedTarget)) {
        return;
      }

      isFocusInside = false;
      triggerState?.()?.setFocusInsideContent(false);
    }

    function onKeydown(event: KeyboardEvent): void {
      const menuOrientation = navigationMenuState?.()?.orientation() ?? 'horizontal';

      // Determine which arrow key closes content and returns to trigger
      // For horizontal menu: ArrowUp closes
      // For vertical menu: ArrowLeft closes (or ArrowRight in RTL)
      const closeKey = menuOrientation === 'horizontal' ? 'ArrowUp' : 'ArrowLeft';

      if (event.key === 'Escape') {
        event.preventDefault();
        close('keyboard');
      } else if (event.key === closeKey) {
        // Only close if we're at the edge of the content
        // For now, we let the roving focus handle internal navigation
        // and only close on Escape
      }
    }

    function close(origin: FocusOrigin = 'program'): void {
      navigationMenuItemState?.()?.hide();

      // Restore focus to trigger on keyboard close
      if (origin === 'keyboard') {
        triggerState?.()?.hide('keyboard');
      }
    }

    function focusFirst(): void {
      // Use the roving focus group's activateFirst method
      rovingFocusGroup()?.activateFirst('keyboard');
    }

    function focusLast(): void {
      // Use the roving focus group's activateLast method
      rovingFocusGroup()?.activateLast('keyboard');
    }

    function setOrientation(value: NgpOrientation): void {
      orientation.set(value);
      // Also update the roving focus group orientation
      rovingFocusGroup()?.setOrientation(value);
    }

    return {
      id,
      open,
      orientation: orientation.asReadonly(),
      close,
      focusFirst,
      focusLast,
      setOrientation,
    } satisfies NgpNavigationMenuContentState;
  },
);
