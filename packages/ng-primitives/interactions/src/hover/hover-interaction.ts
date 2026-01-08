import { isPlatformBrowser } from '@angular/common';
import { DOCUMENT } from '@angular/common';
import { ElementRef, inject, Injectable, PLATFORM_ID, Signal, signal } from '@angular/core';
import { onDomRemoval } from 'ng-primitives/internal';
import { dataBinding, listener } from 'ng-primitives/state';
import { onBooleanChange } from 'ng-primitives/utils';
import { isHoverEnabled } from '../config/interactions-config';

/**
 * We use a service here as this value is a singleton
 * and allows us to register the dom events once.
 */
@Injectable({
  providedIn: 'root',
})
class GlobalPointerEvents {
  /**
   * Whether global mouse events should be ignored.
   */
  ignoreEmulatedMouseEvents: boolean = false;

  /**
   * Access the document.
   */
  private readonly document = inject(DOCUMENT);

  /**
   * Determine the platform id.
   */
  private readonly platformId = inject(PLATFORM_ID);

  constructor() {
    // we only want to setup events on the client
    if (isPlatformBrowser(this.platformId)) {
      this.setupGlobalTouchEvents();
    }
  }

  private setupGlobalTouchEvents(): void {
    this.document.addEventListener('pointerup', this.handleGlobalPointerEvent.bind(this));
    this.document.addEventListener('touchend', this.setGlobalIgnoreEmulatedMouseEvents.bind(this));
  }

  private setGlobalIgnoreEmulatedMouseEvents(): void {
    this.ignoreEmulatedMouseEvents = true;
    // Clear globalIgnoreEmulatedMouseEvents after a short timeout. iOS fires onPointerEnter
    // with pointerType="mouse" immediately after onPointerUp and before onFocus. On other
    // devices that don't have this quirk, we don't want to ignore a mouse hover sometime in
    // the distant future because a user previously touched the element.
    setTimeout(() => (this.ignoreEmulatedMouseEvents = false), 50);
  }

  private handleGlobalPointerEvent(event: PointerEvent): void {
    if (event.pointerType === 'touch') {
      this.setGlobalIgnoreEmulatedMouseEvents();
    }
  }
}

interface NgpHoverProps {
  disabled?: Signal<boolean>;
  onHoverStart?: () => void;
  onHoverEnd?: () => void;
}

export interface NgpHoverState {
  hovered: Signal<boolean>;
}

/**
 * Programatically add the hover functionality to an element.
 * This is useful in cases where we can't necessarily use a HostDirective,
 * because there is a chance the directive has already been used.
 * @internal
 */
export function ngpHover({
  onHoverStart,
  onHoverEnd,
  disabled = signal(false),
}: NgpHoverProps): NgpHoverState {
  const canHover = isHoverEnabled();

  if (!canHover) {
    return { hovered: signal(false) };
  }

  /**
   * Access the element.
   */
  const elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  /**
   * Access the global pointer events handler.
   */
  const globalPointerEvents = inject(GlobalPointerEvents);

  /**
   * Store the current hover state.
   */
  const hovered = signal<boolean>(false);

  /**
   * Whether this element should ignore emulated mouse events.
   */
  let ignoreEmulatedMouseEvents: boolean = false;

  /**
   * Setup event listeners.
   */
  listener(elementRef.nativeElement, 'pointerenter', onPointerEnter);
  listener(elementRef.nativeElement, 'pointerleave', onPointerLeave);
  listener(elementRef.nativeElement, 'touchstart', onTouchStart, { config: { passive: true } });
  listener(elementRef.nativeElement, 'mouseenter', onMouseEnter);
  listener(elementRef.nativeElement, 'mouseleave', onMouseLeave);

  // anytime the disabled state changes to true, we must reset the hover state
  if (disabled) {
    onBooleanChange(disabled, reset);
  }

  // if the element is removed from the dom, we want to reset the hover state
  onDomRemoval(elementRef.nativeElement, reset);

  // anytime the hover state changes we want to update the attribute
  dataBinding(elementRef, 'data-hover', hovered);

  /**
   * Reset the hover state.
   */
  function reset(): void {
    onHoverFinished('mouse');
  }

  /**
   * Trigger the hover start events.
   * @param event
   * @param pointerType
   */
  function onHoverBegin(event: Event, pointerType: string): void {
    if (
      disabled() ||
      pointerType === 'touch' ||
      hovered() ||
      !(event.currentTarget as Element)?.contains(event.target as Element)
    ) {
      return;
    }

    hovered.set(true);
    onHoverStart?.();
  }

  /**
   * Trigger the hover end events.
   * @param pointerType
   */
  function onHoverFinished(pointerType: string): void {
    if (pointerType === 'touch' || !hovered()) {
      return;
    }

    hovered.set(false);
    onHoverEnd?.();
  }

  function onPointerEnter(event: PointerEvent): void {
    if (globalPointerEvents.ignoreEmulatedMouseEvents && event.pointerType === 'mouse') {
      return;
    }

    onHoverBegin(event, event.pointerType);
  }

  function onPointerLeave(event: PointerEvent): void {
    if (!disabled() && (event.currentTarget as Element)?.contains(event.target as Element)) {
      onHoverFinished(event.pointerType);
    }
  }

  function onTouchStart(): void {
    ignoreEmulatedMouseEvents = true;
  }

  function onMouseEnter(event: MouseEvent): void {
    if (!ignoreEmulatedMouseEvents && !globalPointerEvents.ignoreEmulatedMouseEvents) {
      onHoverBegin(event, 'mouse');
    }

    ignoreEmulatedMouseEvents = false;
  }

  function onMouseLeave(event: MouseEvent): void {
    if (!disabled() && (event.currentTarget as Element)?.contains(event.target as Element)) {
      onHoverFinished('mouse');
    }
  }

  return { hovered };
}
