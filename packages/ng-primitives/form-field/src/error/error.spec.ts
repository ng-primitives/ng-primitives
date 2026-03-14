import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { render } from '@testing-library/angular';
import { NgpFormControl } from '../form-control/form-control';
import { NgpFormField } from '../form-field/form-field';
import { NgpError } from './error';

describe('NgpError', () => {
  it('should initialize with correct attributes', async () => {
    const { container } = await render(`<div ngpError>Test Error</div>`, {
      imports: [NgpError],
    });

    const error = container.querySelector('[ngpError]');
    expect(error).toBeInTheDocument();
    expect(error).toHaveAttribute('id');
    expect(error?.getAttribute('id')).toMatch(/^ngp-error-\d+$/);
  });

  it('should use provided ID when specified', async () => {
    const { container } = await render(`<div ngpError id="custom-error">Test Error</div>`, {
      imports: [NgpError],
    });

    const error = container.querySelector('[ngpError]');
    expect(error).toHaveAttribute('id', 'custom-error');
  });

  it('should register and unregister with form field when error is present', async () => {
    @Component({
      template: `
        <div ngpFormField>
          @if (showError) {
            <div id="test-error" ngpError>Test Error</div>
          }
          <input [formControl]="control" ngpFormControl />
        </div>
      `,
      imports: [NgpFormField, NgpError, NgpFormControl, ReactiveFormsModule],
    })
    class TestComponent {
      showError = true;
      control = new FormControl('', [Validators.required]);
    }

    const { fixture } = await render(TestComponent);
    const input = fixture.debugElement.nativeElement.querySelector('input');

    // Initially should be registered because control is invalid
    expect(input).toHaveAttribute('aria-describedby', 'test-error');

    // Make control valid
    fixture.componentInstance.control.setValue('valid');
    fixture.detectChanges();

    // Should be unregistered because no error
    expect(input).not.toHaveAttribute('aria-describedby');

    // Make control invalid again
    fixture.componentInstance.control.setValue('');
    fixture.detectChanges();

    // Should be registered again
    expect(input).toHaveAttribute('aria-describedby', 'test-error');
  });

  it('should only register when specific validator fails', async () => {
    @Component({
      template: `
        <div #formField="ngpFormField" ngpFormField>
          <div id="required-error" ngpError ngpErrorValidator="required">Required Error</div>
          <div id="minlength-error" ngpError ngpErrorValidator="minlength">Minlength Error</div>
          <input [formControl]="control" ngpFormControl />
        </div>
      `,
      imports: [NgpFormField, NgpError, NgpFormControl, ReactiveFormsModule],
    })
    class TestComponent {
      control = new FormControl('', [Validators.required, Validators.minLength(3)]);
    }

    const { fixture } = await render(TestComponent);
    const input = fixture.debugElement.nativeElement.querySelector('input');

    // Initially should show required error
    expect(input).toHaveAttribute('aria-describedby', 'required-error');

    // Set short value (only minlength error)
    fixture.componentInstance.control.setValue('ab');
    fixture.detectChanges();

    expect(input).toHaveAttribute('aria-describedby', 'minlength-error');

    // Set valid value (no errors)
    fixture.componentInstance.control.setValue('valid');
    fixture.detectChanges();

    expect(input).not.toHaveAttribute('aria-describedby');
  });

  it('should show all errors when no specific validator is specified', async () => {
    @Component({
      template: `
        <div #formField="ngpFormField" ngpFormField>
          <div id="any-error" ngpError>Any Error</div>
          <input [formControl]="control" ngpFormControl />
        </div>
      `,
      imports: [NgpFormField, NgpError, NgpFormControl, ReactiveFormsModule],
    })
    class TestComponent {
      control = new FormControl('', [Validators.required, Validators.minLength(3)]);
    }

    const { fixture } = await render(TestComponent);
    const input = fixture.debugElement.nativeElement.querySelector('input');

    // Should be registered when any error exists
    expect(input).toHaveAttribute('aria-describedby', 'any-error');

    // Set short value (still has error)
    fixture.componentInstance.control.setValue('ab');
    fixture.detectChanges();

    expect(input).toHaveAttribute('aria-describedby', 'any-error');

    // Set valid value (no errors)
    fixture.componentInstance.control.setValue('valid');
    fixture.detectChanges();

    expect(input).not.toHaveAttribute('aria-describedby');
  });

  it('should reflect form field status in data attributes', async () => {
    @Component({
      template: `
        <div ngpFormField>
          <div ngpError>Test Error</div>
          <input [formControl]="control" ngpFormControl />
        </div>
      `,
      imports: [NgpFormField, NgpError, NgpFormControl, ReactiveFormsModule],
    })
    class TestComponent {
      control = new FormControl('', [Validators.required]);
    }

    const { fixture } = await render(TestComponent);
    const error = fixture.debugElement.nativeElement.querySelector('[ngpError]');

    // Initially invalid
    expect(error).toHaveAttribute('data-invalid');
    expect(error).not.toHaveAttribute('data-valid');

    // Set valid value
    fixture.componentInstance.control.setValue('test');
    fixture.detectChanges();

    expect(error).toHaveAttribute('data-valid');
    expect(error).not.toHaveAttribute('data-invalid');
  });

  it('should show validator state in data-validator attribute', async () => {
    @Component({
      template: `
        <div ngpFormField>
          <div ngpError ngpErrorValidator="required">Required Error</div>
          <input [formControl]="control" ngpFormControl />
        </div>
      `,
      imports: [NgpFormField, NgpError, NgpFormControl, ReactiveFormsModule],
    })
    class TestComponent {
      control = new FormControl('', [Validators.required]);
    }

    const { fixture } = await render(TestComponent);
    const error = fixture.debugElement.nativeElement.querySelector('[ngpError]');

    // Initially should fail
    expect(error).toHaveAttribute('data-validator', 'fail');

    // Set valid value
    fixture.componentInstance.control.setValue('test');
    fixture.detectChanges();

    expect(error).toHaveAttribute('data-validator', 'pass');
  });

  it('should handle ID changes properly', async () => {
    @Component({
      template: `
        <div #formField="ngpFormField" ngpFormField>
          <div [id]="errorId" ngpError>Test Error</div>
          <input [formControl]="control" ngpFormControl />
        </div>
      `,
      imports: [NgpFormField, NgpError, NgpFormControl, ReactiveFormsModule],
    })
    class TestComponent {
      errorId = 'initial-id';
      control = new FormControl('', [Validators.required]);
    }

    const { fixture } = await render(TestComponent);
    const input = fixture.debugElement.nativeElement.querySelector('input');

    // Initially should be registered with initial ID
    expect(input).toHaveAttribute('aria-describedby', 'initial-id');

    // Change ID
    fixture.componentInstance.errorId = 'new-id';
    fixture.detectChanges();

    expect(input).toHaveAttribute('aria-describedby', 'new-id');
  });

  it('should handle disabled status', async () => {
    @Component({
      template: `
        <div ngpFormField>
          <div ngpError>Test Error</div>
          <input [formControl]="control" ngpFormControl />
        </div>
      `,
      imports: [NgpFormField, NgpError, NgpFormControl, ReactiveFormsModule],
    })
    class TestComponent {
      control = new FormControl({ value: '', disabled: true }, [Validators.required]);
    }

    const { fixture } = await render(TestComponent);
    const error = fixture.debugElement.nativeElement.querySelector('[ngpError]');

    expect(error).toHaveAttribute('data-disabled');
  });

  it('should work without a form field parent', async () => {
    const { container } = await render(`<div ngpError>Standalone Error</div>`, {
      imports: [NgpError],
    });

    const error = container.querySelector('[ngpError]');
    expect(error).toBeInTheDocument();
    expect(error).toHaveAttribute('id');
    expect(error).toHaveAttribute('data-validator', 'pass'); // No form field means no errors
    expect(error).not.toHaveAttribute('data-invalid');
  });

  it('should handle multiple errors for different validators', async () => {
    @Component({
      template: `
        <div #formField="ngpFormField" ngpFormField>
          <div id="req-error" ngpError ngpErrorValidator="required">Required</div>
          <div id="min-error" ngpError ngpErrorValidator="minlength">Min Length</div>
          <div id="email-error" ngpError ngpErrorValidator="email">Email</div>
          <input [formControl]="control" ngpFormControl />
        </div>
      `,
      imports: [NgpFormField, NgpError, NgpFormControl, ReactiveFormsModule],
    })
    class TestComponent {
      control = new FormControl('', [
        Validators.required,
        Validators.minLength(5),
        Validators.email,
      ]);
    }

    const { fixture } = await render(TestComponent);
    const input = fixture.debugElement.nativeElement.querySelector('input');

    // Initially should show required error only
    expect(input).toHaveAttribute('aria-describedby', 'req-error');

    // Set short value (minlength + email errors may both be present)
    fixture.componentInstance.control.setValue('abc');
    fixture.detectChanges();

    // The implementation exposes all matching validator errors, so both
    // `min-error` and `email-error` will be present in aria-describedby.
    expect(input).toHaveAttribute('aria-describedby', 'min-error email-error');

    // Set long but invalid email
    fixture.componentInstance.control.setValue('invalid-email');
    fixture.detectChanges();

    expect(input).toHaveAttribute('aria-describedby', 'email-error');

    // Set valid email
    fixture.componentInstance.control.setValue('test@example.com');
    fixture.detectChanges();

    expect(input).not.toHaveAttribute('aria-describedby');
  });

  it('should clean up properly on destroy', async () => {
    @Component({
      template: `
        <div #formField="ngpFormField" ngpFormField>
          @if (showError) {
            <div id="test-error" ngpError>Test Error</div>
          }
          <input [formControl]="control" ngpFormControl />
        </div>
      `,
      imports: [NgpFormField, NgpError, NgpFormControl, ReactiveFormsModule],
    })
    class TestComponent {
      showError = true;
      control = new FormControl('', [Validators.required]);
    }

    const { fixture } = await render(TestComponent);
    const input = fixture.debugElement.nativeElement.querySelector('input');

    expect(input).toHaveAttribute('aria-describedby', 'test-error');

    // Destroy component
    fixture.componentInstance.showError = false;
    fixture.detectChanges();

    expect(input).not.toHaveAttribute('aria-describedby');
  });

  it('should handle async validation errors', async () => {
    const asyncValidator = (control: any) => {
      return new Promise<{ asyncError: boolean } | null>(resolve => {
        setTimeout(() => {
          resolve(control.value === 'invalid' ? { asyncError: true } : null);
        }, 100);
      });
    };

    @Component({
      template: `
        <div ngpFormField>
          <div id="async-error" ngpError ngpErrorValidator="asyncError">Async Error</div>
          <input [formControl]="control" ngpFormControl />
        </div>
      `,
      imports: [NgpFormField, NgpError, NgpFormControl, ReactiveFormsModule],
    })
    class TestComponent {
      control = new FormControl('', { asyncValidators: [asyncValidator] });
    }

    const { fixture } = await render(TestComponent);
    const input = fixture.debugElement.nativeElement.querySelector('input');
    const asyncError = fixture.debugElement.nativeElement.querySelector('#async-error');

    // Set invalid value
    fixture.componentInstance.control.setValue('invalid');
    fixture.detectChanges();

    // Wait for async validation to complete
    await new Promise(resolve => setTimeout(resolve, 150));
    fixture.detectChanges();

    // Error should be active and included in aria-describedby
    expect(asyncError).toHaveAttribute('data-validator', 'fail');
    expect(input).toHaveAttribute('aria-describedby', 'async-error');

    // Set valid value
    fixture.componentInstance.control.setValue('valid');
    fixture.detectChanges();

    await new Promise(resolve => setTimeout(resolve, 150));
    fixture.detectChanges();

    // Error should not be active
    expect(asyncError).toHaveAttribute('data-validator', 'pass');
    expect(input).not.toHaveAttribute('aria-describedby');
  });
});
