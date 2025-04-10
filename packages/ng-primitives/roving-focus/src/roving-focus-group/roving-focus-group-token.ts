import { FactoryProvider, InjectionToken, Type, inject } from '@angular/core';
import { NgpRovingFocusGroup } from './roving-focus-group';

export const NgpRovingFocusGroupToken = new InjectionToken<NgpRovingFocusGroup>(
  'NgpRovingFocusGroupToken',
);

/**
 * Inject the RovingFocusGroup directive instance
 * @returns The RovingFocusGroup directive instance
 */
export function injectRovingFocusGroup(): NgpRovingFocusGroup {
  return inject(NgpRovingFocusGroupToken);
}

export interface NgpRovingFocusGroupOptions {
  /**
   * Whether we should inherit the focus group from the parent
   * @default true
   */
  inherit?: boolean;
}

/**
 * Provide the RovingFocusGroup directive instance
 * @param type The RovingFocusGroup directive type
 * @returns The RovingFocusGroup token
 */
export function provideRovingFocusGroup(
  type: Type<NgpRovingFocusGroup>,
  { inherit = true }: NgpRovingFocusGroupOptions = {},
): FactoryProvider {
  return {
    provide: NgpRovingFocusGroupToken,
    // Roving focus groups may be nested, in this case, the parent group should be used
    useFactory: () => {
      if (!inherit) {
        return inject(type, { self: true });
      }

      // If the parent group is not found, return the current group
      // This is useful for nested groups
      return (
        inject(NgpRovingFocusGroupToken, { skipSelf: true, optional: true }) ??
        inject(type, { self: true })
      );
    },
  };
}
