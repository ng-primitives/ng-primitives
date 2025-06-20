import { FocusOrigin } from '@angular/cdk/a11y';
import { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import {
  booleanAttribute,
  computed,
  Directive,
  HostListener,
  inject,
  Injector,
  input,
  numberAttribute,
  signal,
  ViewContainerRef,
} from '@angular/core';
import { Placement } from '@floating-ui/dom';
import { injectElementRef } from 'ng-primitives/internal';
import {
  createOverlay,
  NgpOverlay,
  NgpOverlayConfig,
  NgpOverlayContent,
} from 'ng-primitives/portal';
import { safeTakeUntilDestroyed } from 'ng-primitives/utils';
import { NgpMenuToken } from '../menu/menu-token';
import { provideSubmenuTriggerState, submenuTriggerState } from './submenu-trigger-state';

@Directive({
  selector: '[ngpSubmenuTrigger]',
  exportAs: 'ngpSubmenuTrigger',
  providers: [provideSubmenuTriggerState({ inherit: false })],
  host: {
    'aria-haspopup': 'true',
    '[attr.aria-expanded]': 'open() ? "true" : "false"',
    '[attr.data-open]': 'open() ? "" : null',
    '(click)': 'toggle($event)',
  },
})
export class NgpSubmenuTrigger<T = unknown> {
  /**
   * Access the menu trigger element.
   */
  private readonly trigger = injectElementRef();

  /**
   * Access the injector.
   */
  private readonly injector = inject(Injector);

  /**
   * Access the view container reference.
   */
  private readonly viewContainerRef = inject(ViewContainerRef);

  /** Access the parent menu */
  private readonly parentMenu = inject(NgpMenuToken, { optional: true });

  /**
   * Access the submenu template ref.
   */
  readonly menu = input<NgpOverlayContent<T>>(undefined, {
    alias: 'ngpSubmenuTrigger',
  });

  /**
   * Define if the trigger should be disabled.
   * @default false
   */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpSubmenuTriggerDisabled',
    transform: booleanAttribute,
  });

  /**
   * Define the placement of the menu relative to the trigger.
   * @default 'right-start'
   */
  readonly placement = input<Placement>('right-start', {
    alias: 'ngpSubmenuTriggerPlacement',
  });

  /**
   * Define the offset of the menu relative to the trigger.
   * @default 0
   */
  readonly offset = input<number, NumberInput>(0, {
    alias: 'ngpSubmenuTriggerOffset',
    transform: numberAttribute,
  });

  /**
   * Define whether the menu should flip when there is not enough space for the menu.
   * @default true
   */
  readonly flip = input<boolean, BooleanInput>(true, {
    alias: 'ngpSubmenuTriggerFlip',
    transform: booleanAttribute,
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
   * Access the menu trigger state.
   */
  readonly state = submenuTriggerState<NgpSubmenuTrigger<T>>(this);

  constructor() {
    this.parentMenu?.closeSubmenus.pipe(safeTakeUntilDestroyed()).subscribe(element => {
      // if the element is not the trigger, we want to close the menu
      if (element === this.trigger.nativeElement) {
        return;
      }

      this.hide('mouse');
    });
  }

  protected toggle(event: MouseEvent): void {
    // if the trigger is disabled then do not toggle the menu
    if (this.state.disabled()) {
      return;
    }

    // determine the origin of the event, 0 is keyboard, 1 is mouse
    const origin: FocusOrigin = event.detail === 0 ? 'keyboard' : 'mouse';

    // if the menu is open then hide it
    if (this.open()) {
      this.hide(origin);
    } else {
      this.show();
    }
  }

  /**
   * Show the menu.
   */
  show(): void {
    // If the trigger is disabled, don't show the menu
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
   * Hide the menu.
   */
  hide(origin: FocusOrigin = 'program'): void {
    // If the trigger is disabled or the menu is not open, do nothing
    if (this.state.disabled() || !this.open()) {
      return;
    }

    // Hide the overlay
    this.overlay()?.hide({ origin });
  }

  /**
   * Create the overlay that will contain the menu
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
      placement: this.state.placement(),
      offset: this.state.offset(),
      flip: this.state.flip(),
      closeOnOutsideClick: true,
      closeOnEscape: true,
      restoreFocus: true,
      viewContainerRef: this.viewContainerRef,
    };

    this.overlay.set(createOverlay(config));
  }

  /**
   * If the user presses the right arrow key, we want to open the submenu
   * and focus the first item in the submenu.
   * This behavior will be inverted if the direction is RTL.
   * @param event
   */
  @HostListener('keydown.ArrowRight', ['$event'])
  @HostListener('keydown.ArrowLeft', ['$event'])
  protected showSubmenuOnArrow(event: KeyboardEvent): void {
    const direction = getComputedStyle(this.trigger.nativeElement).direction;

    const isRtl = direction === 'rtl';

    const isRightArrow = event.key === 'ArrowRight';
    const isLeftArrow = event.key === 'ArrowLeft';

    if ((isRightArrow && !isRtl) || (isLeftArrow && isRtl)) {
      event.preventDefault();
      this.show();
    }
  }

  /**
   * If the user hovers over the trigger, we want to open the submenu
   */
  @HostListener('pointerenter', ['$event'])
  protected showSubmenuOnHover(event: PointerEvent): void {
    // if this was triggered by a touch event, we don't want to show the submenu
    // as it will be shown by the click event - this prevents the submenu from being toggled
    if (event.pointerType === 'touch') {
      return;
    }

    this.show();
  }
}
