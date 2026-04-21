import { ElementRef, inject, Signal, signal } from '@angular/core';
import { onDomRemoval } from 'ng-primitives/internal';
import { dataBinding, listener } from 'ng-primitives/state';
import { onBooleanChange } from 'ng-primitives/utils';
import { isHoverEnabled } from '../config/interactions-config';

// Module-level flag that tracks whether the user's last input was a touch.
// Kept outside Angular DI so it survives service destruction during SSR
// hydration, micro-frontend re-bootstrap, or any scenario that re-creates
// the root injector. A timeout can't cover delayed emulated events — iOS
// may fire an emulated pointerenter long after the originating touch
// (e.g. after the user navigates away and then taps browser-back).
//
// iOS emulated mouse events never dispatch `pointermove`; only a real
// pointing device does. So a non-touch pointermove is a reliable signal
// that the user has returned to a real mouse.
let hadRecentTouch = false;

if (typeof document !== 'undefined') {
  document.addEventListener('touchend', () => (hadRecentTouch = true), true);
  document.addEventListener(
    'pointerup',
    event => {
      if ((event as PointerEvent).pointerType === 'touch') hadRecentTouch = true;
    },
    true,
  );
  document.addEventListener(
    'pointermove',
    event => {
      if ((event as PointerEvent).pointerType !== 'touch') hadRecentTouch = false;
    },
    true,
  );
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
    if (event.pointerType === 'mouse' && (ignoreEmulatedMouseEvents || hadRecentTouch)) {
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
    if (hovered()) {
      onHoverFinished('mouse');
    }
  }

  function onMouseEnter(event: MouseEvent): void {
    if (!ignoreEmulatedMouseEvents && !hadRecentTouch) {
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
