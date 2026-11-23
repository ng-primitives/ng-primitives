import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { render, waitFor } from '@testing-library/angular';
import { NgpDescription, NgpFormControl, NgpFormField } from 'ng-primitives/form-field';
import { describe, expect, it } from 'vitest';

describe('NgpDescription', () => {
  it('should initialize with correct attributes', async () => {
    const { container } = await render(`<div ngpDescription>Test Description</div>`, {
      imports: [NgpDescription],
    });

    const description = container.querySelector('[ngpDescription]');
    expect(description).toBeInTheDocument();
    expect(description).toHaveAttribute('id');
    expect(description?.getAttribute('id')).toMatch(/^ngp-description-\d+$/);
  });

  it('should use provided ID when specified', async () => {
    const { container } = await render(
      `<div ngpDescription id="custom-description">Test Description</div>`,
      { imports: [NgpDescription] },
    );

    const description = container.querySelector('[ngpDescription]');
    expect(description).toHaveAttribute('id', 'custom-description');
  });

  it('should register with form field when description is present', async () => {
    const { container } = await render(
      `<div ngpFormField>
        <div id="test-desc" ngpDescription>Test Description</div>
        <input ngpFormControl />
      </div>`,
      { imports: [NgpFormField, NgpDescription, NgpFormControl] },
    );

    const input = container.querySelector('input');
    expect(input).toHaveAttribute('aria-describedby', 'test-desc');
  });

  it('should unregister from form field when description is removed', async () => {
    const { container, rerender, fixture } = await render(
      `<div ngpFormField>
        @if (showDescription) {
          <div id="test-desc" ngpDescription>Test Description</div>
        }
        <input ngpFormControl />
      </div>`,
      {
        imports: [NgpFormField, NgpDescription, NgpFormControl, ReactiveFormsModule],
        componentProperties: { showDescription: true },
      },
    );

    const input = container.querySelector('input');
    expect(input).toHaveAttribute('aria-describedby', 'test-desc');

    await rerender({ componentProperties: { showDescription: false } });
    fixture.detectChanges();
    expect(input).not.toHaveAttribute('aria-describedby');
  });

  it('should reflect form field status in data attributes', async () => {
    @Component({
      template: `
        <div ngpFormField>
          <div ngpDescription>Test Description</div>
          <input [formControl]="control" ngpFormControl />
        </div>
      `,
      imports: [NgpFormField, NgpDescription, ReactiveFormsModule, NgpFormControl],
    })
    class TestComponent {
      control = new FormControl('', {
        validators: [control => (control.value ? null : { required: true })],
      });
    }

    const { fixture, container } = await render(TestComponent);
    const description = container.querySelector('[ngpDescription]');

    expect(description).toHaveAttribute('data-invalid');
    expect(description).not.toHaveAttribute('data-valid');

    fixture.componentInstance.control.markAsTouched();
    fixture.detectChanges();

    expect(description).toHaveAttribute('data-touched');

    const inputEl = container.querySelector('input')!;
    inputEl.value = 'test';
    inputEl.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(description).toHaveAttribute('data-valid');
    expect(description).toHaveAttribute('data-dirty');
    expect(description).not.toHaveAttribute('data-invalid');
    expect(description).not.toHaveAttribute('data-pristine');
  });

  it('should show disabled status when form control is disabled', async () => {
    @Component({
      template: `
        <div ngpFormField>
          <div ngpDescription>Test Description</div>
          <input [formControl]="control" />
        </div>
      `,
      imports: [NgpFormField, NgpDescription, ReactiveFormsModule, NgpFormControl],
    })
    class TestComponent {
      control = new FormControl({ value: '', disabled: true });
    }

    const { container } = await render(TestComponent);
    const description = container.querySelector('[ngpDescription]');
    expect(description).toHaveAttribute('data-disabled');
  });

  it('should show pending status during async validation', async () => {
    const asyncValidator = (control: any) => {
      return new Promise<{ async: boolean } | null>(resolve => {
        setTimeout(() => {
          resolve(control.value === 'invalid' ? { async: true } : null);
        }, 100);
      });
    };

    @Component({
      template: `
        <div ngpFormField>
          <div ngpDescription>Test Description</div>
          <input [formControl]="control" />
        </div>
      `,
      imports: [NgpFormField, NgpDescription, ReactiveFormsModule],
    })
    class TestComponent {
      control = new FormControl('', { asyncValidators: [asyncValidator] });
    }

    const { fixture, container } = await render(TestComponent);
    const description = container.querySelector('[ngpDescription]');

    fixture.componentInstance.control.setValue('test');
    fixture.detectChanges();

    expect(description).toHaveAttribute('data-pending');

    await new Promise(resolve => setTimeout(resolve, 150));
    fixture.detectChanges();

    expect(description).not.toHaveAttribute('data-pending');
  });

  it('should work without a form field parent', async () => {
    const { container } = await render(`<div ngpDescription>Standalone Description</div>`, {
      imports: [NgpDescription],
    });

    const description = container.querySelector('[ngpDescription]');
    expect(description).toBeInTheDocument();
    expect(description).toHaveAttribute('id');
    expect(description).not.toHaveAttribute('data-invalid');
    expect(description).not.toHaveAttribute('data-valid');
    expect(description).not.toHaveAttribute('data-touched');
  });

  it('should handle multiple descriptions in same form field', async () => {
    const { container } = await render(
      `<div ngpFormField>
        <div id="desc-1" ngpDescription>First Description</div>
        <div id="desc-2" ngpDescription>Second Description</div>
        <input ngpFormControl />
      </div>`,
      { imports: [NgpFormField, NgpDescription, NgpFormControl] },
    );

    const input = container.querySelector('input');
    expect(input).toHaveAttribute('aria-describedby', 'desc-1 desc-2');
  });

  it('should clean up properly when description is removed', async () => {
    const { container, rerender, fixture } = await render(
      `<div ngpFormField>
        @if (showDescription) {
          <div id="test-desc" ngpDescription>Test Description</div>
        }
        <input ngpFormControl />
      </div>`,
      {
        imports: [NgpFormField, NgpDescription, NgpFormControl],
        componentProperties: { showDescription: true },
      },
    );

    const input = container.querySelector('input');
    expect(input).toHaveAttribute('aria-describedby', 'test-desc');

    await rerender({ componentProperties: { showDescription: false } });
    fixture.detectChanges();
    expect(input).not.toHaveAttribute('aria-describedby');
  });

  it("should keep the control's own aria-describedby next to the descriptions", async () => {
    const { getByTestId, rerender } = await render(
      `<div ngpFormField>
        @if (showDescription) {
          <div id="test-desc" ngpDescription>Test Description</div>
        }
        <input ngpFormControl aria-describedby="hint" data-testid="in-field" />
      </div>
      <input ngpFormControl aria-describedby="hint" data-testid="standalone" />`,
      {
        imports: [NgpFormField, NgpDescription, NgpFormControl],
        componentProperties: { showDescription: false },
      },
    );

    expect(getByTestId('in-field')).toHaveAttribute('aria-describedby', 'hint');
    expect(getByTestId('standalone')).toHaveAttribute('aria-describedby', 'hint');

    await rerender({ componentProperties: { showDescription: true }, partialUpdate: true });
    await waitFor(() =>
      expect(getByTestId('in-field')).toHaveAttribute('aria-describedby', 'hint test-desc'),
    );

    await rerender({ componentProperties: { showDescription: false }, partialUpdate: true });
    await waitFor(() =>
      expect(getByTestId('in-field')).toHaveAttribute('aria-describedby', 'hint'),
    );
  });

  it('should keep the descriptions when the aria-describedby the consumer binds changes', async () => {
    const { getByRole, rerender } = await render(
      `<div ngpFormField>
        @if (showDescription) {
          <div id="test-desc" ngpDescription>Test Description</div>
        }
        <input ngpFormControl [attr.aria-describedby]="hint" />
      </div>`,
      {
        imports: [NgpFormField, NgpDescription, NgpFormControl],
        componentProperties: { showDescription: true, hint: 'hint' },
      },
    );
    const input = getByRole('textbox');
    expect(input).toHaveAttribute('aria-describedby', 'hint test-desc');

    // the binding rewrites the whole attribute, and the description is added back
    await rerender({ componentProperties: { hint: 'other' }, partialUpdate: true });
    await waitFor(() => expect(input).toHaveAttribute('aria-describedby', 'other test-desc'));

    await rerender({ componentProperties: { showDescription: false }, partialUpdate: true });
    await waitFor(() => expect(input).toHaveAttribute('aria-describedby', 'other'));
  });

  it('should merge a bound aria-describedby with a description in the first render', () => {
    @Component({
      imports: [NgpFormField, NgpDescription, NgpFormControl],
      template: `
        <div ngpFormField>
          <div id="test-desc" ngpDescription>Test Description</div>
          <input [attr.aria-describedby]="hint" ngpFormControl />
        </div>
      `,
    })
    class BoundHint {
      readonly hint = 'hint';
    }

    const fixture = TestBed.createComponent(BoundHint);
    fixture.detectChanges();

    // read in the same task: no observer callback has run yet
    expect(fixture.nativeElement.querySelector('input')).toHaveAttribute(
      'aria-describedby',
      'hint test-desc',
    );
  });

  it('should handle all form field state combinations', async () => {
    @Component({
      template: `
        <div ngpFormField>
          <div ngpDescription>Test Description</div>
          <input [formControl]="control" />
        </div>
      `,
      imports: [NgpFormField, NgpDescription, ReactiveFormsModule],
    })
    class TestComponent {
      control = new FormControl('', {
        validators: [control => (control.value.length < 3 ? { minlength: true } : null)],
      });
    }

    const { fixture, container } = await render(TestComponent);
    const description = container.querySelector('[ngpDescription]');
    const inputEl = container.querySelector('input')!;

    expect(description).toHaveAttribute('data-pristine');
    expect(description).toHaveAttribute('data-invalid');
    expect(description).not.toHaveAttribute('data-dirty');
    expect(description).not.toHaveAttribute('data-valid');
    expect(description).not.toHaveAttribute('data-touched');

    inputEl.value = 'ab';
    inputEl.dispatchEvent(new Event('input'));
    fixture.componentInstance.control.markAsTouched();
    fixture.detectChanges();

    expect(description).toHaveAttribute('data-dirty');
    expect(description).toHaveAttribute('data-touched');
    expect(description).toHaveAttribute('data-invalid');
    expect(description).not.toHaveAttribute('data-pristine');
    expect(description).not.toHaveAttribute('data-valid');

    inputEl.value = 'valid';
    inputEl.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(description).toHaveAttribute('data-dirty');
    expect(description).toHaveAttribute('data-touched');
    expect(description).toHaveAttribute('data-valid');
    expect(description).not.toHaveAttribute('data-pristine');
    expect(description).not.toHaveAttribute('data-invalid');
  });
});
