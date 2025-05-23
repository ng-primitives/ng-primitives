import { FocusMonitor, FocusOrigin } from '@angular/cdk/a11y';
import { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import { BlockScrollStrategy, NoopScrollStrategy, ViewportRuler } from '@angular/cdk/overlay';
import { DOCUMENT } from '@angular/common';
import {
  booleanAttribute,
  computed,
  Directive,
  inject,
  Injector,
  input,
  numberAttribute,
  OnDestroy,
  signal,
  TemplateRef,
  Type,
} from '@angular/core';
import { Placement } from '@floating-ui/dom';
import { injectElementRef, provideExitAnimationManager } from 'ng-primitives/internal';
import { createOverlay, NgpOverlay, NgpOverlayConfig } from 'ng-primitives/portal';
import { injectPopoverConfig } from '../config/popover-config';
import type { NgpPopover } from '../popover/popover';
import { providePopoverContext } from '../popover/popover-token';
import {
  injectPopoverTriggerState,
  popoverTriggerState,
  providePopoverTriggerState,
} from './popover-trigger-state';

/**
 * Apply the `ngpPopoverTrigger` directive to an element that triggers the popover to show.
 */
@Directive({
  selector: '[ngpPopoverTrigger]',
  exportAs: 'ngpPopoverTrigger',
  providers: [providePopoverTriggerState({ inherit: false }), provideExitAnimationManager()],
  host: {
    '[attr.aria-expanded]': 'open() ? "true" : "false"',
    '[attr.data-open]': 'open() ? "" : null',
    '[attr.data-placement]': 'state.placement()',
    '(click)': 'toggleOpenState($event)',
    '(document:keydown.escape)': 'handleEscapeKey()',
  },
})
export class NgpPopoverTrigger<T = null> implements OnDestroy {
  /**
   * Access the trigger element
   */
  private readonly trigger = injectElementRef();

  /**
   * Inject the parent popover trigger if available.
   */
  private readonly parentTrigger = injectPopoverTriggerState<T>({
    skipSelf: true,
    optional: true,
  });

  /**
   * Access the document.
   */
  private readonly document = inject(DOCUMENT);

  /**
   * Access the viewport ruler.
   */
  private readonly viewportRuler = inject(ViewportRuler);

  /**
   * Access the injector.
   */
  private readonly injector = inject(Injector);

  /**
   * Access the global popover configuration.
   */
  private readonly config = injectPopoverConfig();

  /**
   * Access the focus monitor.
   */
  private readonly focusMonitor = inject(FocusMonitor);

  /**
   * Access the popover template ref.
   */
  readonly popover = input<NgpPopoverContent<T> | null>(null, {
    alias: 'ngpPopoverTrigger',
  });

  /**
   * Define if the trigger should be disabled.
   * @default false
   */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpPopoverTriggerDisabled',
    transform: booleanAttribute,
  });

  /**
   * Define the placement of the popover relative to the trigger.
   * @default 'top'
   */
  readonly placement = input<Placement>(this.config.placement, {
    alias: 'ngpPopoverTriggerPlacement',
  });

  /**
   * Define the offset of the popover relative to the trigger.
   * @default 0
   */
  readonly offset = input<number, NumberInput>(this.config.offset, {
    alias: 'ngpPopoverTriggerOffset',
    transform: numberAttribute,
  });

  /**
   * Define the delay before the popover is displayed.
   * @default 0
   */
  readonly showDelay = input<number, NumberInput>(this.config.showDelay, {
    alias: 'ngpPopoverTriggerShowDelay',
    transform: numberAttribute,
  });

  /**
   * Define the delay before the popover is hidden.
   * @default 0
   */
  readonly hideDelay = input<number, NumberInput>(this.config.hideDelay, {
    alias: 'ngpPopoverTriggerHideDelay',
    transform: numberAttribute,
  });

  /**
   * Define whether the popover should flip when there is not enough space for the popover.
   * @default true
   */
  readonly flip = input<boolean, BooleanInput>(this.config.flip, {
    alias: 'ngpPopoverTriggerFlip',
    transform: booleanAttribute,
  });

  /**
   * Define the container in which the popover should be attached.
   * @default document.body
   */
  readonly container = input<HTMLElement | null>(this.config.container, {
    alias: 'ngpPopoverTriggerContainer',
  });

  /**
   * Define whether the popover should close when clicking outside of it.
   * @default true
   */
  readonly closeOnOutsideClick = input<boolean, BooleanInput>(this.config.closeOnOutsideClick, {
    alias: 'ngpPopoverTriggerCloseOnOutsideClick',
    transform: booleanAttribute,
  });

  /**
   * Define whether the popover should close when the escape key is pressed.
   * @default true
   */
  readonly closeOnEscape = input<boolean, BooleanInput>(this.config.closeOnEscape, {
    alias: 'ngpPopoverTriggerCloseOnEscape',
    transform: booleanAttribute,
  });

  /**
   * Defines how the popover behaves when the window is scrolled.
   * @default 'reposition'
   */
  readonly scrollBehavior = input<'reposition' | 'block'>(this.config.scrollBehavior, {
    alias: 'ngpPopoverTriggerScrollBehavior',
  });

  /**
   * Provide context to the popover.
   * @default null
   */
  readonly context = input<T | null>(null, {
    alias: 'ngpPopoverTriggerContext',
  });

  /**
   * The overlay that manages the popover
   * @internal
   */
  readonly overlay = signal<NgpOverlay<T> | null>(null);

  /**
   * Determines if the popover is open.
   */
  readonly open = computed(() => this.overlay()?.isOpen() || false);

  /**
   * A document-wide click listener that checks if the click
   * occurred outside of the popover and trigger elements.
   */
  private documentClickListener?: (event: MouseEvent) => void;

  /**
   * Store the popover instance.
   * @internal
   */
  private popoverInstance: NgpPopover | null = null;

  /**
   * Get the scroll strategy based on the configuration.
   */
  private readonly scrollStrategy = computed(() =>
    this.state.scrollBehavior() === 'block'
      ? new BlockScrollStrategy(this.viewportRuler, this.document)
      : new NoopScrollStrategy(),
  );

  /**
   * @internal
   * Register any child popover to the stack.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly stack: NgpPopoverTrigger<any>[] = [];

  /**
   * The popover trigger state.
   */
  readonly state = popoverTriggerState<NgpPopoverTrigger<T>>(this);

  constructor() {
    // if the trigger has a parent trigger then register it to the stack
    this.parentTrigger()?.stack.push(this);
  }

  ngOnDestroy(): void {
    // remove the trigger from the parent trigger's stack
    this.parentTrigger()?.stack.splice(this.parentTrigger()?.stack.indexOf(this), 1);

    this.overlay()?.destroy();

    // Remove document click listener if exists
    if (this.documentClickListener) {
      this.document.removeEventListener('mouseup', this.documentClickListener, true);
    }

    // Deactivate scroll strategy if active
    if (this.open()) {
      this.scrollStrategy().disable();
    }
  }

  protected toggleOpenState(event: MouseEvent): void {
    // if the trigger is disabled then do not toggle the popover
    if (this.state.disabled()) {
      return;
    }

    // determine the origin of the event, 0 is keyboard, 1 is mouse
    const origin: FocusOrigin = event.detail === 0 ? 'keyboard' : 'mouse';

    // if the popover is open then hide it
    if (this.open()) {
      this.hide(origin);
    } else {
      this.show(origin);
    }
  }

  /**
   * Show the popover.
   */
  show(origin: FocusOrigin): void {
    // If the trigger is disabled, don't show the popover
    if (this.state.disabled()) {
      return;
    }

    // Create the overlay if it doesn't exist yet
    if (!this.overlay()) {
      this.createOverlay();
    }

    // Add document click listener to detect outside clicks
    if (this.state.closeOnOutsideClick() && !this.documentClickListener) {
      this.documentClickListener = this.onDocumentClick.bind(this);
      this.document.addEventListener('mouseup', this.documentClickListener, true);
    }

    // Show the overlay
    this.overlay()?.show(this.state.showDelay());

    // Activate the scroll strategy when the overlay is shown
    if (this.overlay()?.isOpen()) {
      this.scrollStrategy().enable();
      // Set initial focus in the popover
      this.popoverInstance?.setInitialFocus(origin);
    }
  }

  /**
   * @internal
   * Hide the popover.
   */
  hide(origin: FocusOrigin = 'program'): void {
    // If the trigger is disabled or the popover is not open, do nothing
    if (this.state.disabled() || !this.open()) {
      return;
    }

    // Disable the focus trap before closing the popover
    this.popoverInstance?.disableFocusTrap();

    // Close all child popovers
    for (const child of this.stack) {
      child.hide(origin);
    }

    // Ensure the trigger is focused after closing the popover
    this.focusTrigger(origin);

    // Hide the overlay
    this.overlay()?.hide(this.state.hideDelay());

    // Deactivate the scroll strategy
    this.scrollStrategy().disable();

    // Remove document click listener
    if (this.documentClickListener) {
      this.document.removeEventListener('mouseup', this.documentClickListener, true);
      this.documentClickListener = undefined;
    }
  }

  private onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    // Get the popover element from the overlay
    const popoverElement = this.overlay()?.getElements()[0] as HTMLElement | undefined;

    // Check if the click is outside the trigger or the popover
    const isOutside =
      !this.trigger.nativeElement.contains(target) && !popoverElement?.contains(target);

    if (isOutside) {
      // Close the popover
      this.hide('mouse');
    }
  }

  /**
   * Create the overlay that will contain the popover
   */
  private createOverlay(): void {
    const popover = this.state.popover();

    if (!popover) {
      throw new Error('Popover must be either a TemplateRef or a ComponentType');
    }

    // Create config for the overlay
    const config: NgpOverlayConfig<T> = {
      content: popover,
      triggerElement: this.trigger.nativeElement,
      injector: this.injector,
      context: this.state.context(),
      container: this.state.container(),
      placement: this.state.placement(),
      offset: this.state.offset(),
      flip: this.state.flip(),
      showDelay: this.state.showDelay(),
      hideDelay: this.state.hideDelay(),
      providers: [providePopoverContext(this.state.context())],
    };

    this.overlay.set(createOverlay(config));
  }

  /**
   * @internal
   * Handle escape key press to close the popover.
   */
  protected handleEscapeKey(): void {
    if (this.state.closeOnEscape()) {
      this.hide('keyboard');
    }
  }

  private focusTrigger(origin: FocusOrigin): void {
    this.focusMonitor.focusVia(this.trigger.nativeElement, origin);
  }

  /**
   * Set the popover instance.
   * @internal
   */
  setPopover(instance: NgpPopover): void {
    this.popoverInstance = instance;
  }
}

type NgpPopoverTemplateContext<T> = {
  $implicit: T;
};
type NgpPopoverContent<T> = TemplateRef<NgpPopoverTemplateContext<T>> | Type<unknown>;
