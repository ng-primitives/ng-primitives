import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { fireEvent, render } from '@testing-library/angular';
import {
  NgpDescription,
  NgpError,
  NgpFormControl,
  NgpFormField,
  NgpLabel,
} from 'ng-primitives/form-field';
import { describe, expect, it, vi } from 'vitest';

describe('Form Field Integration Tests', () => {
  it('should create a complete accessible form field', async () => {
    @Component({
      template: `
        <div ngpFormField>
          <label id="name-label" ngpLabel>Name</label>
          <input
            id="name-input"
            [formControl]="nameControl"
            ngpFormControl
            placeholder="Enter your name"
          />
          <div id="name-help" ngpDescription>Enter your full name</div>
          <div id="name-required" ngpError ngpErrorValidator="required">Name is required</div>
          <div id="name-minlength" ngpError ngpErrorValidator="minlength">
            Name must be at least 2 characters
          </div>
        </div>
      `,
      imports: [
        NgpFormField,
        NgpFormControl,
        NgpLabel,
        NgpDescription,
        NgpError,
        ReactiveFormsModule,
      ],
    })
    class TestComponent {
      nameControl = new FormControl('', [Validators.required, Validators.minLength(2)]);
    }

    const { container } = await render(TestComponent);
    const label = container.querySelector('label');
    const input = container.querySelector('input');
    const description = container.querySelector('[ngpDescription]');
    const formField = container.querySelector('[ngpFormField]');

    expect(input).toHaveAttribute('id', 'name-input');
    expect(input).toHaveAttribute('aria-labelledby', 'name-label');
    expect(input).toHaveAttribute('aria-describedby', 'name-help name-required');
    expect(label).toHaveAttribute('for', 'name-input');

    expect(formField).toHaveAttribute('data-invalid');
    expect(formField).toHaveAttribute('data-pristine');
    expect(input).toHaveAttribute('data-invalid');
    expect(label).toHaveAttribute('data-invalid');
    expect(description).toHaveAttribute('data-invalid');

    const requiredError = container.querySelector('#name-required');
    expect(requiredError).toHaveAttribute('data-validator', 'fail');
  });

  it('should update all components when form state changes', async () => {
    @Component({
      template: `
        <div ngpFormField>
          <label ngpLabel>Email</label>
          <input [formControl]="emailControl" ngpFormControl />
          <div ngpDescription>Enter a valid email address</div>
          <div ngpError ngpErrorValidator="required">Email is required</div>
          <div ngpError ngpErrorValidator="email">Please enter a valid email</div>
        </div>
      `,
      imports: [
        NgpFormField,
        NgpFormControl,
        NgpLabel,
        NgpDescription,
        NgpError,
        ReactiveFormsModule,
      ],
    })
    class TestComponent {
      emailControl = new FormControl('', [Validators.required, Validators.email]);
    }

    const { container, fixture } = await render(TestComponent);
    const formField = container.querySelector('[ngpFormField]');
    const input = container.querySelector('input')!;
    const label = container.querySelector('label');
    const description = container.querySelector('[ngpDescription]');

    expect(formField).toHaveAttribute('data-invalid');
    expect(input).toHaveAttribute('data-invalid');
    expect(label).toHaveAttribute('data-invalid');
    expect(description).toHaveAttribute('data-invalid');

    input.value = 'invalid-email';
    fireEvent.input(input);
    fireEvent.blur(input);
    fixture.detectChanges();

    expect(formField).toHaveAttribute('data-invalid');
    expect(formField).toHaveAttribute('data-touched');
    expect(formField).toHaveAttribute('data-dirty');
    expect(input).toHaveAttribute('data-invalid');
    expect(input).toHaveAttribute('data-touched');
    expect(input).toHaveAttribute('data-dirty');

    input.value = 'test@example.com';
    fireEvent.input(input);
    fixture.detectChanges();

    expect(formField).toHaveAttribute('data-valid');
    expect(formField).not.toHaveAttribute('data-invalid');
    expect(input).toHaveAttribute('data-valid');
    expect(label).toHaveAttribute('data-valid');
    expect(description).toHaveAttribute('data-valid');
  });

  it('should handle multiple labels and descriptions in aria-labelledby and aria-describedby', async () => {
    @Component({
      template: `
        <div ngpFormField>
          <label id="primary-label" ngpLabel>Primary Label</label>
          <label id="secondary-label" ngpLabel>Secondary Label</label>
          <input id="multi-input" [formControl]="control" ngpFormControl />
          <div id="description-1" ngpDescription>First description</div>
          <div id="description-2" ngpDescription>Second description</div>
          <div id="error-1" ngpError>Error message</div>
        </div>
      `,
      imports: [
        NgpFormField,
        NgpFormControl,
        NgpLabel,
        NgpDescription,
        NgpError,
        ReactiveFormsModule,
      ],
    })
    class TestComponent {
      control = new FormControl('', [Validators.required]);
    }

    const { container } = await render(TestComponent);
    const input = container.querySelector('input');

    expect(input).toHaveAttribute('aria-labelledby', 'primary-label secondary-label');
    expect(input).toHaveAttribute('aria-describedby', 'description-1 description-2 error-1');
  });

  it('should handle label click behavior correctly', async () => {
    @Component({
      template: `
        <div ngpFormField>
          <label ngpLabel>Click me</label>
          <input [formControl]="control" ngpFormControl type="checkbox" />
        </div>
      `,
      imports: [NgpFormField, NgpFormControl, NgpLabel, ReactiveFormsModule],
    })
    class TestComponent {
      control = new FormControl(false);
    }

    const { container } = await render(TestComponent);
    const label = container.querySelector('label')!;
    const input = container.querySelector('input')!;

    const clickSpy = vi.spyOn(input, 'click').mockImplementation(() => {});
    const focusSpy = vi.spyOn(input, 'focus').mockImplementation(() => {});

    fireEvent.click(label);

    expect(clickSpy).toHaveBeenCalled();
    expect(focusSpy).toHaveBeenCalledWith({ preventScroll: true });
  });

  it('should handle disabled form controls properly', async () => {
    @Component({
      template: `
        <div ngpFormField>
          <label ngpLabel>Disabled Field</label>
          <input [formControl]="control" ngpFormControl />
          <div ngpDescription>This field is disabled</div>
          <div ngpError>Error message</div>
        </div>
      `,
      imports: [
        NgpFormField,
        NgpFormControl,
        NgpLabel,
        NgpDescription,
        NgpError,
        ReactiveFormsModule,
      ],
    })
    class TestComponent {
      control = new FormControl({ value: 'test', disabled: true });
    }

    const { container } = await render(TestComponent);
    const formField = container.querySelector('[ngpFormField]');
    const input = container.querySelector('input');
    const label = container.querySelector('label');
    const description = container.querySelector('[ngpDescription]');
    const error = container.querySelector('[ngpError]');

    expect(formField).toHaveAttribute('data-disabled');
    expect(input).toHaveAttribute('data-disabled');
    expect(label).toHaveAttribute('data-disabled');
    expect(description).toHaveAttribute('data-disabled');
    expect(error).toHaveAttribute('data-disabled');
  });

  it('should handle dynamic component addition and removal', async () => {
    const { container, rerender } = await render(
      `<div ngpFormField>
        @if (showLabel) {
          <label id="main-label" ngpLabel>Main Label</label>
        }
        @if (showInput) {
          <input id="dynamic-input" [formControl]="control" ngpFormControl />
        }
        @if (showDescription) {
          <div id="main-desc" ngpDescription>Description</div>
        }
        @if (showError) {
          <div id="main-error" ngpError>Error</div>
        }
      </div>`,
      {
        imports: [
          NgpFormField,
          NgpFormControl,
          NgpLabel,
          NgpDescription,
          NgpError,
          ReactiveFormsModule,
        ],
        componentProperties: {
          showLabel: true,
          showInput: true,
          showDescription: true,
          showError: true,
          control: new FormControl('', [Validators.required]),
        },
      },
    );

    expect(container.querySelector('#main-label')).not.toBeNull();
    expect(container.querySelector('#dynamic-input')).not.toBeNull();
    expect(container.querySelector('#main-desc')).not.toBeNull();
    expect(container.querySelector('#main-error')).not.toBeNull();

    await rerender({
      componentProperties: {
        showLabel: false,
        showInput: false,
        showDescription: false,
        showError: false,
      },
    });

    expect(container.querySelector('#main-label')).toBeNull();
    expect(container.querySelector('#dynamic-input')).toBeNull();
    expect(container.querySelector('#main-desc')).toBeNull();
    expect(container.querySelector('#main-error')).toBeNull();
  });

  it('should handle complex validation scenarios', async () => {
    @Component({
      template: `
        <div ngpFormField>
          <label ngpLabel>Password</label>
          <input [formControl]="passwordControl" ngpFormControl type="password" />
          <div ngpDescription>Password must meet security requirements</div>
          <div id="pwd-required" ngpError ngpErrorValidator="required">Password is required</div>
          <div id="pwd-minlength" ngpError ngpErrorValidator="minlength">
            Password must be at least 8 characters
          </div>
          <div id="pwd-pattern" ngpError ngpErrorValidator="pattern">
            Password must contain uppercase, lowercase, and number
          </div>
        </div>
      `,
      imports: [
        NgpFormField,
        NgpFormControl,
        NgpLabel,
        NgpDescription,
        NgpError,
        ReactiveFormsModule,
      ],
    })
    class TestComponent {
      passwordControl = new FormControl('', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
      ]);
    }

    const { container, fixture } = await render(TestComponent);
    const reqEl = container.querySelector('#pwd-required');
    const minEl = container.querySelector('#pwd-minlength');
    const patEl = container.querySelector('#pwd-pattern');

    expect(reqEl).toHaveAttribute('data-validator', 'fail');
    expect(minEl).toHaveAttribute('data-validator', 'pass');
    expect(patEl).toHaveAttribute('data-validator', 'pass');

    fixture.componentInstance.passwordControl.setValue('abc');
    fixture.detectChanges();

    expect(minEl).toHaveAttribute('data-validator', 'fail');
    expect(reqEl).toHaveAttribute('data-validator', 'pass');

    fixture.componentInstance.passwordControl.setValue('abcdefgh');
    fixture.detectChanges();

    expect(patEl).toHaveAttribute('data-validator', 'fail');
    expect(minEl).toHaveAttribute('data-validator', 'pass');

    fixture.componentInstance.passwordControl.setValue('Password123');
    fixture.detectChanges();

    expect(reqEl).toHaveAttribute('data-validator', 'pass');
    expect(minEl).toHaveAttribute('data-validator', 'pass');
    expect(patEl).toHaveAttribute('data-validator', 'pass');
  });

  it('should handle async validation with proper status updates', async () => {
    const asyncValidator = (control: any) => {
      return new Promise<{ usernameTaken: boolean } | null>(resolve => {
        setTimeout(() => {
          resolve(control.value === 'taken' ? { usernameTaken: true } : null);
        }, 100);
      });
    };

    @Component({
      template: `
        <div ngpFormField>
          <label ngpLabel>Username</label>
          <input [formControl]="usernameControl" ngpFormControl />
          <div ngpDescription>Choose a unique username</div>
          <div ngpError ngpErrorValidator="usernameTaken">Username is already taken</div>
        </div>
      `,
      imports: [
        NgpFormField,
        NgpFormControl,
        NgpLabel,
        NgpDescription,
        NgpError,
        ReactiveFormsModule,
      ],
    })
    class TestComponent {
      usernameControl = new FormControl('', { asyncValidators: [asyncValidator] });
    }

    const { container, fixture } = await render(TestComponent);
    const formField = container.querySelector('[ngpFormField]');
    const input = container.querySelector('input')!;

    fixture.componentInstance.usernameControl.setValue('checking');
    fixture.detectChanges();

    expect(formField).toHaveAttribute('data-pending');
    expect(input).toHaveAttribute('data-pending');

    await new Promise(resolve => setTimeout(resolve, 150));
    fixture.detectChanges();

    expect(formField).not.toHaveAttribute('data-pending');
    expect(formField).toHaveAttribute('data-valid');
  });

  it('should work with external disabled control', async () => {
    const control = new FormControl('test');
    const { container, rerender, fixture } = await render(
      `<div ngpFormField>
        <label ngpLabel>External Control</label>
        <input [ngpFormControlDisabled]="isDisabled" [formControl]="control" ngpFormControl />
        <div ngpDescription>This can be disabled externally</div>
      </div>`,
      {
        imports: [NgpFormField, NgpFormControl, NgpLabel, NgpDescription, ReactiveFormsModule],
        componentProperties: { isDisabled: false, control },
      },
    );
    const input = container.querySelector('input');

    expect(input).not.toHaveAttribute('data-disabled');
    expect(input).not.toHaveAttribute('disabled');

    await rerender({ componentProperties: { isDisabled: true, control } });
    fixture.detectChanges();
    expect(input).toHaveAttribute('data-disabled');
    expect(input).toHaveAttribute('disabled');

    await rerender({ componentProperties: { isDisabled: false, control } });
    fixture.componentInstance.control.disable();
    fixture.detectChanges();
    expect(input).toHaveAttribute('data-disabled');
    expect(input).not.toHaveAttribute('disabled');
  });

  it('should clean up all registrations on component destroy', async () => {
    const { container, rerender } = await render(
      `<div ngpFormField>
        @if (showComponents) {
          <label id="cleanup-label" ngpLabel>Label</label>
          <input id="cleanup-input" [formControl]="control" ngpFormControl />
          <div id="cleanup-desc" ngpDescription>Description</div>
          <div id="cleanup-error" ngpError>Error</div>
        }
      </div>`,
      {
        imports: [
          NgpFormField,
          NgpFormControl,
          NgpLabel,
          NgpDescription,
          NgpError,
          ReactiveFormsModule,
        ],
        componentProperties: {
          showComponents: true,
          control: new FormControl('', [Validators.required]),
        },
      },
    );

    expect(container.querySelector('#cleanup-label')).not.toBeNull();
    expect(container.querySelector('#cleanup-input')).not.toBeNull();
    expect(container.querySelector('#cleanup-desc')).not.toBeNull();
    expect(container.querySelector('#cleanup-error')).not.toBeNull();

    await rerender({ componentProperties: { showComponents: false } });

    expect(container.querySelector('#cleanup-label')).toBeNull();
    expect(container.querySelector('#cleanup-input')).toBeNull();
    expect(container.querySelector('#cleanup-desc')).toBeNull();
    expect(container.querySelector('#cleanup-error')).toBeNull();
  });
});
