import { injectElementRef } from 'ng-primitives/internal';
import { createPrimitive, attrBinding } from 'ng-primitives/state';

export interface NgpBreadcrumbListState {}

export interface NgpBreadcrumbListProps {}

export const [
  NgpBreadcrumbListStateToken,
  ngpBreadcrumbList,
  injectBreadcrumbListState,
  provideBreadcrumbListState,
] = createPrimitive('NgpBreadcrumbList', ({}: NgpBreadcrumbListProps) => {
  const element = injectElementRef();

  // Host bindings
  attrBinding(element, 'role', 'list');

  return {} satisfies NgpBreadcrumbListState;
});
