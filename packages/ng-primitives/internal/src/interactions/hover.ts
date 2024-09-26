/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { effect, ElementRef, inject, Injectable, PLATFORM_ID, Signal, signal } from '@angular/core';
import { injectDisposables, onBooleanChange } from 'ng-primitives/utils';

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

interface NgpHoverOptions {
  disabled?: Signal<boolean>;
  hoverStart?: () => void;
  hoverEnd?: () => void;
}

export interface NgpHoverState {
  hovered: Signal<boolean>;
}

/**
 * Programatically add the hover functionality to an element.
 * This is useful in cases where we can't necessarily use a HostDirective,
 * because there is a chance the directive has already been used.
 */
export function setupHover({
  hoverStart,
  hoverEnd,
  disabled = signal(false),
}: NgpHoverOptions): NgpHoverState {
  /**
   * Access the element.
   */
  const elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  /**
   * Access the global pointer events handler.
   */
  const globalPointerEvents = inject(GlobalPointerEvents);

  /**
   * Access the disposable helper.
   */
  const disposables = injectDisposables();

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
  disposables.addEventListener(elementRef.nativeElement, 'pointerenter', onPointerEnter);
  disposables.addEventListener(elementRef.nativeElement, 'pointerleave', onPointerLeave);
  disposables.addEventListener(elementRef.nativeElement, 'touchstart', onTouchStart);
  disposables.addEventListener(elementRef.nativeElement, 'mouseenter', onMouseEnter);
  disposables.addEventListener(elementRef.nativeElement, 'mouseleave', onMouseLeave);

  // anytime the disabled state changes to true, we must reset the hover state
  if (disabled) {
    onBooleanChange(disabled, reset);
  }

  // anytime the hover state changes we want to update the attribute
  effect(() => elementRef.nativeElement.setAttribute('data-hover', hovered().toString()));

  /**
   * Reset the hover state.
   */
  function reset(): void {
    onHoverEnd('mouse');
  }

  /**
   * Trigger the hover start events.
   * @param event
   * @param pointerType
   */
  function onHoverStart(event: Event, pointerType: string): void {
    if (
      disabled() ||
      pointerType === 'touch' ||
      hovered() ||
      !(event.currentTarget as Element)?.contains(event.target as Element)
    ) {
      return;
    }

    hovered.set(true);
    hoverStart?.();
  }

  /**
   * Trigger the hover end events.
   * @param pointerType
   */
  function onHoverEnd(pointerType: string): void {
    if (pointerType === 'touch' || !hovered()) {
      return;
    }

    hovered.set(false);
    hoverEnd?.();
  }

  function onPointerEnter(event: PointerEvent): void {
    if (globalPointerEvents.ignoreEmulatedMouseEvents && event.pointerType === 'mouse') {
      return;
    }

    onHoverStart(event, event.pointerType);
  }

  function onPointerLeave(event: PointerEvent): void {
    if (!disabled() && (event.currentTarget as Element)?.contains(event.target as Element)) {
      onHoverEnd(event.pointerType);
    }
  }

  function onTouchStart(): void {
    ignoreEmulatedMouseEvents = true;
  }

  function onMouseEnter(event: MouseEvent): void {
    if (!ignoreEmulatedMouseEvents && !globalPointerEvents.ignoreEmulatedMouseEvents) {
      onHoverStart(event, 'mouse');
    }

    ignoreEmulatedMouseEvents = false;
  }

  function onMouseLeave(event: MouseEvent): void {
    if (!disabled() && (event.currentTarget as Element)?.contains(event.target as Element)) {
      onHoverEnd('mouse');
    }
  }

  return { hovered };
}
