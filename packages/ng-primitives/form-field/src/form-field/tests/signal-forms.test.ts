import { Component, resource, signal } from '@angular/core';
import {
  FormField as SignalFormField,
  disabled,
  form,
  minLength,
  required,
  validateAsync,
} from '@angular/forms/signals';
import { fireEvent, render, waitFor } from '@testing-library/angular';
import { userEvent } from '@testing-library/user-event';
import {
  NgpDescription,
  NgpError,
  NgpFormControl,
  NgpFormField,
  NgpLabel,
} from 'ng-primitives/form-field';
import { describe, expect, it } from 'vitest';

/**
 * Signal forms provide an `NgControl` shim (`InteropNgControl`) rather than a real one, so the
 * form-field primitives read it through a separate code path to reactive forms. These tests pin
 * that path down.
 */

@Component({
  imports: [NgpFormField, NgpFormControl, NgpLabel, NgpDescription, NgpError, SignalFormField],
  template: `
    <div ngpFormField data-testid="field">
      <label id="name-label" ngpLabel data-testid="label">Name</label>
      <input id="name-control" [formField]="f.name" ngpFormControl data-testid="control" />
      <p id="name-description" ngpDescription data-testid="description">Your full name</p>
      <p id="name-required" ngpError ngpErrorValidator="required" data-testid="error-required">
        Required
      </p>
      <p id="name-min" ngpError ngpErrorValidator="minLength" data-testid="error-minlength">
        Too short
      </p>
    </div>
  `,
})
class FullHost {
  readonly model = signal({ name: '' });
  readonly f = form(this.model, path => {
    required(path.name);
    minLength(path.name, 3);
  });
}

@Component({
  imports: [NgpFormField, NgpFormControl, SignalFormField],
  template: `
    <div ngpFormField data-testid="field">
      <input [formField]="f.name" ngpFormControl data-testid="control" />
    </div>
  `,
})
class DisabledHost {
  readonly model = signal({ name: 'Ada' });
  readonly f = form(this.model, path => disabled(path.name));
}

// Initialised here as well as per-test so rendering AsyncHost never hits an undefined promise.
let deferred: PromiseWithResolvers<void> = Promise.withResolvers<void>();

@Component({
  imports: [NgpFormField, NgpFormControl, SignalFormField],
  template: `
    <div ngpFormField data-testid="field">
      <input [formField]="f.name" ngpFormControl data-testid="control" />
    </div>
  `,
})
class AsyncHost {
  readonly model = signal({ name: 'Ada' });
  readonly f = form(this.model, path =>
    validateAsync(path.name, {
      params: ctx => ctx.value(),
      factory: params =>
        resource({
          params: () => params(),
          loader: () => deferred.promise.then(() => true),
        }),
      onError: () => [],
      onSuccess: () => [],
    }),
  );
}

@Component({
  imports: [NgpFormField, NgpFormControl, SignalFormField],
  template: `
    <div ngpFormField data-testid="field">
      <input [formField]="useSecond() ? f.last : f.first" ngpFormControl data-testid="control" />
    </div>
  `,
})
class SwapHost {
  readonly useSecond = signal(false);
  readonly model = signal({ first: 'Ada', last: '' });
  readonly f = form(this.model, path => required(path.last));
}

