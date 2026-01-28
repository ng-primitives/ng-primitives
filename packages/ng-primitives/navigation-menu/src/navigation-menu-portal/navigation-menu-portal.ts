import { BooleanInput } from '@angular/cdk/coercion';
import {
  booleanAttribute,
  Directive,
  inject,
  Injector,
  input,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { Placement } from '@floating-ui/dom';
import {
  coerceOffset,
  coerceShift,
  createOverlay,
  NgpOffset,
  NgpOffsetInput,
  NgpOverlayConfig,
  NgpShift,
  NgpShiftInput,
} from 'ng-primitives/portal';
import {
  ngpNavigationMenuPortal,
  provideNavigationMenuPortalState,
} from './navigation-menu-portal-state';

/**
 * Apply the `ngpNavigationMenuPortal` directive to a template to create a portal
 * for navigation menu content with viewport-aware positioning.
 */
@Directive({
  selector: '[ngpNavigationMenuPortal]',
  exportAs: 'ngpNavigationMenuPortal',
  providers: [provideNavigationMenuPortalState({ inherit: false })],
})
export class NgpNavigationMenuPortal {
  /** Access the view container reference. */
  private readonly viewContainerRef = inject(ViewContainerRef);

  /** Access the template reference. */
  private readonly templateRef = inject(TemplateRef);

  /** Access the injector. */
  private readonly injector = inject(Injector);

  /**
   * The placement of the portal.
   * @default 'bottom'
   */
  readonly placement = input<Placement>('bottom', {
    alias: 'ngpNavigationMenuPortalPlacement',
  });

  /**
   * The offset of the portal from the trigger.
   * @default 0
   */
  readonly offset = input<NgpOffset, NgpOffsetInput>(0, {
    alias: 'ngpNavigationMenuPortalOffset',
    transform: coerceOffset,
  });

  /**
   * Whether the portal should flip when there is not enough space.
   * @default true
   */
  readonly flip = input<boolean, BooleanInput>(true, {
    alias: 'ngpNavigationMenuPortalFlip',
    transform: booleanAttribute,
  });

  /**
   * Configure shift behavior to keep the portal in view.
   * @default true
   */
  readonly shift = input<NgpShift, NgpShiftInput>(true, {
    alias: 'ngpNavigationMenuPortalShift',
    transform: coerceShift,
  });

  /**
   * The container element or selector for the portal.
   * @default null (document.body)
   */
  readonly container = input<HTMLElement | string | null>(null, {
    alias: 'ngpNavigationMenuPortalContainer',
  });

  private readonly state = ngpNavigationMenuPortal({
    placement: this.placement,
    offset: this.offset,
    flip: this.flip,
    shift: this.shift,
    container: this.container,
    createOverlayFn: triggerElement => this.createOverlay(triggerElement),
  });

  /**
   * Whether the portal is open.
   */
  readonly open = this.state.open;

  /**
   * The overlay instance.
   */
  readonly overlay = this.state.overlay;

  /**
   * Create the overlay.
   */
  private createOverlay(triggerElement: HTMLElement) {
    const config: NgpOverlayConfig<void> = {
      content: this.templateRef,
      viewContainerRef: this.viewContainerRef,
      triggerElement,
      injector: this.injector,
      placement: this.placement,
      offset: this.offset(),
      flip: this.flip(),
      shift: this.shift(),
      closeOnOutsideClick: false, // Menu handles this
      closeOnEscape: false, // Menu handles this
      restoreFocus: false,
      scrollBehaviour: 'reposition',
      container: this.container(),
    };

    return createOverlay(config);
  }
}
