/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the CC BY-ND 4.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import type { BooleanInput } from '@angular/cdk/coercion';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  Directive,
  HostListener,
  Injectable,
  OnChanges,
  PLATFORM_ID,
  SimpleChanges,
  booleanAttribute,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { NgpHoverToken } from './hover.token';

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

/**
 * A directive for normalizing hover events across the different browsers and devices.
 *
 * This is an Angular port of the useHover hook from
 * react-aria: https://github.com/adobe/react-spectrum/blob/main/packages/%40react-aria/interactions/src/useHover.ts
 */
@Directive({
  standalone: true,
  selector: '[ngpHover]',
  exportAs: 'ngpHover',
  providers: [{ provide: NgpHoverToken, useExisting: NgpHover }],
  host: {
    '[attr.data-hover]': 'hovered()',
  },
})
export class NgpHover implements OnChanges {
  /**
   * Access the global pointer events handler.
   */
  private readonly globalPointerEvents = inject(GlobalPointerEvents);

  /**
   * Whether hoving should be disabled.
   */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpHoverDisabled',
    transform: booleanAttribute,
  });

  /**
   * Store the current hover state.
   */
  protected hovered = signal<boolean>(false);

  /**
   * Whether this element should ignore emulated mouse events.
   */
  private ignoreEmulatedMouseEvents: boolean = false;

  /**
   * Emit an event when hovering starts.
   */
  readonly hoverStart = output<void>({ alias: 'ngpHoverStart' });

  /**
   * Emit an event when hovering ends.
   */
  readonly hoverEnd = output<void>({ alias: 'ngpHoverEnd' });

  /**
   * Emit an event when the hover state changes.
   */
  readonly hoverChange = output<boolean>({ alias: 'ngpHoverChange' });

  ngOnChanges(changes: SimpleChanges): void {
    if ('disabled' in changes) {
      // if the component is suddenly disabled and is currently hovered
      // switch to the unhovered state.
      if (changes['disabled'].currentValue === true) {
        this.onHoverEnd('mouse');
      }
    }
  }

  /**
   * Trigger the hover start events.
   * @param event
   * @param pointerType
   */
  private onHoverStart(event: Event, pointerType: string): void {
    if (
      this.disabled() ||
      pointerType === 'touch' ||
      this.hovered() ||
      !(event.currentTarget as Element)?.contains(event.target as Element)
    ) {
      return;
    }

    this.hovered.set(true);
    this.hoverStart.emit();
    this.hoverChange.emit(true);
  }

  /**
   * Trigger the hover end events.
   * @param pointerType
   */
  private onHoverEnd(pointerType: string): void {
    if (pointerType === 'touch' || !this.hovered()) {
      return;
    }

    this.hovered.set(false);
    this.hoverEnd.emit();
    this.hoverChange.emit(false);
  }

  @HostListener('pointerenter', ['$event'])
  protected onPointerEnter(event: PointerEvent): void {
    if (this.globalPointerEvents.ignoreEmulatedMouseEvents && event.pointerType === 'mouse') {
      return;
    }

    this.onHoverStart(event, event.pointerType);
  }

  @HostListener('pointerleave', ['$event'])
  protected onPointerLeave(event: PointerEvent): void {
    if (!this.disabled() && (event.currentTarget as Element)?.contains(event.target as Element)) {
      this.onHoverEnd(event.pointerType);
    }
  }

  @HostListener('touchstart')
  protected onTouchStart(): void {
    this.ignoreEmulatedMouseEvents = true;
  }

  @HostListener('mouseenter', ['$event'])
  protected onMouseEnter(event: MouseEvent): void {
    if (!this.ignoreEmulatedMouseEvents && !this.globalPointerEvents.ignoreEmulatedMouseEvents) {
      this.onHoverStart(event, 'mouse');
    }

    this.ignoreEmulatedMouseEvents = false;
  }

  @HostListener('mouseleave', ['$event'])
  protected onMouseLeave(event: MouseEvent): void {
    if (!this.disabled() && (event.currentTarget as Element)?.contains(event.target as Element)) {
      this.onHoverEnd('mouse');
    }
  }
}
