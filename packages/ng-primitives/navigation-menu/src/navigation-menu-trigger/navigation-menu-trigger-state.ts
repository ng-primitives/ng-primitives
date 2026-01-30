import { FocusMonitor, FocusOrigin } from '@angular/cdk/a11y';
import { Directionality } from '@angular/cdk/bidi';
import { computed, inject, Injector, signal, Signal, ViewContainerRef } from '@angular/core';
import { Placement } from '@floating-ui/dom';
import { injectElementRef } from 'ng-primitives/internal';
import {
  createOverlay,
  NgpOffset,
  NgpOverlay,
  NgpOverlayConfig,
  NgpOverlayContent,
  NgpShift,
} from 'ng-primitives/portal';
import {
  attrBinding,
  controlled,
  createPrimitive,
  dataBinding,
  listener,
  onDestroy,
} from 'ng-primitives/state';
import { uniqueId } from 'ng-primitives/utils';
import { injectNavigationMenuItemState } from '../navigation-menu-item/navigation-menu-item-state';
import { injectNavigationMenuState } from '../navigation-menu/navigation-menu-state';

export interface NgpNavigationMenuTriggerState {
  /**
   * The content template or component.
   */
  readonly content: Signal<NgpOverlayContent<unknown> | undefined>;

  /**
   * Whether the trigger is disabled.
   */
  readonly disabled: Signal<boolean>;

  /**
   * The placement of the content.
   */
  readonly placement: Signal<Placement>;

  /**
   * The offset of the content.
   */
  readonly offset: Signal<NgpOffset>;

  /**
   * Whether the content should flip when there is not enough space.
   */
  readonly flip: Signal<boolean>;

  /**
   * The shift configuration for the content.
   */
  readonly shift: Signal<NgpShift>;

  /**
   * The container for the content.
   */
  readonly container: Signal<HTMLElement | string | null>;

  /**
   * Whether the content is currently open.
   */
  readonly open: Signal<boolean>;

  /**
   * The unique ID for accessibility.
   */
  readonly id: string;

  /**
   * The ID of the associated content panel.
   */
  readonly contentId: Signal<string | undefined>;

  /**
   * Show the content.
   */
  show(): void;

  /**
   * Hide the content.
   * @param origin The focus origin
   */
  hide(origin?: FocusOrigin): void;

  /**
   * Focus the first item in the content.
   */
  focusFirstContentItem(): void;

  /**
   * Focus the last item in the content.
   */
  focusLastContentItem(): void;

  /**
   * Set the content ID.
   * @param id The content ID
   */
  setContentId(id: string): void;

  /**
   * Update pointer over content state.
   * @param isOver Whether pointer is over content
   */
  setPointerOverContent(isOver: boolean): void;

  /**
   * Update focus inside content state.
   * @param isFocused Whether focus is inside the content
   */
  setFocusInsideContent(isFocused: boolean): void;

  /**
   * Register focus functions from content.
   * @param focusFirst Function to focus first item
   * @param focusLast Function to focus last item
   */
  registerContentFocusFunctions(focusFirst: () => void, focusLast: () => void): void;
}

export interface NgpNavigationMenuTriggerProps {
  /**
   * The content template or component.
   */
  readonly content?: Signal<NgpOverlayContent<unknown> | undefined>;

  /**
   * Whether the trigger is disabled.
   */
  readonly disabled?: Signal<boolean>;

  /**
   * The placement of the content.
   */
  readonly placement?: Signal<Placement>;

  /**
   * The offset of the content.
   */
  readonly offset?: Signal<NgpOffset>;

  /**
   * Whether the content should flip.
   */
  readonly flip?: Signal<boolean>;

  /**
   * The shift configuration.
   */
  readonly shift?: Signal<NgpShift>;

  /**
   * The container for the content.
   */
  readonly container?: Signal<HTMLElement | string | null>;

  /**
   * The cooldown duration in milliseconds.
   */
  readonly cooldown?: Signal<number>;
}

