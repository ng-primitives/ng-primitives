import { FocusOrigin } from '@angular/cdk/a11y';
import { injectElementRef } from 'ng-primitives/internal';
import { injectOverlay } from 'ng-primitives/portal';
import { attrBinding, createPrimitive, styleBinding } from 'ng-primitives/state';
import { Subject } from 'rxjs';
import { injectMenuTriggerState } from '../menu-trigger/menu-trigger-state';

export interface NgpMenuState {
  /**
   * Close the menu and any parent menus.
   * @param origin - The focus origin
   */
  closeAllMenus(origin: FocusOrigin): void;
  /**
   * Subject that emits when submenus should be closed.
   * @internal
   */
  readonly closeSubmenus: Subject<HTMLElement>;
}

export interface NgpMenuProps {}

export const [NgpMenuStateToken, ngpMenu, injectMenuState, provideMenuState] = createPrimitive(
  'NgpMenu',
  ({}: NgpMenuProps) => {
    const element = injectElementRef();
    const overlay = injectOverlay();
    const menuTrigger = injectMenuTriggerState();
    const parentMenu = injectMenuState({ optional: true, skipSelf: true });

    // Host bindings
    attrBinding(element, 'role', 'menu');
    attrBinding(element, 'data-placement', overlay.finalPlacement);
    attrBinding(element, 'data-overlay', '');
    styleBinding(element, 'left.px', () => overlay.position().x ?? null);
    styleBinding(element, 'top.px', () => overlay.position().y ?? null);
    styleBinding(element, '--ngp-menu-trigger-width.px', overlay.triggerWidth);
    styleBinding(element, '--ngp-menu-transform-origin', overlay.transformOrigin);

    // Subject to notify children to close submenus
    const closeSubmenus = new Subject<HTMLElement>();

    // Methods
    function closeAllMenus(origin: FocusOrigin): void {
      menuTrigger().hide(origin);
      parentMenu()?.closeAllMenus(origin);
    }

    return {
      closeAllMenus,
      closeSubmenus,
    } satisfies NgpMenuState;
  },
);
