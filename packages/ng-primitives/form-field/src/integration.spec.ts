import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { fireEvent, render } from '@testing-library/angular';
import { NgpDescription } from './description/description';
import { NgpError } from './error/error';
import { NgpFormControl } from './form-control/form-control';
import { NgpFormField } from './form-field/form-field';
import { NgpLabel } from './label/label';

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

    const { fixture } = await render(TestComponent);
    const label = fixture.debugElement.nativeElement.querySelector('label');
    const input = fixture.debugElement.nativeElement.querySelector('input');
    const description = fixture.debugElement.nativeElement.querySelector('[ngpDescription]');
    const formField = fixture.debugElement.nativeElement.querySelector('[ngpFormField]');

    // Check accessibility attributes
    expect(input).toHaveAttribute('id', 'name-input');
    expect(input).toHaveAttribute('aria-labelledby', 'name-label');
    expect(input).toHaveAttribute('aria-describedby', 'name-help name-required');
    expect(label).toHaveAttribute('for', 'name-input');

    // Check form field status
    expect(formField).toHaveAttribute('data-invalid');
    expect(formField).toHaveAttribute('data-pristine');
    expect(input).toHaveAttribute('data-invalid');
    expect(label).toHaveAttribute('data-invalid');
    expect(description).toHaveAttribute('data-invalid');

    // Initially should show required error
    const requiredError = fixture.debugElement.nativeElement.querySelector('#name-required');
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

    const { fixture } = await render(TestComponent);
    const formField = fixture.debugElement.nativeElement.querySelector('[ngpFormField]');
    const input = fixture.debugElement.nativeElement.querySelector('input');
    const label = fixture.debugElement.nativeElement.querySelector('label');
    const description = fixture.debugElement.nativeElement.querySelector('[ngpDescription]');

    // Initially invalid with required error
    expect(formField).toHaveAttribute('data-invalid');
    expect(input).toHaveAttribute('data-invalid');
    expect(label).toHaveAttribute('data-invalid');
    expect(description).toHaveAttribute('data-invalid');

    // Set invalid email using user-like events so DOM data-* updates correctly
    input.value = 'invalid-email';
    fireEvent.input(input);
    fireEvent.blur(input);
    fixture.detectChanges();

    // Should show email error now
    expect(formField).toHaveAttribute('data-invalid');
    expect(formField).toHaveAttribute('data-touched');
    expect(formField).toHaveAttribute('data-dirty');
    expect(input).toHaveAttribute('data-invalid');
    expect(input).toHaveAttribute('data-touched');
    expect(input).toHaveAttribute('data-dirty');

    // Set valid email using user-like input
    input.value = 'test@example.com';
    fireEvent.input(input);
    fixture.detectChanges();

    // All should be valid now
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

    const { fixture } = await render(TestComponent);
    const input = fixture.debugElement.nativeElement.querySelector('input');

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

    const { fixture } = await render(TestComponent);
    const label = fixture.debugElement.nativeElement.querySelector('label');
    const input = fixture.debugElement.nativeElement.querySelector('input');

    const clickSpy = jest.fn();
    const focusSpy = jest.fn();
    input.click = clickSpy;
    input.focus = focusSpy;

    // Click label should trigger input click for checkbox
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

    const { fixture } = await render(TestComponent);
    const formField = fixture.debugElement.nativeElement.querySelector('[ngpFormField]');
    const input = fixture.debugElement.nativeElement.querySelector('input');
    const label = fixture.debugElement.nativeElement.querySelector('label');
    const description = fixture.debugElement.nativeElement.querySelector('[ngpDescription]');
    const error = fixture.debugElement.nativeElement.querySelector('[ngpError]');

    // All should show disabled state
    expect(formField).toHaveAttribute('data-disabled');
    expect(input).toHaveAttribute('data-disabled');
    expect(label).toHaveAttribute('data-disabled');
    expect(description).toHaveAttribute('data-disabled');
    expect(error).toHaveAttribute('data-disabled');
  });

  it('should handle dynamic component addition and removal', async () => {
    @Component({
      template: `
        <div #formField="ngpFormField" ngpFormField>
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
      showLabel = true;
      showInput = true;
      showDescription = true;
      showError = true;
      control = new FormControl('', [Validators.required]);
    }

    const { fixture } = await render(TestComponent);
    // Initially all should be registered (assert via DOM)
    expect(fixture.debugElement.nativeElement.querySelector('#main-label')).not.toBeNull();
    expect(fixture.debugElement.nativeElement.querySelector('#dynamic-input')).not.toBeNull();
    expect(fixture.debugElement.nativeElement.querySelector('#main-desc')).not.toBeNull();
    expect(fixture.debugElement.nativeElement.querySelector('#main-error')).not.toBeNull();

    // Remove components
    fixture.componentInstance.showLabel = false;
    fixture.componentInstance.showInput = false;
    fixture.componentInstance.showDescription = false;
    fixture.componentInstance.showError = false;
    fixture.detectChanges();

    // All should be unregistered (assert via DOM)
    expect(fixture.debugElement.nativeElement.querySelector('#main-label')).toBeNull();
    expect(fixture.debugElement.nativeElement.querySelector('#dynamic-input')).toBeNull();
    expect(fixture.debugElement.nativeElement.querySelector('#main-desc')).toBeNull();
    expect(fixture.debugElement.nativeElement.querySelector('#main-error')).toBeNull();
  });

  it('should handle complex validation scenarios', async () => {
    @Component({
      template: `
        <div #formField="ngpFormField" ngpFormField>
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

    const { fixture } = await render(TestComponent);
    // Initially should show required error (assert via data-validator attribute)
    const reqEl = fixture.debugElement.nativeElement.querySelector('#pwd-required');
    const minEl = fixture.debugElement.nativeElement.querySelector('#pwd-minlength');
    const patEl = fixture.debugElement.nativeElement.querySelector('#pwd-pattern');

    expect(reqEl).toHaveAttribute('data-validator', 'fail');
    expect(minEl).toHaveAttribute('data-validator', 'pass');
    expect(patEl).toHaveAttribute('data-validator', 'pass');

    // Set short password
    fixture.componentInstance.passwordControl.setValue('abc');
    fixture.detectChanges();

    expect(minEl).toHaveAttribute('data-validator', 'fail');
    expect(reqEl).toHaveAttribute('data-validator', 'pass');

    // Set long but invalid pattern
    fixture.componentInstance.passwordControl.setValue('abcdefgh');
    fixture.detectChanges();

    expect(patEl).toHaveAttribute('data-validator', 'fail');
    expect(minEl).toHaveAttribute('data-validator', 'pass');

    // Set valid password
    fixture.componentInstance.passwordControl.setValue('Password123');
    fixture.detectChanges();

    // After valid password, all error elements should be marked as pass
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

    const { fixture } = await render(TestComponent);
    const formField = fixture.debugElement.nativeElement.querySelector('[ngpFormField]');
    const input = fixture.debugElement.nativeElement.querySelector('input');

    // Set value to trigger async validation
    fixture.componentInstance.usernameControl.setValue('checking');
    fixture.detectChanges();

    // Should show pending status
    expect(formField).toHaveAttribute('data-pending');
    expect(input).toHaveAttribute('data-pending');

    // Wait for validation
    await new Promise(resolve => setTimeout(resolve, 150));
    fixture.detectChanges();

    expect(formField).not.toHaveAttribute('data-pending');
    expect(formField).toHaveAttribute('data-valid');
  });

  it('should work with external disabled control', async () => {
    @Component({
      template: `
        <div ngpFormField>
          <label ngpLabel>External Control</label>
          <input [ngpFormControlDisabled]="isDisabled" [formControl]="control" ngpFormControl />
          <div ngpDescription>This can be disabled externally</div>
        </div>
      `,
      imports: [NgpFormField, NgpFormControl, NgpLabel, NgpDescription, ReactiveFormsModule],
    })
    class TestComponent {
      isDisabled = false;
      control = new FormControl('test');
    }

    const { fixture } = await render(TestComponent);
    const input = fixture.debugElement.nativeElement.querySelector('input');

    // Initially not disabled
    expect(input).not.toHaveAttribute('data-disabled');
    expect(input).not.toHaveAttribute('disabled');

    // Disable externally
    fixture.componentInstance.isDisabled = true;
    fixture.detectChanges();

    expect(input).toHaveAttribute('data-disabled');
    expect(input).toHaveAttribute('disabled');

    // Enable and disable via form control
    fixture.componentInstance.isDisabled = false;
    fixture.componentInstance.control.disable();
    fixture.detectChanges();

    expect(input).toHaveAttribute('data-disabled');
    expect(input).toHaveAttribute('disabled');
  });

  it('should clean up all registrations on component destroy', async () => {
    @Component({
      template: `
        <div #formField="ngpFormField" ngpFormField>
          @if (showComponents) {
            <label id="cleanup-label" ngpLabel>Label</label>
            <input id="cleanup-input" [formControl]="control" ngpFormControl />
            <div id="cleanup-desc" ngpDescription>Description</div>
            <div id="cleanup-error" ngpError>Error</div>
          }
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
      showComponents = true;
      control = new FormControl('', [Validators.required]);
    }

    const { fixture } = await render(TestComponent);
    // Initially all registered (assert via DOM)
    expect(fixture.debugElement.nativeElement.querySelector('#cleanup-label')).not.toBeNull();
    expect(fixture.debugElement.nativeElement.querySelector('#cleanup-input')).not.toBeNull();
    expect(fixture.debugElement.nativeElement.querySelector('#cleanup-desc')).not.toBeNull();
    expect(fixture.debugElement.nativeElement.querySelector('#cleanup-error')).not.toBeNull();

    // Destroy all components
    fixture.componentInstance.showComponents = false;
    fixture.detectChanges();

    // All should be cleaned up (assert via DOM)
    expect(fixture.debugElement.nativeElement.querySelector('#cleanup-label')).toBeNull();
    expect(fixture.debugElement.nativeElement.querySelector('#cleanup-input')).toBeNull();
    expect(fixture.debugElement.nativeElement.querySelector('#cleanup-desc')).toBeNull();
    expect(fixture.debugElement.nativeElement.querySelector('#cleanup-error')).toBeNull();
  });
});
