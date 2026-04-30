import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { render } from '@testing-library/angular';
import {
  NgpDescription,
  NgpError,
  NgpFormControl,
  NgpFormField,
  NgpLabel,
} from 'ng-primitives/form-field';
import { describe, expect, it } from 'vitest';

describe('NgpFormField', () => {
  it('should initialise correctly', async () => {
    const { container } = await render(`<div ngpFormField></div>`, {
      imports: [NgpFormField],
    });

    const element = container.querySelector('[ngpFormField]');
    expect(element).toBeInTheDocument();
  });

  it('should track form control status with reactive forms', async () => {
    const { container } = await render(
      `<div ngpFormField>
        <input [formControl]="control" />
      </div>`,
      {
        imports: [NgpFormField, ReactiveFormsModule],
        componentProperties: { control: new FormControl('', { validators: [] }) },
      },
    );
    const formField = container.querySelector('[ngpFormField]');

    expect(formField).toHaveAttribute('data-pristine');
    expect(formField).toHaveAttribute('data-valid');
    expect(formField).not.toHaveAttribute('data-touched');
    expect(formField).not.toHaveAttribute('data-dirty');
    expect(formField).not.toHaveAttribute('data-invalid');
  });

  it('should update status when form control is touched and dirty', async () => {
    const control = new FormControl('');
    const { container, fixture } = await render(
      `<div ngpFormField>
        <input [formControl]="control" />
      </div>`,
      {
        imports: [NgpFormField, ReactiveFormsModule],
        componentProperties: { control },
      },
    );
    const formField = container.querySelector('[ngpFormField]');

    fixture.componentInstance.control.markAsTouched();
    fixture.componentInstance.control.markAsDirty();
    fixture.detectChanges();

    expect(formField).toHaveAttribute('data-touched');
    expect(formField).toHaveAttribute('data-dirty');
    expect(formField).not.toHaveAttribute('data-pristine');
  });

  it('should show invalid status when form control has validation errors', async () => {
    const control = new FormControl('', {
      validators: [ctrl => (ctrl.value ? null : { required: true })],
    });
    const { container, fixture } = await render(
      `<div ngpFormField>
        <input [formControl]="control" />
      </div>`,
      {
        imports: [NgpFormField, ReactiveFormsModule],
        componentProperties: { control },
      },
    );
    const formField = container.querySelector('[ngpFormField]');

    expect(formField).toHaveAttribute('data-invalid');
    expect(formField).not.toHaveAttribute('data-valid');

    fixture.componentInstance.control.setValue('test');
    fixture.detectChanges();

    expect(formField).toHaveAttribute('data-valid');
    expect(formField).not.toHaveAttribute('data-invalid');
  });

  it('should show disabled status when form control is disabled', async () => {
    const { container } = await render(
      `<div ngpFormField>
        <input [formControl]="control" />
      </div>`,
      {
        imports: [NgpFormField, ReactiveFormsModule],
        componentProperties: { control: new FormControl({ value: '', disabled: true }) },
      },
    );
    const formField = container.querySelector('[ngpFormField]');

    expect(formField).toHaveAttribute('data-disabled');
  });

  it('should track labels registration and removal', async () => {
    const { container, rerender, fixture } = await render(
      `<div ngpFormField>
        @if (showLabel1) {
          <label id="label-1" ngpLabel>Label 1</label>
        }
        @if (showLabel2) {
          <label id="label-2" ngpLabel>Label 2</label>
        }
        <input ngpFormControl />
      </div>`,
      {
        imports: [NgpFormField, NgpLabel, NgpFormControl],
        componentProperties: { showLabel1: true, showLabel2: false },
      },
    );
    const input = container.querySelector('input');

    expect(input).toHaveAttribute('aria-labelledby', 'label-1');

    await rerender({ componentProperties: { showLabel1: true, showLabel2: true } });
    fixture.detectChanges();
    expect(input).toHaveAttribute('aria-labelledby', 'label-1 label-2');

    await rerender({ componentProperties: { showLabel1: false, showLabel2: true } });
    fixture.detectChanges();
    expect(input).toHaveAttribute('aria-labelledby', 'label-2');

    await rerender({ componentProperties: { showLabel1: false, showLabel2: false } });
    fixture.detectChanges();
    expect(input).not.toHaveAttribute('aria-labelledby');
  });

  it('should track descriptions registration and removal', async () => {
    const { container, rerender, fixture } = await render(
      `<div ngpFormField>
        @if (showDesc1) {
          <div id="desc-1" ngpDescription>Description 1</div>
        }
        @if (showDesc2) {
          <div id="desc-2" ngpDescription>Description 2</div>
        }
        <input ngpFormControl />
      </div>`,
      {
        imports: [NgpFormField, NgpDescription, NgpFormControl],
        componentProperties: { showDesc1: true, showDesc2: false },
      },
    );
    const input = container.querySelector('input');

    expect(input).toHaveAttribute('aria-describedby', 'desc-1');

    await rerender({ componentProperties: { showDesc1: true, showDesc2: true } });
    fixture.detectChanges();
    expect(input).toHaveAttribute('aria-describedby', 'desc-1 desc-2');

    await rerender({ componentProperties: { showDesc1: false, showDesc2: true } });
    fixture.detectChanges();
    expect(input).toHaveAttribute('aria-describedby', 'desc-2');

    await rerender({ componentProperties: { showDesc1: false, showDesc2: false } });
    fixture.detectChanges();
    expect(input).not.toHaveAttribute('aria-describedby');
  });

  it('should track form control ID registration and removal', async () => {
    const { container, rerender, fixture } = await render(
      `<div ngpFormField>
        <label id="test-label" ngpLabel>Test Label</label>
        @if (showControl) {
          <input id="test-control" ngpFormControl />
        }
      </div>`,
      {
        imports: [NgpFormField, NgpLabel, NgpFormControl],
        componentProperties: { showControl: false },
      },
    );
    const label = container.querySelector('label');

    expect(label).not.toHaveAttribute('for');

    await rerender({ componentProperties: { showControl: true } });
    fixture.detectChanges();
    expect(label).toHaveAttribute('for', 'test-control');

    await rerender({ componentProperties: { showControl: false } });
    fixture.detectChanges();
    expect(label).not.toHaveAttribute('for');
  });

  it('should handle form control status subscription cleanup', async () => {
    const { fixture } = await render(
      `<div ngpFormField>
        <input [formControl]="control" />
      </div>`,
      {
        imports: [NgpFormField, ReactiveFormsModule],
        componentProperties: { control: new FormControl('') },
      },
    );

    fixture.destroy();

    expect(() => fixture.destroy()).not.toThrow();
  });

  it('should track validation errors from form control', async () => {
    const control = new FormControl('', {
      validators: [
        ctrl => (!ctrl.value ? { required: true } : null),
        ctrl => (ctrl.value && ctrl.value.length < 3 ? { minlength: true } : null),
      ],
    });
    const { container, fixture } = await render(
      `<div ngpFormField>
        <input [formControl]="control" />
        <div id="req-error" ngpError ngpErrorValidator="required">Required</div>
        <div id="min-error" ngpError ngpErrorValidator="minlength">Min length</div>
      </div>`,
      {
        imports: [NgpFormField, ReactiveFormsModule, NgpError],
        componentProperties: { control },
      },
    );
    const requiredError = container.querySelector('#req-error');
    const minError = container.querySelector('#min-error');

    expect(requiredError).toHaveAttribute('data-validator', 'fail');
    expect(minError).toHaveAttribute('data-validator', 'pass');

    fixture.componentInstance.control.setValue('ab');
    fixture.detectChanges();

    expect(requiredError).toHaveAttribute('data-validator', 'pass');
    expect(minError).toHaveAttribute('data-validator', 'fail');

    fixture.componentInstance.control.setValue('valid');
    fixture.detectChanges();

    expect(requiredError).toHaveAttribute('data-validator', 'pass');
    expect(minError).toHaveAttribute('data-validator', 'pass');
  });

  it('should handle pending status for async validators', async () => {
    const asyncValidator = (control: any) => {
      return new Promise<{ async: boolean } | null>(resolve => {
        setTimeout(() => {
          resolve(control.value === 'invalid' ? { async: true } : null);
        }, 100);
      });
    };

    const control = new FormControl('', { asyncValidators: [asyncValidator] });
    const { container, fixture } = await render(
      `<div ngpFormField>
        <input [formControl]="control" />
      </div>`,
      {
        imports: [NgpFormField, ReactiveFormsModule],
        componentProperties: { control },
      },
    );
    const formField = container.querySelector('[ngpFormField]');

    fixture.componentInstance.control.setValue('test');
    fixture.detectChanges();

    expect(formField).toHaveAttribute('data-pending');

    await new Promise(resolve => setTimeout(resolve, 150));
    fixture.detectChanges();

    expect(formField).not.toHaveAttribute('data-pending');
  });

  it('should work without a form control', async () => {
    const { container } = await render(
      `<div ngpFormField>
        <input />
      </div>`,
      { imports: [NgpFormField] },
    );
    const formField = container.querySelector('[ngpFormField]');

    expect(formField).toBeInTheDocument();
    expect(formField).not.toHaveAttribute('data-invalid');
    expect(formField).not.toHaveAttribute('data-valid');
    expect(formField).not.toHaveAttribute('data-touched');
  });
});
