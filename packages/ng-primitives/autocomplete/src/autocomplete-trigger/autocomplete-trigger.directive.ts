/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Directionality } from '@angular/cdk/bidi';
import { BooleanInput } from '@angular/cdk/coercion';
import { DOWN_ARROW, ENTER, TAB, UP_ARROW, hasModifierKey } from '@angular/cdk/keycodes';
import {
  Overlay,
  ConnectedPosition,
  OverlayRef,
  FlexibleConnectedPositionStrategy,
  OverlayConfig,
} from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { DOCUMENT } from '@angular/common';
import {
  Directive,
  ElementRef,
  Injector,
  OnDestroy,
  TemplateRef,
  ViewContainerRef,
  booleanAttribute,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromResizeEvent } from 'ng-primitives/resize';
import { onChange } from 'ng-primitives/utils';
import { filter } from 'rxjs';
import type { NgpAutocomplete } from '../autocomplete/autocomplete.directive';
import { NgpAutocompleteTriggerToken } from './autocomplete-trigger.token';

@Directive({
  standalone: true,
  selector: 'input[ngpAutocompleteTrigger], textarea[ngpAutocompleteTrigger]',
  exportAs: 'ngpAutocompleteTrigger',
  providers: [{ provide: NgpAutocompleteTriggerToken, useExisting: NgpAutocompleteTrigger }],
  host: {
    '[attr.autocomplete]': 'autocompleteAttribute()',
    '[attr.role]': 'disabled() ? null : "combobox"',
    '[attr.aria-autocomplete]': 'disabled() ? null : "list"',
    // '[attr.aria-activedescendant]': '(panelOpen() && activeOption) ? activeOption.id : null',
    '[attr.aria-expanded]': 'disabled() ? null : panelOpen()',
    // '[attr.aria-controls]': '(disabled() || !panelOpen()) ? null : autocomplete?.id',
    '[attr.aria-haspopup]': 'disabled() ? null : "listbox"',
    '(focusin)': 'openPanel()',
    '(blur)': 'closePanel()',
    '(input)': 'handleInput($event)',
    '(keydown)': 'handleKeydown($event)',
    '(click)': 'openPanel()',
  },
})
export class NgpAutocompleteTrigger implements OnDestroy {
  /** Access the view container ref */
  private readonly viewContainerRef = inject(ViewContainerRef);

  /** Access the overlay service */
  private readonly overlay = inject(Overlay);

  /** Access the directionality service */
  private readonly directionality = inject(Directionality, { optional: true });

  /** Access the document */
  private readonly document = inject(DOCUMENT);

  /** Access the host element. */
  private readonly elementRef =
    inject<ElementRef<HTMLInputElement | HTMLTextAreaElement>>(ElementRef);

  /** The user defined autocomplete attribute */
  readonly autocompleteAttribute = input<string>('off');

  /** The autocomplete associated with the input */
  readonly template = input.required<TemplateRef<void>>({
    alias: 'ngpAutocompleteTrigger',
  });

