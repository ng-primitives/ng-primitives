import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { form, FormField, required } from '@angular/forms/signals';
import { fireEvent, render, waitFor } from '@testing-library/angular';
import { NgpError, NgpFormField, NgpLabel } from 'ng-primitives/form-field';
import { NgpPopover, NgpPopoverTrigger } from 'ng-primitives/popover';
import { afterEach, describe, expect, it } from 'vitest';

/**
 * Inline fixture mirroring `apps/documentation/src/app/examples/form-field/outer-form-field.example.ts`.
 * The actual `[formControl]` / `[formField]` input lives inside a popover, so the form field
 * can only discover the control through the `ngpFormFieldSource` input.
 */
@Component({
  template: `
    <div id="reactive" [ngpFormFieldSource]="reactiveForm.controls.name" ngpFormField>
      <label ngpLabel>Name</label>
      <input id="reactive-display" [value]="reactiveForm.controls.name.value" readonly />
      <p id="reactive-error" ngpError ngpErrorValidator="required">This field is required</p>
    </div>

    <div id="signal" [ngpFormFieldSource]="signalForm.name" ngpFormField>
      <label ngpLabel>Name</label>
      <input id="signal-display" [value]="signalForm.name().value()" readonly />
      <p id="signal-error" ngpError ngpErrorValidator="required">This field is required</p>
    </div>

    <button [ngpPopoverTrigger]="reactivePopover">Edit reactive</button>
    <button [ngpPopoverTrigger]="signalPopover">Edit signal</button>

    <ng-template #reactivePopover>
      <div ngpPopover>
        <input [formControl]="reactiveForm.controls.name" placeholder="What's your name" />
      </div>
    </ng-template>

    <ng-template #signalPopover>
      <div ngpPopover>
        <input [formField]="signalForm.name" placeholder="What's your name" />
      </div>
    </ng-template>
  `,
  imports: [
    NgpFormField,
    NgpLabel,
    NgpError,
    NgpPopoverTrigger,
    NgpPopover,
    ReactiveFormsModule,
    FormField,
  ],
})
class HostComponent {
  readonly reactiveForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
  });

  readonly signalForm = form(signal({ name: '' }), schema => {
    required(schema.name);
  });
}

describe('NgpFormField with a source control living in a popover', () => {
  afterEach(() => {
    // The popover content is portalled to the body, so remove any leftover overlays.
    document.querySelectorAll('[ngpPopover]').forEach(el => el.remove());
  });

  it('tracks the required error state while editing a Reactive Forms source', async () => {
    const { container, getByRole } = await render(HostComponent);
    const formField = container.querySelector('#reactive')!;
    const display = container.querySelector<HTMLInputElement>('#reactive-display')!;
    const error = container.querySelector('#reactive-error')!;

    fireEvent.click(getByRole('button', { name: 'Edit reactive' }));
    const input = await waitFor(() => {
      const el = document.querySelector<HTMLInputElement>('[ngpPopover] input');
      expect(el).toBeTruthy();
      return el!;
    });

    // The source control is required, so the field starts invalid but pristine.
    expect(formField).toHaveAttribute('data-invalid');
    expect(formField).toHaveAttribute('data-pristine');
    expect(error).toHaveAttribute('data-validator', 'fail');
    expect(error).not.toHaveAttribute('data-dirty');

    // Typing satisfies the required validator and marks the control dirty.
    fireEvent.input(input, { target: { value: 'Ada' } });
    await waitFor(() => expect(formField).toHaveAttribute('data-dirty'));
    expect(formField).not.toHaveAttribute('data-invalid');
    expect(error).toHaveAttribute('data-validator', 'pass');
    expect(display.value).toBe('Ada');

    // Clearing the control makes it dirty AND invalid again, so the error must
    // surface: the example only shows the message once `[data-dirty]` is set.
    fireEvent.input(input, { target: { value: '' } });
    await waitFor(() => expect(error).toHaveAttribute('data-validator', 'fail'));
    expect(error).toHaveAttribute('data-dirty');
    expect(formField).toHaveAttribute('data-dirty');
    expect(formField).toHaveAttribute('data-invalid');

    fireEvent.blur(input);
    await waitFor(() => expect(formField).toHaveAttribute('data-touched'));
  });

  it('tracks the required error state while editing a Signal Forms source', async () => {
    const { container, getByRole } = await render(HostComponent);
    const formField = container.querySelector('#signal')!;
    const display = container.querySelector<HTMLInputElement>('#signal-display')!;
    const error = container.querySelector('#signal-error')!;

    fireEvent.click(getByRole('button', { name: 'Edit signal' }));
    const input = await waitFor(() => {
      const el = document.querySelector<HTMLInputElement>('[ngpPopover] input');
      expect(el).toBeTruthy();
      return el!;
    });

    // The source field is required, so the form field starts invalid but pristine.
    expect(formField).toHaveAttribute('data-invalid');
    expect(formField).toHaveAttribute('data-pristine');
    expect(error).toHaveAttribute('data-validator', 'fail');
    expect(error).not.toHaveAttribute('data-dirty');

    // Typing satisfies the required validator and marks the field dirty.
    fireEvent.input(input, { target: { value: 'Ada' } });
    await waitFor(() => expect(formField).toHaveAttribute('data-dirty'));
    expect(formField).not.toHaveAttribute('data-invalid');
    expect(error).toHaveAttribute('data-validator', 'pass');
    expect(display.value).toBe('Ada');

    // Clearing the field makes it dirty AND invalid again.
    fireEvent.input(input, { target: { value: '' } });
    await waitFor(() => expect(error).toHaveAttribute('data-validator', 'fail'));
    expect(error).toHaveAttribute('data-dirty');
    expect(formField).toHaveAttribute('data-dirty');
    expect(formField).toHaveAttribute('data-invalid');

    fireEvent.blur(input);
    await waitFor(() => expect(formField).toHaveAttribute('data-touched'));
  });
});
