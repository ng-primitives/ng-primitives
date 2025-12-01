import { injectElementRef } from 'ng-primitives/internal';
import { createPrimitive, attrBinding } from 'ng-primitives/state';

export interface NgpBreadcrumbsState {}

export interface NgpBreadcrumbsProps {}

export const [
  NgpBreadcrumbsStateToken,
  ngpBreadcrumbs,
  injectBreadcrumbsState,
  provideBreadcrumbsState,
] = createPrimitive('NgpBreadcrumbs', ({}: NgpBreadcrumbsProps) => {
  const element = injectElementRef();

  // Host bindings
  attrBinding(element, 'role', 'navigation');

  return {};
});
