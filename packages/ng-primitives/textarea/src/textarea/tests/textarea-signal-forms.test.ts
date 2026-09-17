import { Component, signal } from '@angular/core';
import { FormField as SignalFormField, disabled, form, required } from '@angular/forms/signals';
import { fireEvent, render } from '@testing-library/angular';
import { NgpFormField, NgpLabel } from 'ng-primitives/form-field';
import { NgpTextarea } from 'ng-primitives/textarea';
import { describe, expect, it } from 'vitest';

/** `ngpTextarea` composes `ngpFormControl`, so the signal-forms interop has to survive that. */

@Component({
  imports: [NgpTextarea, NgpFormField, NgpLabel, SignalFormField],
  template: `
    <div ngpFormField data-testid="field">
      <label id="bio-label" ngpLabel>Bio</label>
      <textarea id="bio-input" [formField]="f.bio" ngpTextarea data-testid="textarea"></textarea>
    </div>
  `,
})
class Host {
  readonly isDisabled = signal(false);
  readonly model = signal({ bio: '' });
  readonly f = form(this.model, path => {
    disabled(path.bio, () => this.isDisabled());
    required(path.bio);
  });
}

describe('NgpTextarea with signal forms', () => {
  it('should mirror the field status', async () => {
    const { getByTestId, fixture } = await render(Host);
    const textarea = getByTestId('textarea');

    expect(textarea).toHaveAttribute('data-invalid', '');
    expect(textarea).toHaveAttribute('data-pristine', '');

    fixture.componentInstance.model.set({ bio: 'Hello' });
    await fixture.whenStable();

    expect(textarea).toHaveAttribute('data-valid', '');
    expect(textarea).not.toHaveAttribute('data-invalid');
  });

  it('should propagate the status to the surrounding form field', async () => {
    const { getByTestId } = await render(Host);

    expect(getByTestId('field')).toHaveAttribute('data-invalid', '');
  });

  it('should label the textarea from the form field', async () => {
    const { getByTestId } = await render(Host);

    expect(getByTestId('textarea')).toHaveAttribute('aria-labelledby', 'bio-label');
  });

  it('should update the model as the user types', async () => {
    const { getByTestId, fixture } = await render(Host);
    const textarea = getByTestId('textarea') as HTMLTextAreaElement;

    textarea.value = 'Hello';
    fireEvent.input(textarea);
    await fixture.whenStable();

    expect(fixture.componentInstance.model().bio).toBe('Hello');
  });

  it('should only advertise aria-invalid once touched', async () => {
    const { getByTestId, fixture } = await render(Host);
    const textarea = getByTestId('textarea');

    expect(textarea).not.toHaveAttribute('aria-invalid');

    fireEvent.blur(textarea);
    await fixture.whenStable();

    expect(textarea).toHaveAttribute('aria-invalid', 'true');
  });

  it('should disable the textarea when the field is disabled', async () => {
    const { getByTestId, fixture } = await render(Host);

    expect(getByTestId('textarea')).not.toBeDisabled();

    fixture.componentInstance.isDisabled.set(true);
    await fixture.whenStable();

    expect(getByTestId('textarea')).toBeDisabled();
    expect(getByTestId('textarea')).toHaveAttribute('data-disabled', '');
  });
});
