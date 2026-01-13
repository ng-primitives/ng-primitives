import { isSignal, signal, Signal } from '@angular/core';
import { ngpActionable } from 'ng-primitives/actionable';
import { ngpInteractions } from 'ng-primitives/interactions';
import { injectElementRef } from 'ng-primitives/internal';
import { attrBinding, controlled, createPrimitive } from 'ng-primitives/state';
import { signalMethod, SignalMethod } from 'ng-primitives/utils';
import { injectButtonConfig } from '../config/button-config';

export interface NgpButtonState {
  /**
   * Whether the button is disabled.
   */
  readonly disabled: Signal<boolean>;

  /**
   * The role attribute of the button.
   */
  readonly role: Signal<string | null>;

  /**
   * The type attribute of the button.
   */
  readonly type: Signal<string | null>;

  /**
   * Set the disabled state of the button.
   * @param value The disabled state.
   */
  readonly setDisabled: SignalMethod<boolean>;

  /**
   * Set the role attribute of the button.
   */
  readonly setRole: SignalMethod<string | null>;

  /**
   * Set the type attribute of the button.
   */
  readonly setType: SignalMethod<string | null>;
}

export interface NgpButtonProps {
  /**
   * Whether the button is disabled.
   */
  readonly disabled?: Signal<boolean>;

  /**
   * The role attribute of the button.
   */
  readonly role?: string | null | Signal<string | null>;

  /**
   * The type attribute of the button.
   */
  readonly type?: string | null | Signal<string | null>;
}

export const [NgpButtonStateToken, ngpButton, injectButtonState, provideButtonState] =
  createPrimitive(
    'NgpButton',
    ({ disabled: _disabled, role: _role, type: _type }: NgpButtonProps): NgpButtonState => {
      const element = injectElementRef();
      const config = injectButtonConfig();

      const isButton = element.nativeElement.tagName.toLowerCase() === 'button';
      const isAnchor = element.nativeElement.tagName.toLowerCase() === 'a';
      const isValidLink = () => isAnchor && element.nativeElement.getAttribute('href');

      const role = isSignal(_role) ? controlled(_role) : signal(_role ?? null);
      const type = isSignal(_type) ? controlled(_type) : signal(_type ?? null);

      const { disabled, setDisabled } = ngpActionable({ disabled: _disabled });

      // Setup interactions (hover, press, focus-visible)
      ngpInteractions({ hover: true, press: true, focusVisible: true, disabled });

      // Setup role attribute

      if (role() == null) {
        role.set(element.nativeElement.getAttribute('role'));
      }

      attrBinding(element, 'role', () => {
        if (!config.autoSetRole || role() != null) {
          return role();
        }

        // Native buttons implicitly have role="button"
        if (isButton) {
          return null;
        }

        // Anchors with href should retain their native "link" role.
        // This needs to be checked after render in case the host
        // has a routerLink which can set the href after render.
        if (isValidLink()) {
          return null;
        }

        // Non-native elements need role="button" for screen readers to announce them as buttons
        return 'button';
      });

      // Setup type attribute

      if (type() == null) {
        type.set(element.nativeElement.getAttribute('type'));
      }

      attrBinding(element, 'type', () => {
        if (!config.autoSetType || type() != null) {
          return type();
        }

        return isButton ? 'button' : null;
      });

      return {
        disabled,
        setDisabled,
        role: role.asReadonly(),
        type: type.asReadonly(),
        setRole: signalMethod(r => role.set(r)),
        setType: signalMethod(t => type.set(t)),
      } satisfies NgpButtonState;
    },
  );
