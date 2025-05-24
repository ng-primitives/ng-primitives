import { FocusOrigin } from '@angular/cdk/a11y';
import { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import {
  booleanAttribute,
  computed,
  Directive,
  inject,
  Injector,
  input,
  numberAttribute,
  signal,
} from '@angular/core';
import { Placement } from '@floating-ui/dom';
import { injectElementRef, provideExitAnimationManager } from 'ng-primitives/internal';
import {
  createOverlay,
  NgpOverlay,
  NgpOverlayConfig,
  NgpOverlayContent,
} from 'ng-primitives/portal';
import { injectMenuConfig } from '../config/menu-config';
import { menuTriggerState, provideMenuTriggerState } from './menu-trigger-state';

/**
 * The `NgpMenuTrigger` directive allows you to turn an element into a menu trigger.
 */
@Directive({
  selector: '[ngpMenuTrigger]',
  exportAs: 'ngpMenuTrigger',
  providers: [provideMenuTriggerState({ inherit: false }), provideExitAnimationManager()],
  host: {
    'aria-haspopup': 'true',
    '[attr.aria-expanded]': 'open() ? "true" : "false"',
    '[attr.data-open]': 'open() ? "" : null',
    '[attr.data-placement]': 'state.placement()',
    '(click)': 'toggle($event)',
  },
})
export class NgpMenuTrigger<T = void> {
  /**
   * Access the trigger element
   */
  private readonly trigger = injectElementRef();

  /**
   * Access the injector.
   */
  private readonly injector = inject(Injector);

  /**
   * Access the global menu configuration.
   */
  private readonly config = injectMenuConfig();

  /**
   * Access the menu template ref.
   */
  readonly menu = input<NgpOverlayContent<T>>(undefined, {
    alias: 'ngpMenuTrigger',
  });

  /**
   * Define if the trigger should be disabled.
   * @default false
   */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpMenuTriggerDisabled',
    transform: booleanAttribute,
  });

  /**
   * Define the placement of the menu relative to the trigger.
   * @default 'bottom-start'
   */
  readonly placement = input<Placement>(this.config.placement, {
    alias: 'ngpMenuTriggerPlacement',
  });

  /**
   * Define the offset of the menu relative to the trigger.
   * @default 0
   */
  readonly offset = input<number, NumberInput>(this.config.offset, {
    alias: 'ngpMenuTriggerOffset',
    transform: numberAttribute,
  });

  /**
   * Define whether the menu should flip when there is not enough space for the menu.
   * @default true
   */
  readonly flip = input<boolean, BooleanInput>(this.config.flip, {
    alias: 'ngpMenuTriggerFlip',
    transform: booleanAttribute,
  });

  /**
   * Define the container in which the menu should be attached.
   * @default document.body
   */
  readonly container = input<HTMLElement | null>(this.config.container, {
    alias: 'ngpMenuTriggerContainer',
  });

  /**
   * Defines how the menu behaves when the window is scrolled.
   * @default 'block'
   */
  readonly scrollBehavior = input<'reposition' | 'block'>(this.config.scrollBehavior, {
    alias: 'ngpMenuTriggerScrollBehavior',
  });

  /**
   * Provide context to the menu. This can be used to pass data to the menu content.
   */
  readonly context = input<T>(undefined, {
    alias: 'ngpMenuTriggerContext',
  });

  /**
   * The overlay that manages the menu
   * @internal
   */
  readonly overlay = signal<NgpOverlay<T> | null>(null);

  /**
   * The open state of the menu.
   * @internal
   */
  readonly open = computed(() => this.overlay()?.isOpen() ?? false);

  /**
   * The menu trigger state.
   */
  readonly state = menuTriggerState<NgpMenuTrigger<T>>(this);

  ngOnDestroy(): void {
    this.overlay()?.destroy();
  }

  protected toggle(event: MouseEvent): void {
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
      this.show();
    }
  }

  /**
   * Show the popover.
   */
  show(): void {
    // If the trigger is disabled, don't show the popover
    if (this.state.disabled()) {
      return;
    }

    // Create the overlay if it doesn't exist yet
    if (!this.overlay()) {
      this.createOverlay();
    }

    // Show the overlay
    this.overlay()?.show();
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

    // Hide the overlay
    this.overlay()?.hide({ origin });
  }

  /**
   * Create the overlay that will contain the popover
   */
  private createOverlay(): void {
    const menu = this.state.menu();

    if (!menu) {
      throw new Error('Menu must be either a TemplateRef or a ComponentType');
    }

    // Create config for the overlay
    const config: NgpOverlayConfig<T> = {
      content: menu,
      triggerElement: this.trigger.nativeElement,
      injector: this.injector,
      context: this.state.context(),
      container: this.state.container(),
      placement: this.state.placement(),
      offset: this.state.offset(),
      flip: this.state.flip(),
      closeOnOutsideClick: true,
      closeOnEscape: true,
      restoreFocus: true,
      scrollBehaviour: this.state.scrollBehavior(),
    };

    this.overlay.set(createOverlay(config));
  }
}