describe('form-field primitives with signal forms', () => {
  describe('NgpFormField status tracking', () => {
    it('should reflect the initial invalid state of the field', async () => {
      const { getByTestId } = await render(FullHost);
      const field = getByTestId('field');

      expect(field).toHaveAttribute('data-invalid', '');
      expect(field).toHaveAttribute('data-pristine', '');
      expect(field).not.toHaveAttribute('data-valid');
      expect(field).not.toHaveAttribute('data-touched');
      expect(field).not.toHaveAttribute('data-dirty');
    });

    it('should become valid when the model satisfies the validators', async () => {
      const { getByTestId, fixture } = await render(FullHost);
      const field = getByTestId('field');

      fixture.componentInstance.model.set({ name: 'Ada' });
      await fixture.whenStable();

      expect(field).toHaveAttribute('data-valid', '');
      expect(field).not.toHaveAttribute('data-invalid');
    });

    it('should become dirty and valid as the user types', async () => {
      const { getByTestId, fixture } = await render(FullHost);
      const field = getByTestId('field');

      await userEvent.type(getByTestId('control'), 'Ada');
      await fixture.whenStable();

      expect(field).toHaveAttribute('data-dirty', '');
      expect(field).toHaveAttribute('data-valid', '');
      expect(field).not.toHaveAttribute('data-pristine');
      expect(field).not.toHaveAttribute('data-invalid');
    });

    it('should become touched when the control is blurred', async () => {
      const { getByTestId, fixture } = await render(FullHost);
      const field = getByTestId('field');

      fireEvent.blur(getByTestId('control'));
      await fixture.whenStable();

      expect(field).toHaveAttribute('data-touched', '');
    });

    it('should reflect a disabled field', async () => {
      const { getByTestId } = await render(DisabledHost);

      expect(getByTestId('field')).toHaveAttribute('data-disabled', '');
    });

    it('should reflect a pending async validator', async () => {
      deferred = Promise.withResolvers<void>();
      const { getByTestId, fixture } = await render(AsyncHost);
      const field = getByTestId('field');

      // `whenStable()` would block on the in-flight resource, so pump change detection instead.
      await waitFor(() => {
        fixture.detectChanges();
        expect(field).toHaveAttribute('data-pending', '');
      });
      expect(field).not.toHaveAttribute('data-valid');

      deferred.resolve();
      await fixture.whenStable();

      expect(field).not.toHaveAttribute('data-pending');
      expect(field).toHaveAttribute('data-valid', '');
    });

    it('should track the newly bound field when the binding is swapped', async () => {
      const { getByTestId, fixture } = await render(SwapHost);
      const field = getByTestId('field');

      expect(field).toHaveAttribute('data-valid', '');

      fixture.componentInstance.useSecond.set(true);
      await fixture.whenStable();

      expect(field).toHaveAttribute('data-invalid', '');
      expect(field).not.toHaveAttribute('data-valid');
    });
  });

  describe('NgpFormControl', () => {
    it('should mirror the field status on the control', async () => {
      const { getByTestId, fixture } = await render(FullHost);
      const control = getByTestId('control');

      expect(control).toHaveAttribute('data-invalid', '');
      expect(control).toHaveAttribute('data-pristine', '');

      fixture.componentInstance.model.set({ name: 'Ada' });
      await fixture.whenStable();

      expect(control).toHaveAttribute('data-valid', '');
      expect(control).not.toHaveAttribute('data-invalid');
    });

    it('should only advertise aria-invalid once the field is touched', async () => {
      const { getByTestId, fixture } = await render(FullHost);
      const control = getByTestId('control');

      expect(control).not.toHaveAttribute('aria-invalid');

      fireEvent.blur(control);
      await fixture.whenStable();

      expect(control).toHaveAttribute('aria-invalid', 'true');
    });

    it('should drop aria-invalid once the field becomes valid', async () => {
      const { getByTestId, fixture } = await render(FullHost);
      const control = getByTestId('control');

      fireEvent.blur(control);
      await fixture.whenStable();
      expect(control).toHaveAttribute('aria-invalid', 'true');

      fixture.componentInstance.model.set({ name: 'Ada' });
      await fixture.whenStable();

      expect(control).not.toHaveAttribute('aria-invalid');
    });

    it('should disable the control when the field is disabled', async () => {
      const { getByTestId } = await render(DisabledHost);
      const control = getByTestId('control');

      expect(control).toBeDisabled();
      expect(control).toHaveAttribute('data-disabled', '');
    });
  });

  describe('NgpLabel', () => {
    it('should associate the label with the control', async () => {
      const { getByTestId } = await render(FullHost);

      expect(getByTestId('label')).toHaveAttribute('for', 'name-control');
      expect(getByTestId('control')).toHaveAttribute('aria-labelledby', 'name-label');
    });

    it('should mirror the field status on the label', async () => {
      const { getByTestId, fixture } = await render(FullHost);
      const label = getByTestId('label');

      expect(label).toHaveAttribute('data-invalid', '');

      fixture.componentInstance.model.set({ name: 'Ada' });
      await fixture.whenStable();

      expect(label).toHaveAttribute('data-valid', '');
      expect(label).not.toHaveAttribute('data-invalid');
    });

    it('should focus the control when the label is clicked', async () => {
      const { getByTestId } = await render(FullHost);

      fireEvent.click(getByTestId('label'));

      expect(getByTestId('control')).toHaveFocus();
    });
  });

  describe('NgpDescription', () => {
    it('should describe the control', async () => {
      const { getByTestId } = await render(FullHost);

      expect(getByTestId('control').getAttribute('aria-describedby')).toContain('name-description');
    });

    it('should mirror the field status on the description', async () => {
      const { getByTestId, fixture } = await render(FullHost);
      const description = getByTestId('description');

      expect(description).toHaveAttribute('data-invalid', '');

      fixture.componentInstance.model.set({ name: 'Ada' });
      await fixture.whenStable();

      expect(description).toHaveAttribute('data-valid', '');
    });
  });

  describe('NgpError', () => {
    it('should fail only for the validator kind that is erroring', async () => {
      const { getByTestId } = await render(FullHost);

      expect(getByTestId('error-required')).toHaveAttribute('data-validator', 'fail');
      expect(getByTestId('error-minlength')).toHaveAttribute('data-validator', 'pass');
    });

    it('should switch which error fails as the value changes', async () => {
      const { getByTestId, fixture } = await render(FullHost);

      fixture.componentInstance.model.set({ name: 'Ad' });
      await fixture.whenStable();

      expect(getByTestId('error-required')).toHaveAttribute('data-validator', 'pass');
      expect(getByTestId('error-minlength')).toHaveAttribute('data-validator', 'fail');
    });

    it('should pass every error once the field is valid', async () => {
      const { getByTestId, fixture } = await render(FullHost);

      fixture.componentInstance.model.set({ name: 'Ada' });
      await fixture.whenStable();

      expect(getByTestId('error-required')).toHaveAttribute('data-validator', 'pass');
      expect(getByTestId('error-minlength')).toHaveAttribute('data-validator', 'pass');
    });

    it('should only describe the control while the error is failing', async () => {
      const { getByTestId, fixture } = await render(FullHost);
      const control = getByTestId('control');

      expect(control.getAttribute('aria-describedby')).toContain('name-required');
      expect(control.getAttribute('aria-describedby')).not.toContain('name-min');

      fixture.componentInstance.model.set({ name: 'Ad' });
      await fixture.whenStable();

      expect(control.getAttribute('aria-describedby')).not.toContain('name-required');
      expect(control.getAttribute('aria-describedby')).toContain('name-min');

      fixture.componentInstance.model.set({ name: 'Ada' });
      await fixture.whenStable();

      expect(control.getAttribute('aria-describedby')).not.toContain('name-required');
      expect(control.getAttribute('aria-describedby')).not.toContain('name-min');
    });

    it('should mirror the field status on the error', async () => {
      const { getByTestId } = await render(FullHost);

      expect(getByTestId('error-required')).toHaveAttribute('data-invalid', '');
      expect(getByTestId('error-required')).toHaveAttribute('data-pristine', '');
    });
  });
});