export const [
  NgpNavigationMenuTriggerStateToken,
  ngpNavigationMenuTrigger,
  injectNavigationMenuTriggerState,
  provideNavigationMenuTriggerState,
] = createPrimitive(
  'NgpNavigationMenuTrigger',
  ({
    content: _content = signal(undefined),
    disabled: _disabled = signal(false),
    placement: _placement = signal('bottom-start'),
    offset: _offset = signal(4),
    flip: _flip = signal(true),
    shift: _shift = signal(undefined),
    container: _container = signal('body'),
    cooldown: _cooldown = signal(300),
  }: NgpNavigationMenuTriggerProps) => {
    const element = injectElementRef();
    const injector = inject(Injector);
    const viewContainerRef = inject(ViewContainerRef);
    const focusMonitor = inject(FocusMonitor);
    const directionality = inject(Directionality);
    const navigationMenuState = injectNavigationMenuState();
    const navigationMenuItemState = injectNavigationMenuItemState();

    // Controlled properties - use asReadonly() for public interface
    const content = controlled(_content);
    const disabled = controlled(_disabled);
    const placement = controlled(_placement);
    const offset = controlled(_offset);
    const flip = controlled(_flip);
    const shift = controlled(_shift);
    const container = controlled(_container);
    const cooldown = controlled(_cooldown);

    // Internal state
    const id = uniqueId('navigation-menu-trigger');
    const contentId = signal<string | undefined>(undefined);
    const overlay = signal<NgpOverlay<unknown> | null>(null);
    const open = computed(() => navigationMenuItemState().active());
    let showTimeout: ReturnType<typeof setTimeout> | null = null;
    let hideTimeout: ReturnType<typeof setTimeout> | null = null;
    let isPointerOverTrigger = false;
    let isPointerOverContent = false;
    let isFocusInsideContent = false;
    let contentFocusFirstFn: (() => void) | null = null;
    let contentFocusLastFn: (() => void) | null = null;
    let wasOpen = false;

    // Host bindings
    attrBinding(element, 'id', id);
    attrBinding(element, 'aria-haspopup', 'menu');
    attrBinding(element, 'aria-expanded', open);
    attrBinding(element, 'aria-controls', () => contentId() ?? null);
    dataBinding(element, 'data-open', open);
    dataBinding(element, 'data-disabled', disabled);

    // Event listeners
    listener(element, 'pointerenter', onPointerEnter);
    listener(element, 'pointerleave', onPointerLeave);
    listener(element, 'focus', onFocus);
    listener(element, 'blur', onBlur);
    listener(element, 'click', onClick);
    listener(element, 'keydown', onKeydown);

    // Cleanup on destroy
    onDestroy(() => {
      clearShowTimeout();
      clearHideTimeout();
      overlay()?.destroy();
    });

    // Methods
    function onPointerEnter(event: PointerEvent): void {
      if (disabled() || event.pointerType === 'touch') {
        return;
      }
      isPointerOverTrigger = true;
      clearHideTimeout();
      scheduleShow();
    }

    function onPointerLeave(event: PointerEvent): void {
      if (disabled() || event.pointerType === 'touch') {
        return;
      }
      isPointerOverTrigger = false;
      clearShowTimeout();
      scheduleHide();
    }

    function onFocus(): void {
      if (disabled()) {
        return;
      }
      // Only clear hide timeout on focus, don't show
      // Menu should open on hover or enter key, not on focus alone
      clearHideTimeout();
    }

    function onBlur(): void {
      if (disabled()) {
        return;
      }
      // Don't hide if focus is moving to the content
      scheduleHide();
    }

    function onClick(): void {
      if (disabled()) {
        return;
      }
      // For touch/click, toggle immediately
      if (open()) {
        hide('mouse');
      } else {
        show();
      }
    }

    function onKeydown(event: KeyboardEvent): void {
      if (disabled()) {
        return;
      }

      const orientation = navigationMenuState().orientation();
      const isRtl = directionality.value === 'rtl';

      // Determine which arrow key opens content based on orientation
      const openKey =
        orientation === 'horizontal' ? 'ArrowDown' : isRtl ? 'ArrowLeft' : 'ArrowRight';
      const openLastKey =
        orientation === 'horizontal' ? 'ArrowUp' : isRtl ? 'ArrowRight' : 'ArrowLeft';

      if (event.key === openKey) {
        event.preventDefault();
        if (!open()) {
          show();
        }
        // Focus first item in content
        setTimeout(() => focusFirstContentItem(), 0);
      } else if (event.key === openLastKey && open()) {
        event.preventDefault();
        // Focus last item in content
        focusLastContentItem();
      } else if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        if (open()) {
          focusFirstContentItem();
        } else {
          show();
          // After opening, focus first item
          setTimeout(() => focusFirstContentItem(), 0);
        }
      } else if (event.key === 'Escape' && open()) {
        event.preventDefault();
        hide('keyboard');
      }
    }

    function scheduleShow(): void {
      clearShowTimeout();
      const delay = navigationMenuState().showDelay();

      if (delay === 0) {
        show();
        return;
      }

      showTimeout = setTimeout(() => {
        show();
      }, delay);
    }

    function scheduleHide(): void {
      clearHideTimeout();
      const delay = navigationMenuState().hideDelay();

      if (delay === 0) {
        hide();
        return;
      }

      hideTimeout = setTimeout(() => {
        // Only hide if pointer is not over trigger or content and focus is not inside content
        if (!isPointerOverTrigger && !isPointerOverContent && !isFocusInsideContent) {
          hide();
        }
      }, delay);
    }

    function clearShowTimeout(): void {
      if (showTimeout) {
        clearTimeout(showTimeout);
        showTimeout = null;
      }
    }

    function clearHideTimeout(): void {
      if (hideTimeout) {
        clearTimeout(hideTimeout);
        hideTimeout = null;
      }
    }

    function show(): void {
      if (disabled()) {
        return;
      }
      navigationMenuItemState().show();

      // Imperatively manage overlay - show it now
      syncOverlayState(true);
    }

    function hide(origin: FocusOrigin = 'program'): void {
      navigationMenuItemState().hide();

      // Imperatively manage overlay - hide it now
      syncOverlayState(false);

      // If closing via keyboard, restore focus to trigger
      if (origin === 'keyboard') {
        focusMonitor.focusVia(element, 'keyboard');
      }
    }

    function syncOverlayState(shouldBeOpen: boolean): void {
      if (shouldBeOpen && !wasOpen) {
        showOverlay();
        wasOpen = true;
      } else if (!shouldBeOpen && wasOpen) {
        hideOverlay();
        wasOpen = false;
      }
    }

    function showOverlay(): void {
      if (!content()) {
        return;
      }

      // Create overlay if needed
      if (!overlay()) {
        createOverlayInstance();
      }

      overlay()?.show();
    }

    function hideOverlay(): void {
      overlay()?.hide();
    }

    function createOverlayInstance(): void {
      const contentValue = content();

      if (!contentValue) {
        return;
      }

      const config: NgpOverlayConfig<unknown> = {
        content: contentValue,
        triggerElement: element.nativeElement,
        injector,
        viewContainerRef,
        container: container(),
        placement,
        offset: offset(),
        flip: flip(),
        shift: shift(),
        closeOnOutsideClick: true,
        closeOnEscape: true,
        restoreFocus: false, // We handle focus restoration ourselves
        overlayType: 'navigation-menu',
        cooldown: cooldown(),
      };

      overlay.set(createOverlay(config));
    }

    function focusFirstContentItem(): void {
      contentFocusFirstFn?.();
    }

    function focusLastContentItem(): void {
      contentFocusLastFn?.();
    }

    function setContentId(newId: string): void {
      contentId.set(newId);
    }

    function setPointerOverContent(isOver: boolean): void {
      isPointerOverContent = isOver;
      if (isOver) {
        clearHideTimeout();
      } else {
        scheduleHide();
      }
    }

    function setFocusInsideContent(isFocused: boolean): void {
      isFocusInsideContent = isFocused;
      if (isFocused) {
        clearHideTimeout();
      } else {
        scheduleHide();
      }
    }

    function registerContentFocusFunctions(focusFirst: () => void, focusLast: () => void): void {
      contentFocusFirstFn = focusFirst;
      contentFocusLastFn = focusLast;
    }

    return {
      content: content.asReadonly(),
      disabled: disabled.asReadonly(),
      placement: placement.asReadonly(),
      offset: offset.asReadonly(),
      flip: flip.asReadonly(),
      shift: shift.asReadonly(),
      container: container.asReadonly(),
      open,
      id,
      contentId: computed(() => contentId()),
      show,
      hide,
      focusFirstContentItem,
      focusLastContentItem,
      setContentId,
      setPointerOverContent,
      setFocusInsideContent,
      registerContentFocusFunctions,
    } satisfies NgpNavigationMenuTriggerState;
  },
);
