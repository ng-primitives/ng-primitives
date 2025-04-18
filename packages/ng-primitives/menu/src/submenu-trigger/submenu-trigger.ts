import { FocusOrigin } from '@angular/cdk/a11y';
import { Directive, HostListener, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { injectElementRef } from 'ng-primitives/internal';
import { injectPopoverTriggerState, NgpPopoverTrigger } from 'ng-primitives/popover';
import { NgpMenuToken } from '../menu/menu-token';

@Directive({
  selector: '[ngpSubmenuTrigger]',
  exportAs: 'ngpSubmenuTrigger',
  hostDirectives: [
    { directive: NgpPopoverTrigger, inputs: ['ngpPopoverTrigger:ngpSubmenuTrigger'] },
  ],
  host: {
    'aria-haspopup': 'true',
  },
})
export class NgpSubmenuTrigger {
  /** Access the popover trigger element. */
  private readonly trigger = injectElementRef();

  /** Access the popover trigger state */
  private readonly popoverTrigger = injectPopoverTriggerState();

  /** Access the parent menu */
  private readonly parentMenu = inject(NgpMenuToken, { optional: true });

  constructor() {
    // by default the popover opens below and to the center of the trigger,
    // but as this is a submenu we want to default to opening to the right
    // and to the start
    this.popoverTrigger().placement.set('right-start');

    this.parentMenu?.closeSubmenus.pipe(takeUntilDestroyed()).subscribe(element => {
      // if the element is not the trigger, we want to close the menu
      if (element === this.trigger.nativeElement) {
        return;
      }

      this.closeMenu('mouse');
    });
  }

  /**
   * @internal
   */
  openMenu(origin: FocusOrigin): void {
    // if the menu is already open, we don't want to do anything
    if (this.popoverTrigger().open()) {
      return;
    }

    this.popoverTrigger().show(origin);
  }

  /**
   * @internal
   */
  closeMenu(origin: FocusOrigin): void {
    this.popoverTrigger().hide(origin);
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
      this.openMenu('keyboard');
    }
  }

  /**
   * If the user hovers over the trigger, we want to open the submenu
   */
  @HostListener('mouseenter')
  protected showSubmenuOnHover(): void {
    this.openMenu('mouse');
  }
}
