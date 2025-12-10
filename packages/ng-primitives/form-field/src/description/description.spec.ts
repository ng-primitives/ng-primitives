import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { render } from '@testing-library/angular';
import { NgpFormControl } from '../form-control/form-control';
import { NgpFormField } from '../form-field/form-field';
import { NgpDescription } from './description';

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
      {
        imports: [NgpDescription],
      },
    );

    const description = container.querySelector('[ngpDescription]');
    expect(description).toHaveAttribute('id', 'custom-description');
  });

  it('should register and unregister with form field', async () => {
    @Component({
      template: `
        <div #formField="ngpFormField" ngpFormField>
          @if (showDescription) {
            <div id="test-desc" ngpDescription>Test Description</div>
          }
          <input [formControl]="control" ngpFormControl />
        </div>
      `,
      imports: [NgpFormField, NgpDescription, NgpFormControl, ReactiveFormsModule, CommonModule],
    })
    class TestComponent {
      showDescription = true;
      control = new FormControl('');
    }

    const { fixture } = await render(TestComponent);
    const input = fixture.debugElement.nativeElement.querySelector('input');

    // Initially should be registered (via aria-describedby) and log attributes
    // debug
    // eslint-disable-next-line no-console
    console.log(
      'CLEANUP: input attrs',
      input.getAttributeNames().map((n: string) => [n, input.getAttribute(n)]),
    );
    // eslint-disable-next-line no-console
    console.log(
      'CLEANUP: desc attrs',
      fixture.debugElement.nativeElement.querySelector('[ngpDescription]').getAttributeNames(),
    );

    expect(input).toHaveAttribute('aria-describedby', 'test-desc');

    // Remove description
    fixture.componentInstance.showDescription = false;
    fixture.detectChanges();

    // Should be unregistered
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

    const { fixture } = await render(TestComponent);
    const description = fixture.debugElement.nativeElement.querySelector('[ngpDescription]');

    // Initially invalid
    expect(description).toHaveAttribute('data-invalid');
    expect(description).not.toHaveAttribute('data-valid');

    // Mark as touched
    fixture.componentInstance.control.markAsTouched();
    fixture.detectChanges();

    expect(description).toHaveAttribute('data-touched');

    // Set valid value via user-like input so the control becomes dirty
    const inputEl = fixture.debugElement.nativeElement.querySelector('input');
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

    const { fixture } = await render(TestComponent);
    const description = fixture.debugElement.nativeElement.querySelector('[ngpDescription]');

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

    const { fixture } = await render(TestComponent);
    const description = fixture.debugElement.nativeElement.querySelector('[ngpDescription]');

    // Set value to trigger async validation
    fixture.componentInstance.control.setValue('test');
    fixture.detectChanges();

    // Should show pending status
    expect(description).toHaveAttribute('data-pending');

    // Wait for validation to complete
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
    @Component({
      template: `
        <div #formField="ngpFormField" ngpFormField>
          <div id="desc-1" ngpDescription>First Description</div>
          <div id="desc-2" ngpDescription>Second Description</div>
          <input [formControl]="control" ngpFormControl />
        </div>
      `,
      imports: [NgpFormField, NgpDescription, ReactiveFormsModule, NgpFormControl],
    })
    class TestComponent {
      control = new FormControl('');
    }

    const { fixture } = await render(TestComponent);
    const input = fixture.debugElement.nativeElement.querySelector('input');

    expect(input).toHaveAttribute('aria-describedby', 'desc-1 desc-2');
  });

  it('should clean up properly on destroy', async () => {
    @Component({
      template: `
        <div #formField="ngpFormField" ngpFormField>
          @if (showDescription) {
            <div id="test-desc" ngpDescription>Test Description</div>
          }
          <input [formControl]="control" ngpFormControl />
        </div>
      `,
      imports: [NgpFormField, NgpDescription, NgpFormControl, ReactiveFormsModule],
    })
    class TestComponent {
      showDescription = true;
      control = new FormControl('');
    }

    const { fixture } = await render(TestComponent);
    const input = fixture.debugElement.nativeElement.querySelector('input');
    fixture.detectChanges();

    expect(input).toHaveAttribute('aria-describedby', 'test-desc');

    // Destroy component
    fixture.componentInstance.showDescription = false;
    fixture.detectChanges();

    expect(input).not.toHaveAttribute('aria-describedby');
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

    const { fixture } = await render(TestComponent);
    const description = fixture.debugElement.nativeElement.querySelector('[ngpDescription]');
    const inputEl = fixture.debugElement.nativeElement.querySelector('input');

    // Initially should be pristine and invalid
    expect(description).toHaveAttribute('data-pristine');
    expect(description).toHaveAttribute('data-invalid');
    expect(description).not.toHaveAttribute('data-dirty');
    expect(description).not.toHaveAttribute('data-valid');
    expect(description).not.toHaveAttribute('data-touched');

    // Set short value (still invalid) via user-like input and mark touched
    inputEl.value = 'ab';
    inputEl.dispatchEvent(new Event('input'));
    fixture.componentInstance.control.markAsTouched();
    fixture.detectChanges();

    expect(description).toHaveAttribute('data-dirty');
    expect(description).toHaveAttribute('data-touched');
    expect(description).toHaveAttribute('data-invalid');
    expect(description).not.toHaveAttribute('data-pristine');
    expect(description).not.toHaveAttribute('data-valid');

    // Set valid value via user-like input
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
