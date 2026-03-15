import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { fireEvent, render } from '@testing-library/angular';
import { NgpFormControl } from '../form-control/form-control';
import { NgpFormField } from '../form-field/form-field';
import { NgpLabel } from './label';

describe('NgpLabel', () => {
  it('should initialize with correct attributes', async () => {
    const { container } = await render(`<label ngpLabel>Test Label</label>`, {
      imports: [NgpLabel],
    });

    const label = container.querySelector('[ngpLabel]');
    expect(label).toBeInTheDocument();
    expect(label).toHaveAttribute('id');
    expect(label?.getAttribute('id')).toMatch(/^ngp-label-\d+$/);
  });

  it('should use provided ID when specified', async () => {
    const { container } = await render(`<label ngpLabel id="custom-label">Test Label</label>`, {
      imports: [NgpLabel],
    });

    const label = container.querySelector('[ngpLabel]');
    expect(label).toHaveAttribute('id', 'custom-label');
  });

  it('should register and unregister with form field', async () => {
    @Component({
      template: `
        <div ngpFormField>
          @if (showLabel) {
            <label [id]="labelId" ngpLabel>Test Label</label>
          }
          <input ngpFormControl />
        </div>
      `,
      imports: [NgpFormField, NgpLabel, NgpFormControl, CommonModule],
    })
    class TestComponent {
      showLabel = true;
      labelId = 'test-label';
    }

    const { fixture } = await render(TestComponent);
    const input = fixture.debugElement.nativeElement.querySelector('input');

    // Initially should be registered - input should have aria-labelledby
    expect(input).toHaveAttribute('aria-labelledby', 'test-label');

    // Remove label
    fixture.componentInstance.showLabel = false;
    fixture.detectChanges();

    // Should be unregistered - input should not have aria-labelledby
    expect(input).not.toHaveAttribute('aria-labelledby');
  });

  it('should reflect form field status in data attributes', async () => {
    @Component({
      template: `
        <div ngpFormField>
          <label ngpLabel>Test Label</label>
          <input [formControl]="control" ngpFormControl />
        </div>
      `,
      imports: [NgpFormField, NgpLabel, NgpFormControl, ReactiveFormsModule],
    })
    class TestComponent {
      control = new FormControl('', {
        validators: [control => (control.value ? null : { required: true })],
      });
    }

    const { fixture } = await render(TestComponent);
    const label = fixture.debugElement.nativeElement.querySelector('[ngpLabel]');

    // Initially invalid
    expect(label).toHaveAttribute('data-invalid');
    expect(label).not.toHaveAttribute('data-valid');

    // Mark as touched
    fixture.componentInstance.control.markAsTouched();
    fixture.detectChanges();

    expect(label).toHaveAttribute('data-touched');

    // Set valid value via user-like input so the control becomes dirty
    const inputEl = fixture.debugElement.nativeElement.querySelector('input');
    inputEl.value = 'test';
    inputEl.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(label).toHaveAttribute('data-valid');
    expect(label).toHaveAttribute('data-dirty');
    expect(label).not.toHaveAttribute('data-invalid');
    expect(label).not.toHaveAttribute('data-pristine');
  });

  it('should show disabled status when form control is disabled', async () => {
    @Component({
      template: `
        <div ngpFormField>
          <label ngpLabel>Test Label</label>
          <input [formControl]="control" />
        </div>
      `,
      imports: [NgpFormField, NgpLabel, ReactiveFormsModule],
    })
    class TestComponent {
      control = new FormControl({ value: '', disabled: true });
    }

    const { fixture } = await render(TestComponent);
    const label = fixture.debugElement.nativeElement.querySelector('[ngpLabel]');

    expect(label).toHaveAttribute('data-disabled');
  });

  it('should set htmlFor attribute to form control ID when in form field', async () => {
    @Component({
      template: `
        <div ngpFormField>
          <label id="test-label" ngpLabel>Test Label</label>
          <input id="test-control" ngpFormControl />
        </div>
      `,
      imports: [NgpFormField, NgpLabel, NgpFormControl],
    })
    class TestComponent {}

    const { fixture } = await render(TestComponent);
    const label = fixture.debugElement.nativeElement.querySelector('label');

    expect(label).toHaveAttribute('for', 'test-control');
  });

  it('should not set htmlFor attribute when no form control is present', async () => {
    @Component({
      template: `
        <div ngpFormField>
          <label ngpLabel>Test Label</label>
        </div>
      `,
      imports: [NgpFormField, NgpLabel, CommonModule],
    })
    class TestComponent {}

    const { fixture } = await render(TestComponent);
    const label = fixture.debugElement.nativeElement.querySelector('label');

    expect(label).not.toHaveAttribute('for');
  });

  it('should handle click events on HTML label elements', async () => {
    @Component({
      template: `
        <div ngpFormField>
          <label id="test-label" ngpLabel>Test Label</label>
          <input id="test-control" ngpFormControl />
        </div>
      `,
      imports: [NgpFormField, NgpLabel, NgpFormControl],
    })
    class TestComponent {}

    const { fixture } = await render(TestComponent);
    const label = fixture.debugElement.nativeElement.querySelector('label');
    const input = fixture.debugElement.nativeElement.querySelector('input');

    const focusSpy = jest.fn();
    input.focus = focusSpy;

    // Click label
    fireEvent.click(label);

    expect(focusSpy).toHaveBeenCalledWith({ preventScroll: true });
  });

  it('should handle click events for checkbox inputs', async () => {
    @Component({
      template: `
        <div ngpFormField>
          <label id="test-label" ngpLabel>Test Label</label>
          <input id="test-control" ngpFormControl type="checkbox" />
        </div>
      `,
      imports: [NgpFormField, NgpLabel, NgpFormControl],
    })
    class TestComponent {}

    const { fixture } = await render(TestComponent);
    const label = fixture.debugElement.nativeElement.querySelector('label');
    const input = fixture.debugElement.nativeElement.querySelector('input');

    const clickSpy = jest.fn();
    const focusSpy = jest.fn();
    input.click = clickSpy;
    input.focus = focusSpy;

    // Click label
    fireEvent.click(label);

    expect(clickSpy).toHaveBeenCalled();
    expect(focusSpy).toHaveBeenCalledWith({ preventScroll: true });
  });

  it('should handle click events for radio inputs', async () => {
    @Component({
      template: `
        <div ngpFormField>
          <label id="test-label" ngpLabel>Test Label</label>
          <input id="test-control" ngpFormControl type="radio" />
        </div>
      `,
      imports: [NgpFormField, NgpLabel, NgpFormControl],
    })
    class TestComponent {}

    const { fixture } = await render(TestComponent);
    const label = fixture.debugElement.nativeElement.querySelector('label');
    const input = fixture.debugElement.nativeElement.querySelector('input');

    const clickSpy = jest.fn();
    const focusSpy = jest.fn();
    input.click = clickSpy;
    input.focus = focusSpy;

    // Click label
    fireEvent.click(label);

    expect(clickSpy).toHaveBeenCalled();
    expect(focusSpy).toHaveBeenCalledWith({ preventScroll: true });
  });

  it('should handle click events for elements with role="checkbox"', async () => {
    @Component({
      template: `
        <div ngpFormField>
          <label id="test-label" ngpLabel>Test Label</label>
          <div id="test-control" ngpFormControl role="checkbox" aria-checked="false"></div>
        </div>
      `,
      imports: [NgpFormField, NgpLabel, NgpFormControl],
    })
    class TestComponent {}

    const { fixture } = await render(TestComponent);
    const label = fixture.debugElement.nativeElement.querySelector('label');
    const control = fixture.debugElement.nativeElement.querySelector('[role="checkbox"]');

    const clickSpy = jest.fn();
    const focusSpy = jest.fn();
    control.click = clickSpy;
    control.focus = focusSpy;

    // Click label
    fireEvent.click(label);

    expect(clickSpy).toHaveBeenCalled();
    expect(focusSpy).toHaveBeenCalledWith({ preventScroll: true });
  });

  it('should not trigger click on aria-disabled elements', async () => {
    @Component({
      template: `
        <div ngpFormField>
          <label id="test-label" ngpLabel>Test Label</label>
          <div id="test-control" ngpFormControl aria-disabled="true"></div>
        </div>
      `,
      imports: [NgpFormField, NgpLabel, NgpFormControl],
    })
    class TestComponent {}

    const { fixture } = await render(TestComponent);
    const label = fixture.debugElement.nativeElement.querySelector('label');
    const control = fixture.debugElement.nativeElement.querySelector('[aria-disabled]');

    const clickSpy = jest.fn();
    const focusSpy = jest.fn();
    control.click = clickSpy;
    control.focus = focusSpy;

    // Click label
    fireEvent.click(label);

    expect(clickSpy).not.toHaveBeenCalled();
    expect(focusSpy).not.toHaveBeenCalled();
  });

  it('should work without a form field parent', async () => {
    const { container } = await render(`<label ngpLabel>Standalone Label</label>`, {
      imports: [NgpLabel],
    });

    const label = container.querySelector('[ngpLabel]');
    expect(label).toBeInTheDocument();
    expect(label).toHaveAttribute('id');
    expect(label).not.toHaveAttribute('for');
    expect(label).not.toHaveAttribute('data-invalid');
    expect(label).not.toHaveAttribute('data-valid');
  });

  it('should handle click when target element is not found', async () => {
    @Component({
      template: `
        <div ngpFormField>
          <label id="test-label" ngpLabel>Test Label</label>
        </div>
      `,
      imports: [NgpFormField, NgpLabel, CommonModule],
    })
    class TestComponent {}

    const { fixture } = await render(TestComponent);
    const label = fixture.debugElement.nativeElement.querySelector('label');

    // Should not throw error when clicking without target
    expect(() => {
      fireEvent.click(label);
    }).not.toThrow();
  });
});
