import { injectElementRef } from 'ng-primitives/internal';
import { createPrimitive, attrBinding } from 'ng-primitives/state';

export interface NgpBreadcrumbItemState {}

export interface NgpBreadcrumbItemProps {}

export const [
  NgpBreadcrumbItemStateToken,
  ngpBreadcrumbItem,
  injectBreadcrumbItemState,
  provideBreadcrumbItemState,
] = createPrimitive('NgpBreadcrumbItem', ({}: NgpBreadcrumbItemProps) => {
  const element = injectElementRef();

  // Host bindings
  attrBinding(element, 'role', 'listitem');

  return {};
});
