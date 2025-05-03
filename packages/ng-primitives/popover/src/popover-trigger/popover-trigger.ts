import { FocusMonitor, FocusOrigin } from '@angular/cdk/a11y';
import { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import { BlockScrollStrategy, NoopScrollStrategy, ViewportRuler } from '@angular/cdk/overlay';
import { ComponentPortal, DomPortalOutlet, TemplatePortal } from '@angular/cdk/portal';
import { DOCUMENT } from '@angular/common';
import {
  booleanAttribute,
  ComponentRef,
  computed,
  Directive,
  EmbeddedViewRef,
  inject,
  Injector,
  input,
  numberAttribute,
  OnDestroy,
  signal,
  TemplateRef,
  Type,
  ViewContainerRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  autoUpdate,
  computePosition,
  flip,
  Middleware,
  offset,
  Placement,
  shift,
} from '@floating-ui/dom';
import {
  injectElementRef,
  injectExitAnimationManager,
  provideExitAnimationManager,
} from 'ng-primitives/internal';
import { fromResizeEvent } from 'ng-primitives/resize';
import { injectDisposables } from 'ng-primitives/utils';
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
   * Access the exit animation state.
   */
  private readonly exitAnimationState = injectExitAnimationManager();

  /**
   * Inject the parent popover trigger if available.
   */
  private readonly parentTrigger = injectPopoverTriggerState<T>({
    skipSelf: true,
    optional: true,
  });

  /**
   * Access the view container ref.
   */
  private readonly viewContainerRef = inject(ViewContainerRef);

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
   * Access the disposable utilities
   */
  private readonly disposables = injectDisposables();

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
   * Store the popover view ref.
   */
  protected readonly viewRef = signal<ComponentRef<unknown> | EmbeddedViewRef<void> | null>(null);

  /**
   * Determines if the popover is open.
   */
  readonly open = computed(() => this.viewRef() !== null);

  /**
   * Derive the popover middleware from the provided configuration.
   */
  private readonly middleware = computed(() => {
    const middleware: Middleware[] = [offset(this.state.offset()), shift()];

    if (this.state.flip()) {
      middleware.push(flip());
    }

    return middleware;
  });

  /**
   * Store the computed position of the popover.
   * @internal
   */
  readonly position = signal<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  /**
   * @internal
   * Store the trigger width.
   */
  readonly width = signal<number | null>(null);

  /**
   * The dispose function to stop computing the position of the popover.
   */
  private dispose?: () => void;

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
   * @internal
   * The timeout to open the popover.
   */
  private openTimeout?: () => void;

  /**
   * @internal
   * The timeout to close the popover.
   */
  private closeTimeout?: () => void;

  /**
   * The popover trigger state.
   */
  readonly state = popoverTriggerState<NgpPopoverTrigger<T>>(this);

  constructor() {
    // if the trigger has a parent trigger then register it to the stack
    this.parentTrigger()?.stack.push(this);

    // update the width of the trigger when it resizes
    fromResizeEvent(this.trigger.nativeElement)
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.width.set(this.trigger.nativeElement.offsetWidth));
  }

  ngOnDestroy(): void {
    // remove the trigger from the parent trigger's stack
    this.parentTrigger()?.stack.splice(this.parentTrigger()?.stack.indexOf(this), 1);

    this.destroyPopover();
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
    // if closing is in progress then clear the timeout to stop the popover from closing
    this.closeTimeout?.();

    // if the trigger is disabled or the popover is already open then do not show the popover
    if (this.state.disabled() || this.openTimeout) {
      return;
    }

    this.openTimeout = this.disposables.setTimeout(() => {
      this.openTimeout = undefined;
      this.createPopover(origin);
    }, this.state.showDelay());

    // Add document click listener to detect outside clicks
    if (this.state.closeOnOutsideClick()) {
      this.documentClickListener = this.onDocumentClick.bind(this);
      this.document.addEventListener('mouseup', this.documentClickListener, true);
    }
  }

  /**
   * @internal
   * Hide the popover.
   */
  hide(origin: FocusOrigin = 'program'): void {
    // if opening is in progress then clear the timeout to stop the popover from opening
    this.openTimeout?.();

    // if the trigger is disabled or the popover is not open then do not hide the popover
    if (this.state.disabled() || this.closeTimeout || !this.open()) {
      return;
    }

    // close all child popovers
    for (const child of this.stack) {
      child.hide(origin);
    }

    // disable the focus trap in the popover to prevent it trying to return focus to the popover
    // when the popover is closed/closing
    this.popoverInstance?.focusTrap().disabled.set(true);

    // ensure the trigger is focused after closing the popover
    this.focusTrigger(origin);

    this.closeTimeout = this.disposables.setTimeout(async () => {
      this.closeTimeout = undefined;

      await this.destroyPopover();
    }, this.state.hideDelay());
  }

  private onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    const viewRef = this.viewRef();

    // get the popover element
    const popoverElement =
      viewRef instanceof ComponentRef ? viewRef.location.nativeElement : viewRef?.rootNodes[0];

    // Check if the click is outside the trigger or the popover
    const isOutside =
      !this.trigger.nativeElement.contains(target) && !popoverElement?.contains(target);

    // Determine if this is a click inside another popover

    if (isOutside) {
      // Close the popover
      this.hide('mouse');
    }
  }

  private createPopover(origin: FocusOrigin): void {
    // clear the open timeout
    this.openTimeout = undefined;

    const popover = this.state.popover();

    let portal: TemplatePortal | ComponentPortal<unknown>;

    // Create a new inject with the tooltip context
    const injector = Injector.create({
      parent: this.injector,
      providers: [providePopoverContext(this.state.context())],
    });

    if (popover instanceof TemplateRef) {
      portal = new TemplatePortal<NgpPopoverTemplateContext<T>>(
        popover,
        this.viewContainerRef,
        { $implicit: this.state.context() } as NgpPopoverTemplateContext<T>,
        injector,
      );
    } else if (popover instanceof Type) {
      portal = new ComponentPortal(popover, this.viewContainerRef, injector);
    } else {
      throw new Error('Popover must be either a TemplateRef or a ComponentType');
    }

    const domOutlet = new DomPortalOutlet(
      this.state.container() ?? this.document.body,
      undefined,
      undefined,
      injector,
    );

    const viewRef = domOutlet.attach(portal);
    this.viewRef.set(viewRef);

    let outletElement: HTMLElement | null = null;

    if (viewRef instanceof ComponentRef) {
      viewRef.changeDetectorRef.detectChanges();
      outletElement = viewRef.location.nativeElement;
    } else if (viewRef) {
      viewRef.detectChanges();
      outletElement = viewRef.rootNodes[0] as HTMLElement;
    }

    if (!outletElement) {
      throw new Error('Outlet element is not available.');
    }

    // determine if the popover is fixed or absolute
    const strategy = getComputedStyle(outletElement).position === 'fixed' ? 'fixed' : 'absolute';

    this.dispose = autoUpdate(this.trigger.nativeElement, outletElement, async () => {
      const position = await computePosition(this.trigger.nativeElement, outletElement, {
        placement: this.state.placement(),
        middleware: this.middleware(),
        strategy,
      });

      this.position.set({ x: position.x, y: position.y });
      viewRef?.detectChanges();
    });

    // activate the scroll strategy
    this.scrollStrategy().enable();

    // set the initial focus to the first tabbable element in the popover
    this.popoverInstance?.setInitialFocus(origin);
  }

  private async destroyPopover(): Promise<void> {
    // clear the close timeout
    this.closeTimeout = undefined;

    const viewRef = this.viewRef();

    if (!viewRef) {
      return;
    }

    // we remove this to prevent the popover from being destroyed twice
    // because ngOnDestroy will be called on the viewRef
    // when the popover is destroyed triggering this method again
    this.viewRef.set(null);

    await this.exitAnimationState.exit();

    // destroy the view ref
    viewRef.destroy();

    this.dispose?.();

    // deactivate the scroll strategy
    this.scrollStrategy().disable();

    // Remove the document click listener when the popover is hidden
    if (this.documentClickListener) {
      this.document.removeEventListener('mouseup', this.documentClickListener, true);
    }
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
