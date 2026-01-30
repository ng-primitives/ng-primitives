import { injectElementRef } from 'ng-primitives/internal';
import { attrBinding, createPrimitive, dataBinding } from 'ng-primitives/state';
import { injectNavigationMenuState } from '../navigation-menu/navigation-menu-state';

/**
 * The state for the NgpNavigationMenuList directive.
 */
export interface NgpNavigationMenuListState {
  // No public methods exposed for navigation menu list
}

/**
 * The props for the NgpNavigationMenuList state.
 */
export interface NgpNavigationMenuListProps {
  // No props for navigation menu list
}

export const [
  NgpNavigationMenuListStateToken,
  ngpNavigationMenuList,
  injectNavigationMenuListState,
  provideNavigationMenuListState,
] = createPrimitive('NgpNavigationMenuList', ({}: NgpNavigationMenuListProps) => {
  const element = injectElementRef();
  const navigationMenuState = injectNavigationMenuState();

  // Host bindings
  attrBinding(element, 'role', 'menubar');
  attrBinding(element, 'aria-orientation', () => navigationMenuState().orientation());
  dataBinding(element, 'data-orientation', () => navigationMenuState().orientation());

  return {} satisfies NgpNavigationMenuListState;
});
