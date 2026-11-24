import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { render, waitFor } from '@testing-library/angular';
import { NgpDescription, NgpError, NgpFormControl, NgpFormField } from 'ng-primitives/form-field';
import { describe, expect, it } from 'vitest';

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

    const { container, fixture } = await render(TestComponent);
    const input = container.querySelector('input');

    expect(input).toHaveAttribute('aria-describedby', 'test-error');

    fixture.componentInstance.control.setValue('valid');
    fixture.detectChanges();

    expect(input).not.toHaveAttribute('aria-describedby');

    fixture.componentInstance.control.setValue('');
    fixture.detectChanges();

    expect(input).toHaveAttribute('aria-describedby', 'test-error');
  });

  it('should only register when specific validator fails', async () => {
    @Component({
      template: `
        <div ngpFormField>
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

    const { container, fixture } = await render(TestComponent);
    const input = container.querySelector('input');

    expect(input).toHaveAttribute('aria-describedby', 'required-error');

    fixture.componentInstance.control.setValue('ab');
    fixture.detectChanges();

    expect(input).toHaveAttribute('aria-describedby', 'minlength-error');

    fixture.componentInstance.control.setValue('valid');
    fixture.detectChanges();

    expect(input).not.toHaveAttribute('aria-describedby');
  });

  it('should show all errors when no specific validator is specified', async () => {
    @Component({
      template: `
        <div ngpFormField>
          <div id="any-error" ngpError>Any Error</div>
          <input [formControl]="control" ngpFormControl />
        </div>
      `,
      imports: [NgpFormField, NgpError, NgpFormControl, ReactiveFormsModule],
    })
    class TestComponent {
      control = new FormControl('', [Validators.required, Validators.minLength(3)]);
    }

    const { container, fixture } = await render(TestComponent);
    const input = container.querySelector('input');

    expect(input).toHaveAttribute('aria-describedby', 'any-error');

    fixture.componentInstance.control.setValue('ab');
    fixture.detectChanges();

    expect(input).toHaveAttribute('aria-describedby', 'any-error');

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

    const { container, fixture } = await render(TestComponent);
    const error = container.querySelector('[ngpError]');

    expect(error).toHaveAttribute('data-invalid');
    expect(error).not.toHaveAttribute('data-valid');

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

    const { container, fixture } = await render(TestComponent);
    const error = container.querySelector('[ngpError]');

    expect(error).toHaveAttribute('data-validator', 'fail');

    fixture.componentInstance.control.setValue('test');
    fixture.detectChanges();

    expect(error).toHaveAttribute('data-validator', 'pass');
  });

  it('should handle ID changes properly', async () => {
    const control = new FormControl('', [Validators.required]);
    const { container, rerender, fixture } = await render(
      `<div ngpFormField>
        <div [id]="errorId" ngpError>Test Error</div>
        <input [formControl]="control" ngpFormControl />
      </div>`,
      {
        imports: [NgpFormField, NgpError, NgpFormControl, ReactiveFormsModule],
        componentProperties: { errorId: 'initial-id', control },
      },
    );

    const input = container.querySelector('input');
    expect(input).toHaveAttribute('aria-describedby', 'initial-id');

    await rerender({ componentProperties: { errorId: 'new-id', control } });
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

    const { container } = await render(TestComponent);
    const error = container.querySelector('[ngpError]');

    expect(error).toHaveAttribute('data-disabled');
  });

  it('should work without a form field parent', async () => {
    const { container } = await render(`<div ngpError>Standalone Error</div>`, {
      imports: [NgpError],
    });

    const error = container.querySelector('[ngpError]');
    expect(error).toBeInTheDocument();
    expect(error).toHaveAttribute('id');
    expect(error).toHaveAttribute('data-validator', 'pass');
    expect(error).not.toHaveAttribute('data-invalid');
  });

  it('should handle multiple errors for different validators', async () => {
    @Component({
      template: `
        <div ngpFormField>
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

    const { container, fixture } = await render(TestComponent);
    const input = container.querySelector('input');

    expect(input).toHaveAttribute('aria-describedby', 'req-error');

    fixture.componentInstance.control.setValue('abc');
    fixture.detectChanges();

    expect(input).toHaveAttribute('aria-describedby', 'min-error email-error');

    fixture.componentInstance.control.setValue('invalid-email');
    fixture.detectChanges();

    expect(input).toHaveAttribute('aria-describedby', 'email-error');

    fixture.componentInstance.control.setValue('test@example.com');
    fixture.detectChanges();

    expect(input).not.toHaveAttribute('aria-describedby');
  });

  it('should clean up properly on destroy', async () => {
    const control = new FormControl('', [Validators.required]);
    const { container, rerender, fixture } = await render(
      `<div ngpFormField>
        @if (showError) {
          <div id="test-error" ngpError>Test Error</div>
        }
        <input [formControl]="control" ngpFormControl />
      </div>`,
      {
        imports: [NgpFormField, NgpError, NgpFormControl, ReactiveFormsModule],
        componentProperties: { showError: true, control },
      },
    );

    const input = container.querySelector('input');
    expect(input).toHaveAttribute('aria-describedby', 'test-error');

    await rerender({ componentProperties: { showError: false, control } });
    fixture.detectChanges();
    expect(input).not.toHaveAttribute('aria-describedby');
  });

  it('should unregister when destroyed by the change that clears its error', async () => {
    @Component({
      template: `
        <div ngpFormField>
          <input [formControl]="control" ngpFormControl />
          <p id="description" ngpDescription>Description</p>
          @if (control.hasError('required')) {
            <p ngpError ngpErrorValidator="required">Required Error</p>
          }
        </div>
      `,
      imports: [NgpFormField, NgpDescription, NgpError, NgpFormControl, ReactiveFormsModule],
    })
    class TestComponent {
      control = new FormControl('', [Validators.required]);
    }

    const { container, fixture } = await render(TestComponent);
    const input = container.querySelector('input');
    const errorId = () => container.querySelector('[ngpError]')?.id;

    expect(input).toHaveAttribute('aria-describedby', `description ${errorId()}`);

    fixture.componentInstance.control.setValue('valid');
    fixture.detectChanges();

    expect(container.querySelector('[ngpError]')).not.toBeInTheDocument();
    expect(input).toHaveAttribute('aria-describedby', 'description');

    fixture.componentInstance.control.setValue('');
    fixture.detectChanges();

    expect(input).toHaveAttribute('aria-describedby', `description ${errorId()}`);

    fixture.componentInstance.control.setValue('valid');
    fixture.detectChanges();

    expect(input).toHaveAttribute('aria-describedby', 'description');
  });

  it('should keep an id two errors share when the passing one is destroyed', async () => {
    @Component({
      template: `
        <div ngpFormField>
          <input [formControl]="control" ngpFormControl />
          <p id="email-error" ngpError ngpErrorValidator="email">Invalid</p>
          @if (showRequired) {
            <p id="email-error" ngpError ngpErrorValidator="required">Required</p>
          }
        </div>
      `,
      imports: [NgpFormField, NgpError, NgpFormControl, ReactiveFormsModule],
    })
    class TestComponent {
      showRequired = true;
      control = new FormControl('not-an-email', [Validators.required, Validators.email]);
    }

    const { container, fixture } = await render(TestComponent);
    const input = container.querySelector('input');

    expect(input).toHaveAttribute('aria-describedby', 'email-error');

    fixture.componentInstance.showRequired = false;
    fixture.detectChanges();

    expect(input).toHaveAttribute('aria-describedby', 'email-error');
  });

  it('should keep an id two showing errors share until the last one stops showing', async () => {
    @Component({
      template: `
        <div ngpFormField>
          <input [formControl]="control" ngpFormControl />
          <p id="pw-error" ngpError ngpErrorValidator="minlength">Too short</p>
          <p id="pw-error" ngpError ngpErrorValidator="pattern">Needs a digit</p>
        </div>
      `,
      imports: [NgpFormField, NgpError, NgpFormControl, ReactiveFormsModule],
    })
    class TestComponent {
      control = new FormControl('abc', [Validators.minLength(5), Validators.pattern(/\d/)]);
    }

    const { container, fixture } = await render(TestComponent);
    const input = container.querySelector('input');

    expect(input).toHaveAttribute('aria-describedby', 'pw-error');

    fixture.componentInstance.control.setValue('abcdef');
    fixture.detectChanges();

    expect(input).toHaveAttribute('aria-describedby', 'pw-error');

    fixture.componentInstance.control.setValue('abcdef1');
    fixture.detectChanges();

    expect(input).not.toHaveAttribute('aria-describedby');
  });

  it('should keep a showing error ahead of a description rendered after it', async () => {
    @Component({
      template: `
        <div ngpFormField>
          <input [formControl]="control" ngpFormControl />
          @if (showMessages) {
            <p ngpError>Error</p>
            <p ngpDescription>Description</p>
          }
        </div>
      `,
      imports: [NgpFormField, NgpDescription, NgpError, NgpFormControl, ReactiveFormsModule],
    })
    class TestComponent {
      showMessages = false;
      control = new FormControl('', [Validators.required]);
    }

    const { container, fixture } = await render(TestComponent);

    fixture.componentInstance.showMessages = true;
    fixture.detectChanges();

    const errorId = container.querySelector('[ngpError]')?.id;
    const descriptionId = container.querySelector('[ngpDescription]')?.id;

    expect(container.querySelector('input')).toHaveAttribute(
      'aria-describedby',
      `${errorId} ${descriptionId}`,
    );
  });

  it('should register under the new id when the id changes while the validator passes', async () => {
    const control = new FormControl('valid', [Validators.required]);
    const { container, rerender, fixture } = await render(
      `<div ngpFormField>
        <div [id]="errorId" ngpError>Test Error</div>
        <input [formControl]="control" ngpFormControl />
      </div>`,
      {
        imports: [NgpFormField, NgpError, NgpFormControl, ReactiveFormsModule],
        componentProperties: { errorId: 'initial-id', control },
      },
    );

    const input = container.querySelector('input');
    expect(input).not.toHaveAttribute('aria-describedby');

    await rerender({ componentProperties: { errorId: 'new-id', control } });
    fixture.detectChanges();
    expect(input).not.toHaveAttribute('aria-describedby');

    control.setValue('');
    fixture.detectChanges();
    expect(input).toHaveAttribute('aria-describedby', 'new-id');
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

    const { container, fixture } = await render(TestComponent);
    const input = container.querySelector('input');
    const asyncError = container.querySelector('#async-error');

    fixture.componentInstance.control.setValue('invalid');
    fixture.detectChanges();

    await waitFor(() => expect(asyncError).toHaveAttribute('data-validator', 'fail'));
    expect(input).toHaveAttribute('aria-describedby', 'async-error');

    fixture.componentInstance.control.setValue('valid');
    fixture.detectChanges();

    await waitFor(() => expect(asyncError).toHaveAttribute('data-validator', 'pass'));
    expect(input).not.toHaveAttribute('aria-describedby');
  });
});
