import { Signal, WritableSignal } from '@angular/core';
import { NgpOrientation } from 'ng-primitives/common';
import { injectElementRef } from 'ng-primitives/internal';
import { NgpRovingFocusGroupState } from 'ng-primitives/roving-focus';
import {
  attrBinding,
  controlled,
  createPrimitive,
  dataBinding,
  deprecatedSetter,
} from 'ng-primitives/state';

export interface NgpToolbarState {
  /**
   * The orientation of the toolbar.
   */
  readonly orientation: WritableSignal<NgpOrientation>;
  /**
   * Set the orientation of the toolbar.
   * @param value The orientation value
   */
  setOrientation(value: NgpOrientation): void;
}

export interface NgpToolbarProps {
  /**
   * The roving focus group state.
   */
  readonly rovingFocusGroup: NgpRovingFocusGroupState;
  /**
   * The orientation of the toolbar.
   */
  readonly orientation: Signal<NgpOrientation>;
}

export const [NgpToolbarStateToken, ngpToolbar, injectToolbarState, provideToolbarState] =
  createPrimitive(
    'NgpToolbar',
    ({ rovingFocusGroup, orientation: _orientation }: NgpToolbarProps) => {
      const element = injectElementRef();
      const orientation = controlled(_orientation);

      // Setup host attribute bindings
      attrBinding(element, 'role', 'toolbar');
      attrBinding(element, 'aria-orientation', orientation);
      dataBinding(element, 'data-orientation', orientation);

      function setOrientation(value: NgpOrientation) {
        orientation.set(value);
        rovingFocusGroup.setOrientation(value);
      }

      return {
        orientation: deprecatedSetter(orientation, 'setOrientation'),
        setOrientation,
      };
    },
  );
