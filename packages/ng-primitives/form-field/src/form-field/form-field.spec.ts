import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { render } from '@testing-library/angular';
import { NgpDescription } from '../description/description';
import { NgpError } from '../error/error';
import { NgpFormControl } from '../form-control/form-control';
import { NgpLabel } from '../label/label';
import { NgpFormField } from './form-field';

describe('NgpFormField', () => {
  it('should initialise correctly', async () => {
    const { container } = await render(`<div ngpFormField></div>`, {
      imports: [NgpFormField],
    });

    const element = container.querySelector('[ngpFormField]');
    expect(element).toBeInTheDocument();
  });

  it('should track form control status with reactive forms', async () => {
    @Component({
      template: `
        <div ngpFormField>
          <input [formControl]="control" />
        </div>
      `,
      standalone: true,
      imports: [NgpFormField, ReactiveFormsModule],
    })
    class TestComponent {
      control = new FormControl('', { validators: [] });
    }

    const { fixture } = await render(TestComponent);
    const formField = fixture.debugElement.nativeElement.querySelector('[ngpFormField]');

    // Initially should be pristine, untouched, and valid
    expect(formField).toHaveAttribute('data-pristine');
    expect(formField).toHaveAttribute('data-valid');
    expect(formField).not.toHaveAttribute('data-touched');
    expect(formField).not.toHaveAttribute('data-dirty');
    expect(formField).not.toHaveAttribute('data-invalid');
  });

  it('should update status when form control is touched and dirty', async () => {
    @Component({
      template: `
        <div ngpFormField>
          <input [formControl]="control" />
        </div>
      `,
      standalone: true,
      imports: [NgpFormField, ReactiveFormsModule],
    })
    class TestComponent {
      control = new FormControl('');
    }

    const { fixture } = await render(TestComponent);
    const formField = fixture.debugElement.nativeElement.querySelector('[ngpFormField]');

    // Mark as touched and dirty
    fixture.componentInstance.control.markAsTouched();
    fixture.componentInstance.control.markAsDirty();
    fixture.detectChanges();

    expect(formField).toHaveAttribute('data-touched');
    expect(formField).toHaveAttribute('data-dirty');
    expect(formField).not.toHaveAttribute('data-pristine');
  });

  it('should show invalid status when form control has validation errors', async () => {
    @Component({
      template: `
        <div ngpFormField>
          <input [formControl]="control" />
        </div>
      `,
      standalone: true,
      imports: [NgpFormField, ReactiveFormsModule],
    })
    class TestComponent {
      control = new FormControl('', {
        validators: [control => (control.value ? null : { required: true })],
      });
    }

    const { fixture } = await render(TestComponent);
    const formField = fixture.debugElement.nativeElement.querySelector('[ngpFormField]');

    // Control should be invalid due to required validator
    expect(formField).toHaveAttribute('data-invalid');
    expect(formField).not.toHaveAttribute('data-valid');

    // Set a value to make it valid
    fixture.componentInstance.control.setValue('test');
    fixture.detectChanges();

    expect(formField).toHaveAttribute('data-valid');
    expect(formField).not.toHaveAttribute('data-invalid');
  });

  it('should show disabled status when form control is disabled', async () => {
    @Component({
      template: `
        <div ngpFormField>
          <input [formControl]="control" />
        </div>
      `,
      standalone: true,
      imports: [NgpFormField, ReactiveFormsModule],
    })
    class TestComponent {
      control = new FormControl({ value: '', disabled: true });
    }

    const { fixture } = await render(TestComponent);
    const formField = fixture.debugElement.nativeElement.querySelector('[ngpFormField]');

    expect(formField).toHaveAttribute('data-disabled');
  });

  it('should track labels registration and removal', async () => {
    @Component({
      template: `
        <div ngpFormField>
          <label id="label-1" *ngIf="showLabel1" ngpLabel>Label 1</label>
          <label id="label-2" *ngIf="showLabel2" ngpLabel>Label 2</label>
          <input ngpFormControl />
        </div>
      `,
      standalone: true,
      imports: [NgpFormField, NgpLabel, NgpFormControl, CommonModule],
    })
    class TestComponent {
      showLabel1 = true;
      showLabel2 = false;
    }

    const { fixture } = await render(TestComponent);
    const input = fixture.debugElement.nativeElement.querySelector('input');

    // Initially should have label-1
    expect(input).toHaveAttribute('aria-labelledby', 'label-1');

    // Add second label
    fixture.componentInstance.showLabel2 = true;
    fixture.detectChanges();

    expect(input).toHaveAttribute('aria-labelledby', 'label-1 label-2');

    // Remove first label
    fixture.componentInstance.showLabel1 = false;
    fixture.detectChanges();

    expect(input).toHaveAttribute('aria-labelledby', 'label-2');

    // Remove second label
    fixture.componentInstance.showLabel2 = false;
    fixture.detectChanges();

    expect(input).not.toHaveAttribute('aria-labelledby');
  });

  it('should track descriptions registration and removal', async () => {
    @Component({
      template: `
        <div ngpFormField>
          <div id="desc-1" *ngIf="showDesc1" ngpDescription>Description 1</div>
          <div id="desc-2" *ngIf="showDesc2" ngpDescription>Description 2</div>
          <input ngpFormControl />
        </div>
      `,
      standalone: true,
      imports: [NgpFormField, NgpDescription, NgpFormControl, CommonModule],
    })
    class TestComponent {
      showDesc1 = true;
      showDesc2 = false;
    }

    const { fixture } = await render(TestComponent);
    const input = fixture.debugElement.nativeElement.querySelector('input');

    // Initially should have desc-1
    expect(input).toHaveAttribute('aria-describedby', 'desc-1');

    // Add second description
    fixture.componentInstance.showDesc2 = true;
    fixture.detectChanges();

    expect(input).toHaveAttribute('aria-describedby', 'desc-1 desc-2');

    // Remove first description
    fixture.componentInstance.showDesc1 = false;
    fixture.detectChanges();

    expect(input).toHaveAttribute('aria-describedby', 'desc-2');

    // Remove second description
    fixture.componentInstance.showDesc2 = false;
    fixture.detectChanges();

    expect(input).not.toHaveAttribute('aria-describedby');
  });

  it('should track form control ID registration and removal', async () => {
    @Component({
      template: `
        <div ngpFormField>
          <label id="test-label" ngpLabel>Test Label</label>
          <input id="test-control" *ngIf="showControl" ngpFormControl />
        </div>
      `,
      standalone: true,
      imports: [NgpFormField, NgpLabel, NgpFormControl, CommonModule],
    })
    class TestComponent {
      showControl = false;
    }

    const { fixture } = await render(TestComponent);
    const label = fixture.debugElement.nativeElement.querySelector('label');

    // Initially no form control, so no "for" attribute
    expect(label).not.toHaveAttribute('for');

    // Add form control
    fixture.componentInstance.showControl = true;
    fixture.detectChanges();

    expect(label).toHaveAttribute('for', 'test-control');

    // Remove form control
    fixture.componentInstance.showControl = false;
    fixture.detectChanges();

    expect(label).not.toHaveAttribute('for');
  });

  it('should handle form control status subscription cleanup', async () => {
    @Component({
      template: `
        <div ngpFormField>
          <input [formControl]="control" />
        </div>
      `,
      standalone: true,
      imports: [NgpFormField, ReactiveFormsModule],
    })
    class TestComponent {
      control = new FormControl('');
    }

    const { fixture } = await render(TestComponent);

    // Destroy the component to trigger cleanup
    fixture.destroy();

    // Should not throw any errors during cleanup
    expect(() => fixture.destroy()).not.toThrow();
  });

  it('should track validation errors from form control', async () => {
    @Component({
      template: `
        <div ngpFormField>
          <input [formControl]="control" />
          <div id="req-error" ngpError ngpErrorValidator="required">Required</div>
          <div id="min-error" ngpError ngpErrorValidator="minlength">Min length</div>
        </div>
      `,
      standalone: true,
      imports: [NgpFormField, ReactiveFormsModule, NgpError],
    })
    class TestComponent {
      control = new FormControl('', {
        validators: [
          control => (!control.value ? { required: true } : null),
          control => (control.value && control.value.length < 3 ? { minlength: true } : null),
        ],
      });
    }

    const { fixture } = await render(TestComponent);
    const requiredError = fixture.debugElement.nativeElement.querySelector('#req-error');
    const minError = fixture.debugElement.nativeElement.querySelector('#min-error');

    // Initially should have required error
    expect(requiredError).toHaveAttribute('data-validator', 'fail');
    expect(minError).toHaveAttribute('data-validator', 'pass');

    // Set short value
    fixture.componentInstance.control.setValue('ab');
    fixture.detectChanges();

    expect(requiredError).toHaveAttribute('data-validator', 'pass');
    expect(minError).toHaveAttribute('data-validator', 'fail');

    // Set valid value
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

    @Component({
      template: `
        <div ngpFormField>
          <input [formControl]="control" />
        </div>
      `,
      standalone: true,
      imports: [NgpFormField, ReactiveFormsModule],
    })
    class TestComponent {
      control = new FormControl('', { asyncValidators: [asyncValidator] });
    }

    const { fixture } = await render(TestComponent);
    const formField = fixture.debugElement.nativeElement.querySelector('[ngpFormField]');

    // Set a value to trigger async validation
    fixture.componentInstance.control.setValue('test');
    fixture.detectChanges();

    // Should show pending status during async validation
    expect(formField).toHaveAttribute('data-pending');

    // Wait for async validation to complete
    await new Promise(resolve => setTimeout(resolve, 150));
    fixture.detectChanges();

    expect(formField).not.toHaveAttribute('data-pending');
  });

  it('should work without a form control', async () => {
    @Component({
      template: `
        <div ngpFormField>
          <input />
        </div>
      `,
      standalone: true,
      imports: [NgpFormField],
    })
    class TestComponent {}

    const { container } = await render(TestComponent);
    const formField = container.querySelector('[ngpFormField]');

    // Should not throw errors and should not have any status attributes
    expect(formField).toBeInTheDocument();
    expect(formField).not.toHaveAttribute('data-invalid');
    expect(formField).not.toHaveAttribute('data-valid');
    expect(formField).not.toHaveAttribute('data-touched');
  });
});