  /** Whether the autocomplete is disabled */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpAutocompleteDisabled',
    transform: booleanAttribute,
  });

  /** The placement of the autocomplete dropdown */
  readonly position = input<NgpAutocompletePosition>('auto', {
    alias: 'ngpAutocompletePosition',
  });

  /** @internal The autocomplete instance */
  private autocomplete?: NgpAutocomplete;

  /** Determine the overlay position */
  private readonly computedPosition = computed(() => {
    const belowPositions: ConnectedPosition[] = [
      {
        originX: 'start',
        originY: 'bottom',
        overlayX: 'start',
        overlayY: 'top',
      },
      { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top' },
    ];

    const abovePositions: ConnectedPosition[] = [
      {
        originX: 'start',
        originY: 'top',
        overlayX: 'start',
        overlayY: 'bottom',
      },
      { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom' },
    ];

    if (this.position() === 'above') {
      return abovePositions;
    }

    if (this.position() === 'below') {
      return belowPositions;
    }

    return [...belowPositions, ...abovePositions];
  });

  /** The active option */
  get activeOption() {
    return this.autocomplete?.keyManager.activeItem;
  }

  /** The overlay reference */
  private overlayRef?: OverlayRef;

  /** The portal to attach the autocomplete to */
  private portal?: TemplatePortal<void>;

  /** The open state of the autocomplete */
  private readonly panelOpen = signal(false);

  /** The position strategy */
  private positionStrategy?: FlexibleConnectedPositionStrategy;

  constructor() {
    fromResizeEvent(this.elementRef.nativeElement)
      .pipe(takeUntilDestroyed())
      .subscribe(({ width }) => {
        this.overlayRef?.updateSize({ width });
        this.overlayRef?.updatePosition();
      });

    onChange(this.computedPosition, () => {
      this.positionStrategy?.withPositions(this.computedPosition());

      if (this.panelOpen()) {
        this.overlayRef?.updatePosition();
      }
    });
  }

  ngOnDestroy() {
    this.destroyPanel();
  }

  protected openPanel(): void {
    if (!this.canOpen()) {
      return;
    }

    if (!this.overlayRef) {
      this.portal = new TemplatePortal<void>(
        this.template(),
        this.viewContainerRef,
        undefined,
        Injector.create({
          parent: this.viewContainerRef.injector,
          providers: [{ provide: NgpAutocompleteTriggerToken, useValue: this }],
        }),
      );
      this.overlayRef = this.overlay.create(this.getOverlayConfig());
    }

    if (this.overlayRef && !this.overlayRef.hasAttached()) {
      this.overlayRef.attach(this.portal);
    }

    this.overlayRef.outsidePointerEvents().subscribe(event => {
      // debugger;
    });

    this.overlayRef._keydownEvents
      .pipe(filter(event => event.key === 'Escape'))
      .subscribe(() => this.closePanel());

    this.panelOpen.set(true);
  }

  /** Destroys the autocomplete suggestion panel. */
  private destroyPanel(): void {
    this.closePanel();
    this.overlayRef?.dispose();
    this.overlayRef = undefined;
  }

  /** Determines whether the panel can be opened. */
  private canOpen(): boolean {
    const element = this.elementRef.nativeElement;
    return !element.readOnly && !element.disabled && !this.disabled();
  }

  protected handleKeydown(event: KeyboardEvent): void {
    const keyCode = event.keyCode;
    const hasModifier = hasModifierKey(event);

    if (this.activeOption && keyCode === ENTER && this.panelOpen() && !hasModifier) {
      // this.activeOption._selectViaInteraction();
      // this._resetActiveItem();
      event.preventDefault();
    } else if (this.autocomplete) {
      const prevActiveItem = this.autocomplete.keyManager.activeItem;
      const isArrowKey = keyCode === UP_ARROW || keyCode === DOWN_ARROW;

      if (keyCode === TAB || (isArrowKey && !hasModifier && this.panelOpen())) {
        this.autocomplete.keyManager.onKeydown(event);
      } else if (isArrowKey && this.canOpen()) {
        this.openPanel();
      }

      if (isArrowKey || this.autocomplete.keyManager.activeItem !== prevActiveItem) {
        // this._scrollToOption(this.autocomplete._keyManager.activeItemIndex || 0);
        //
        // if (this.autocomplete.autoSelectActiveOption && this.activeOption) {
        //   if (!this._pendingAutoselectedOption) {
        //     this._valueBeforeAutoSelection = this._valueOnLastKeydown;
        //   }
        //
        //   this._pendingAutoselectedOption = this.activeOption;
        //   this._assignOptionValue(this.activeOption.value);
        // }
      }
    }
  }

  protected handleInput(event: InputEvent): void {
    // get the current value
    const value = this.elementRef.nativeElement.value;

    // if the input has been cleared remove any selected value
    if (value.trim().length === 0) {
      // this.clearSelectedOption();
      return;
    }

    // if a dropdown item is selected check that it matches the display value
    if (this.panelOpen()) {
      // const selectedOption = this.autocomplete.options?.find(option => option.selected);

      // if (selectedOption) {
      //   const display = this.getDisplayValue(selectedOption.value);

      //   if (value !== display) {
      //     selectedOption.deselect(false);
      //   }
      // }
      return;
    }

    if (this.canOpen() && this.document.activeElement === event.target) {
      this.openPanel();
    }
  }

  /** Closes the autocomplete suggestion panel. */
  closePanel(): void {
    if (!this.panelOpen()) {
      return;
    }

    this.panelOpen.set(false);

    if (this.overlayRef?.hasAttached()) {
      this.overlayRef.detach();
    }
  }

  private getOverlayConfig(): OverlayConfig {
    this.positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(this.elementRef)
      .withFlexibleDimensions(false)
      .withPush(false);

    this.positionStrategy.withPositions(this.computedPosition());

    return new OverlayConfig({
      positionStrategy: this.positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      width: this.elementRef.nativeElement.getBoundingClientRect().width,
      direction: this.directionality ?? undefined,
    });
  }

  /**
   * Register the autocomplete instance
   * @internal
   */
  registerAutocomplete(autocomplete: NgpAutocomplete): void {
    this.autocomplete = autocomplete;
  }
}

export type NgpAutocompletePosition = 'auto' | 'above' | 'below';
