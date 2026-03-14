import { Component } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { render } from '@testing-library/angular';
import { NgpDescription } from '../description/description';
import { NgpFormField } from '../form-field/form-field';
import { NgpLabel } from '../label/label';
import { NgpFormControl } from './form-control';

describe('NgpFormControl', () => {
  it('should initialise correctly', async () => {
    await render(`<div ngpFormControl></div>`, {
      imports: [NgpFormControl],
    });
  });

  describe('disabled attribute', () => {
    it('should not apply disabled attribute on div even if disabled is true', async () => {
      const { getByTestId } = await render(
        `<div ngpFormControl data-testid="control" [ngpFormControlDisabled]="true"></div>`,
        {
          imports: [NgpFormControl],
        },
      );
      const control = getByTestId('control');
      expect(control).not.toHaveAttribute('disabled');
    });

    it('should not apply disabled attribute on custom element even if disabled is true', async () => {
      const { getByTestId } = await render(
        `<custom-element ngpFormControl data-testid="control" [ngpFormControlDisabled]="true"></custom-element>`,
        {
          imports: [NgpFormControl],
        },
      );
      const control = getByTestId('control');
      expect(control).not.toHaveAttribute('disabled');
    });

    ['button', 'fieldset', 'optgroup', 'option', 'select', 'textarea', 'input'].forEach(element => {
      it(`should apply disabled attribute on <${element}> when disabled is true`, async () => {
        const markup =
          element === 'input'
            ? `<input ngpFormControl data-testid="control" [ngpFormControlDisabled]="true" />`
            : `<${element} ngpFormControl data-testid="control" [ngpFormControlDisabled]="true"></${element}>`;
        const { getByTestId } = await render(markup, {
          imports: [NgpFormControl],
        });
        const control = getByTestId('control');
        expect(control).toHaveAttribute('disabled');
      });

      it(`should not apply disabled attribute on <${element}> when disabled is false`, async () => {
        const markup =
          element === 'input'
            ? `<input ngpFormControl data-testid="control" [ngpFormControlDisabled]="false" />`
            : `<${element} ngpFormControl data-testid="control" [ngpFormControlDisabled]="false"></${element}>`;
        const { getByTestId } = await render(markup, {
          imports: [NgpFormControl],
        });
        const control = getByTestId('control');
        expect(control).not.toHaveAttribute('disabled');
      });

      it(`should not apply disabled attribute on <${element}> by default`, async () => {
        const markup =
          element === 'input'
            ? `<input ngpFormControl data-testid="control" />`
            : `<${element} ngpFormControl data-testid="control"></${element}>`;
        const { getByTestId } = await render(markup, {
          imports: [NgpFormControl],
        });
        const control = getByTestId('control');
        expect(control).not.toHaveAttribute('disabled');
      });
    });
  });

  describe('data attributes with NgModel', () => {
    it('should set data-pristine initially', async () => {
      const { getByTestId } = await render(
        `
        <input ngpFormControl data-testid="control" [(ngModel)]="value" />
      `,
        {
          imports: [NgpFormControl, FormsModule],
          componentProperties: { value: '' },
        },
      );
      const control = getByTestId('control');
      expect(control).toHaveAttribute('data-pristine');
    });

    it('should set data-disabled when disabled', async () => {
      const { getByTestId } = await render(
        `
        <input
          ngpFormControl
          data-testid="control"
          [(ngModel)]="value"
          [ngpFormControlDisabled]="true"
        />
      `,
        {
          imports: [NgpFormControl, FormsModule],
          componentProperties: { value: '' },
        },
      );
      const control = getByTestId('control');

      expect(control).toHaveAttribute('data-disabled');
    });
  });

  describe('data attributes with Reactive Forms', () => {
    it('should set data-pristine initially', async () => {
      const { getByTestId } = await render(
        `
        <input ngpFormControl data-testid="control" [formControl]="formControl" />
      `,
        {
          imports: [NgpFormControl, ReactiveFormsModule],
          componentProperties: { formControl: new FormControl('') },
        },
      );
      const control = getByTestId('control');
      expect(control).toHaveAttribute('data-pristine');
    });

    it('should set data-valid when form control is valid', async () => {
      const { getByTestId } = await render(
        `
        <input ngpFormControl data-testid="control" [formControl]="formControl" />
      `,
        {
          imports: [NgpFormControl, ReactiveFormsModule],
          componentProperties: { formControl: new FormControl('valid value') },
        },
      );
      const control = getByTestId('control');
      expect(control).toHaveAttribute('data-valid');
    });

    it('should set data-invalid when form control has validation errors', async () => {
      const formControl = new FormControl('', [Validators.required]);
      formControl.markAsTouched(); // Mark as touched to trigger validation display

      const { getByTestId } = await render(
        `
        <input ngpFormControl data-testid="control" [formControl]="formControl" />
      `,
        {
          imports: [NgpFormControl, ReactiveFormsModule],
          componentProperties: { formControl },
        },
      );
      const control = getByTestId('control');
      expect(control).toHaveAttribute('data-invalid');
      expect(control).not.toHaveAttribute('data-valid');
    });

    it('should set data-disabled when form control is disabled', async () => {
      const { getByTestId } = await render(
        `
        <input ngpFormControl data-testid="control" [formControl]="formControl" />
      `,
        {
          imports: [NgpFormControl, ReactiveFormsModule],
          componentProperties: { formControl: new FormControl({ value: '', disabled: true }) },
        },
      );
      const control = getByTestId('control');
      expect(control).toHaveAttribute('data-disabled');
    });
  });

  describe('form field integration', () => {
    it('should connect with form field labels and descriptions', async () => {
      @Component({
        template: `
          <div ngpFormField>
            <label id="test-label" ngpLabel>Name</label>
            <input id="test-input" ngpFormControl />
            <div id="test-desc" ngpDescription>Enter your name</div>
          </div>
        `,
        standalone: true,
        imports: [NgpFormField, NgpLabel, NgpFormControl, NgpDescription],
      })
      class TestComponent {}

      const { fixture } = await render(TestComponent);
      const input = fixture.debugElement.nativeElement.querySelector('input');

      expect(input).toHaveAttribute('aria-labelledby', 'test-label');
      expect(input).toHaveAttribute('aria-describedby', 'test-desc');
    });

    it('should register and unregister with form field', async () => {
      @Component({
        template: `
          <div #formField="ngpFormField" ngpFormField>
            @if (showInput) {
              <input id="test-control" ngpFormControl />
            }
          </div>
        `,
        standalone: true,
        imports: [NgpFormField, NgpFormControl],
      })
      class TestComponent {
        showInput = true;
      }

      const { fixture } = await render(TestComponent);
      const input = fixture.debugElement.nativeElement.querySelector('#test-control');

      // Initially the input should be present
      expect(input).toBeTruthy();

      // Remove input
      fixture.componentInstance.showInput = false;
      fixture.detectChanges();

      // Input should be removed from the DOM
      const removed = fixture.debugElement.nativeElement.querySelector('#test-control');
      expect(removed).toBeNull();
    });

    it('should handle multiple labels and descriptions', async () => {
      @Component({
        template: `
          <div ngpFormField>
            <label id="label-1" ngpLabel>First Label</label>
            <label id="label-2" ngpLabel>Second Label</label>
            <input ngpFormControl />
            <div id="desc-1" ngpDescription>First description</div>
            <div id="desc-2" ngpDescription>Second description</div>
          </div>
        `,
        standalone: true,
        imports: [NgpFormField, NgpLabel, NgpFormControl, NgpDescription],
      })
      class TestComponent {}

      const { fixture } = await render(TestComponent);
      const input = fixture.debugElement.nativeElement.querySelector('input');

      expect(input).toHaveAttribute('aria-labelledby', 'label-1 label-2');
      expect(input).toHaveAttribute('aria-describedby', 'desc-1 desc-2');
    });

    it('should work without a form field parent', async () => {
      const { container } = await render(`<input ngpFormControl />`, {
        imports: [NgpFormControl],
      });

      const input = container.querySelector('[ngpFormControl]');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('id');
      expect(input).not.toHaveAttribute('aria-labelledby');
      expect(input).not.toHaveAttribute('aria-describedby');
    });
  });

  describe('status signal', () => {
    it('should return correct status signal', async () => {
      @Component({
        template: `
          <div ngpFormField>
            <input
              #formControl="ngpFormControl"
              [ngpFormControlDisabled]="disabled"
              [formControl]="control"
              ngpFormControl
            />
          </div>
        `,
        standalone: true,
        imports: [NgpFormField, NgpFormControl, ReactiveFormsModule],
      })
      class TestComponent {
        disabled = false;
        control = new FormControl('');
      }

      const { fixture } = await render(TestComponent);
      const formControlRef = fixture.debugElement.children[0].children[0].references['formControl'];

      // Initial status
      let status = formControlRef.status();
      expect(status.valid).toBe(true);
      expect(status.disabled).toBe(false);
      expect(status.pristine).toBe(true);

      // Mark as touched and dirty
      fixture.componentInstance.control.markAsTouched();
      fixture.componentInstance.control.markAsDirty();
      fixture.detectChanges();

      status = formControlRef.status();
      expect(status.touched).toBe(true);
      expect(status.dirty).toBe(true);
      expect(status.pristine).toBe(false);

      // Disable via parent
      fixture.componentInstance.disabled = true;
      fixture.detectChanges();

      status = formControlRef.status();
      expect(status.disabled).toBe(true);
    });
  });

  describe('async validation', () => {
    it('should handle async validation status', async () => {
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
            <input [formControl]="control" ngpFormControl />
          </div>
        `,
        standalone: true,
        imports: [NgpFormField, NgpFormControl, ReactiveFormsModule],
      })
      class TestComponent {
        control = new FormControl('', { asyncValidators: [asyncValidator] });
      }

      const { fixture } = await render(TestComponent);
      const input = fixture.debugElement.nativeElement.querySelector('input');

      // Set value to trigger async validation
      fixture.componentInstance.control.setValue('test');
      fixture.detectChanges();

      // Should show pending status
      expect(input).toHaveAttribute('data-pending');

      // Wait for validation to complete
      await new Promise(resolve => setTimeout(resolve, 150));
      fixture.detectChanges();

      expect(input).not.toHaveAttribute('data-pending');
      expect(input).toHaveAttribute('data-valid');
    });
  });

  describe('combined disabled state', () => {
    it('should handle disabled status from both parent and form control', async () => {
      @Component({
        template: `
          <div ngpFormField>
            <input
              [ngpFormControlDisabled]="parentDisabled"
              [formControl]="control"
              ngpFormControl
            />
          </div>
        `,
        standalone: true,
        imports: [NgpFormField, NgpFormControl, ReactiveFormsModule],
      })
      class TestComponent {
        parentDisabled = false;
        control = new FormControl('');
      }

      const { fixture } = await render(TestComponent);
      const input = fixture.debugElement.nativeElement.querySelector('input');

      // Initially not disabled
      expect(input).not.toHaveAttribute('data-disabled');

      // Disable via parent
      fixture.componentInstance.parentDisabled = true;
      fixture.detectChanges();

      expect(input).toHaveAttribute('data-disabled');
      expect(input).toHaveAttribute('disabled');

      // Reset parent disabled and disable via form control
      fixture.componentInstance.parentDisabled = false;
      fixture.componentInstance.control.disable();
      fixture.detectChanges();

      expect(input).toHaveAttribute('data-disabled');
      expect(input).not.toHaveAttribute('disabled'); // Form control disabled doesn't add HTML disabled
    });
  });

  describe('id handling', () => {
    it('should generate unique ID when not provided', async () => {
      const { container } = await render(`<input ngpFormControl />`, {
        imports: [NgpFormControl],
      });

      const input = container.querySelector('[ngpFormControl]');
      expect(input).toHaveAttribute('id');
      expect(input?.getAttribute('id')).toMatch(/^ngp-form-control-\d+$/);
    });

    it('should use provided ID when specified', async () => {
      const { container } = await render(`<input ngpFormControl id="custom-id" />`, {
        imports: [NgpFormControl],
      });

      const input = container.querySelector('[ngpFormControl]');
      expect(input).toHaveAttribute('id', 'custom-id');
    });
  });
});
