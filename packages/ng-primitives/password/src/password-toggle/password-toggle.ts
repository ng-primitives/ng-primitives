import { Directive, input } from '@angular/core';
import { injectPasswordConfig } from '../config/password-config';
import { ngpPasswordToggle, providePasswordToggleState } from './password-toggle-state';

/**
 * Apply the `ngpPasswordToggle` directive to a `button` element to toggle the visibility of the
 * password within an `ngpPassword` container.
 */
@Directive({
  selector: 'button[ngpPasswordToggle]',
  exportAs: 'ngpPasswordToggle',
  providers: [providePasswordToggleState()],
})
export class NgpPasswordToggle {
  /**
   * Access the global password configuration.
   */
  private readonly config = injectPasswordConfig();

  /**
   * The accessible label shown when the password is hidden.
   */
  readonly showLabel = input(this.config.showLabel, { alias: 'ngpPasswordToggleShowLabel' });

  /**
   * The accessible label shown when the password is visible.
   */
  readonly hideLabel = input(this.config.hideLabel, { alias: 'ngpPasswordToggleHideLabel' });

  /**
   * The message announced when the password becomes visible.
   */
  readonly shownAnnouncement = input(this.config.shownAnnouncement, {
    alias: 'ngpPasswordToggleShownAnnouncement',
  });

  /**
   * The message announced when the password becomes hidden.
   */
  readonly hiddenAnnouncement = input(this.config.hiddenAnnouncement, {
    alias: 'ngpPasswordToggleHiddenAnnouncement',
  });

  /**
   * The state for the password toggle primitive.
   */
  protected readonly state = ngpPasswordToggle({
    showLabel: this.showLabel,
    hideLabel: this.hideLabel,
    shownAnnouncement: this.shownAnnouncement,
    hiddenAnnouncement: this.hiddenAnnouncement,
  });

  /**
   * Toggle the visibility of the password.
   */
  toggle(): void {
    this.state.toggle();
  }
}
