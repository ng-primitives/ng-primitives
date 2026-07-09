import { LiveAnnouncer } from '@angular/cdk/a11y';
import { inject, Signal, signal } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { attrBinding, createPrimitive, dataBinding, listener } from 'ng-primitives/state';
import { injectPasswordState } from '../password/password-state';

/**
 * The state interface for the PasswordToggle pattern.
 */
export interface NgpPasswordToggleState {
  /**
   * Toggle the visibility of the password.
   */
  toggle(): void;
}

/**
 * The props interface for the PasswordToggle pattern.
 */
export interface NgpPasswordToggleProps {
  /**
   * The accessible label shown when the password is hidden.
   */
  readonly showLabel: Signal<string>;
  /**
   * The accessible label shown when the password is visible.
   */
  readonly hideLabel: Signal<string>;
  /**
   * The message announced when the password becomes visible.
   */
  readonly shownAnnouncement: Signal<string>;
  /**
   * The message announced when the password becomes hidden.
   */
  readonly hiddenAnnouncement: Signal<string>;
}

export const [
  NgpPasswordToggleStateToken,
  ngpPasswordToggle,
  injectPasswordToggleState,
  providePasswordToggleState,
] = createPrimitive(
  'NgpPasswordToggle',
  ({
    showLabel,
    hideLabel,
    shownAnnouncement,
    hiddenAnnouncement,
  }: NgpPasswordToggleProps): NgpPasswordToggleState => {
    const element = injectElementRef<HTMLButtonElement>();
    const password = injectPasswordState();
    const announcer = inject(LiveAnnouncer);

    // Pointer activation returns focus to the input; keyboard keeps it on the button.
    const pointerActivated = signal(false);

    attrBinding(element, 'type', 'button');
    attrBinding(element, 'aria-controls', () => password().inputId());
    attrBinding(element, 'aria-label', () => {
      // Defer to the button's own text if it has any.
      if ((element.nativeElement.textContent ?? '').trim().length > 0) {
        return null;
      }
      return password().visible() ? hideLabel() : showLabel();
    });
    dataBinding(element, 'data-visible', () => password().visible());

    listener(element, 'pointerdown', () => pointerActivated.set(true));
    listener(element, 'click', () => toggle());

    function toggle(): void {
      const state = password();
      state.toggle();

      const visible = state.visible();
      announcer.announce(visible ? shownAnnouncement() : hiddenAnnouncement());

      if (pointerActivated()) {
        state.focusInput();
      }
      pointerActivated.set(false);
    }

    return { toggle } satisfies NgpPasswordToggleState;
  },
);
