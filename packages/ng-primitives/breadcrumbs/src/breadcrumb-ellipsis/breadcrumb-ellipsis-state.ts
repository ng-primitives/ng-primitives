import { injectElementRef } from 'ng-primitives/internal';
import { createPrimitive, attrBinding } from 'ng-primitives/state';

export interface NgpBreadcrumbEllipsisState {}

export interface NgpBreadcrumbEllipsisProps {}

export const [
  NgpBreadcrumbEllipsisStateToken,
  ngpBreadcrumbEllipsis,
  injectBreadcrumbEllipsisState,
  provideBreadcrumbEllipsisState,
] = createPrimitive('NgpBreadcrumbEllipsis', ({}: NgpBreadcrumbEllipsisProps) => {
  const element = injectElementRef();

  // Host bindings
  attrBinding(element, 'role', 'presentation');
  attrBinding(element, 'aria-hidden', 'true');

  return {};
});
