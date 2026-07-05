import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { fireEvent, render } from '@testing-library/angular';
import { NgpFormControl, NgpFormField, NgpLabel } from 'ng-primitives/form-field';
import { describe, expect, it, vi } from 'vitest';

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

  it('should register with form field when label is present', async () => {
    const { container } = await render(
      `<div ngpFormField>
        <label id="test-label" ngpLabel>Test Label</label>
        <input ngpFormControl />
      </div>`,
      { imports: [NgpFormField, NgpLabel, NgpFormControl] },
    );

    const input = container.querySelector('input');
    expect(input).toHaveAttribute('aria-labelledby', 'test-label');
  });

  it('should unregister from form field when label is removed', async () => {
    const { container, rerender, fixture } = await render(
      `<div ngpFormField>
        @if (showLabel) {
          <label id="test-label" ngpLabel>Test Label</label>
        }
        <input ngpFormControl />
      </div>`,
      {
        imports: [NgpFormField, NgpLabel, NgpFormControl],
        componentProperties: { showLabel: true },
      },
    );

    const input = container.querySelector('input');
    expect(input).toHaveAttribute('aria-labelledby', 'test-label');

    await rerender({ componentProperties: { showLabel: false } });
    fixture.detectChanges();
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

    const { fixture, container } = await render(TestComponent);
    const label = container.querySelector('[ngpLabel]');

    expect(label).toHaveAttribute('data-invalid');
    expect(label).not.toHaveAttribute('data-valid');

    fixture.componentInstance.control.markAsTouched();
    fixture.detectChanges();

    expect(label).toHaveAttribute('data-touched');

    const inputEl = container.querySelector('input')!;
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

    const { container } = await render(TestComponent);
    const label = container.querySelector('[ngpLabel]');
    expect(label).toHaveAttribute('data-disabled');
  });

  it('should set htmlFor attribute to form control ID when in form field', async () => {
    const { container } = await render(
      `<div ngpFormField>
        <label id="test-label" ngpLabel>Test Label</label>
        <input id="test-control" ngpFormControl />
      </div>`,
      { imports: [NgpFormField, NgpLabel, NgpFormControl] },
    );

    const label = container.querySelector('label');
    expect(label).toHaveAttribute('for', 'test-control');
  });

  it('should not set htmlFor attribute when no form control is present', async () => {
    const { container } = await render(
      `<div ngpFormField>
        <label ngpLabel>Test Label</label>
      </div>`,
      { imports: [NgpFormField, NgpLabel] },
    );

    const label = container.querySelector('label');
    expect(label).not.toHaveAttribute('for');
  });

  it('should handle click events on HTML label elements', async () => {
    const { container } = await render(
      `<div ngpFormField>
        <label id="test-label" ngpLabel>Test Label</label>
        <input id="test-control" ngpFormControl />
      </div>`,
      { imports: [NgpFormField, NgpLabel, NgpFormControl] },
    );

    const label = container.querySelector('label')!;
    const input = container.querySelector('input')!;

    const focusSpy = vi.spyOn(input, 'focus').mockImplementation(() => {});

    fireEvent.click(label);

    expect(focusSpy).toHaveBeenCalledWith({ preventScroll: true });
  });

  it('should handle click events for checkbox inputs', async () => {
    const { container } = await render(
      `<div ngpFormField>
        <label id="test-label" ngpLabel>Test Label</label>
        <input id="test-control" ngpFormControl type="checkbox" />
      </div>`,
      { imports: [NgpFormField, NgpLabel, NgpFormControl] },
    );

    const label = container.querySelector('label')!;
    const input = container.querySelector('input')!;

    const clickSpy = vi.spyOn(input, 'click').mockImplementation(() => {});
    const focusSpy = vi.spyOn(input, 'focus').mockImplementation(() => {});

    fireEvent.click(label);

    expect(clickSpy).toHaveBeenCalled();
    expect(focusSpy).toHaveBeenCalledWith({ preventScroll: true });
  });

  it('should handle click events for radio inputs', async () => {
    const { container } = await render(
      `<div ngpFormField>
        <label id="test-label" ngpLabel>Test Label</label>
        <input id="test-control" ngpFormControl type="radio" />
      </div>`,
      { imports: [NgpFormField, NgpLabel, NgpFormControl] },
    );

    const label = container.querySelector('label')!;
    const input = container.querySelector('input')!;

    const clickSpy = vi.spyOn(input, 'click').mockImplementation(() => {});
    const focusSpy = vi.spyOn(input, 'focus').mockImplementation(() => {});

    fireEvent.click(label);

    expect(clickSpy).toHaveBeenCalled();
    expect(focusSpy).toHaveBeenCalledWith({ preventScroll: true });
  });

  it('should handle click events for elements with role="checkbox"', async () => {
    const { container } = await render(
      `<div ngpFormField>
        <label id="test-label" ngpLabel>Test Label</label>
        <div id="test-control" ngpFormControl role="checkbox" aria-checked="false"></div>
      </div>`,
      { imports: [NgpFormField, NgpLabel, NgpFormControl] },
    );

    const label = container.querySelector('label')!;
    const control = container.querySelector('[role="checkbox"]') as HTMLElement;

    const clickSpy = vi.spyOn(control, 'click').mockImplementation(() => {});
    const focusSpy = vi.spyOn(control, 'focus').mockImplementation(() => {});

    fireEvent.click(label);

    expect(clickSpy).toHaveBeenCalled();
    expect(focusSpy).toHaveBeenCalledWith({ preventScroll: true });
  });

  it('should not trigger click on aria-disabled elements', async () => {
    const { container } = await render(
      `<div ngpFormField>
        <label id="test-label" ngpLabel>Test Label</label>
        <div id="test-control" ngpFormControl aria-disabled="true"></div>
      </div>`,
      { imports: [NgpFormField, NgpLabel, NgpFormControl] },
    );

    const label = container.querySelector('label')!;
    const control = container.querySelector('[aria-disabled]') as HTMLElement;

    const clickSpy = vi.spyOn(control, 'click').mockImplementation(() => {});
    const focusSpy = vi.spyOn(control, 'focus').mockImplementation(() => {});

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
    const { container } = await render(
      `<div ngpFormField>
        <label id="test-label" ngpLabel>Test Label</label>
      </div>`,
      { imports: [NgpFormField, NgpLabel] },
    );

    const label = container.querySelector('label')!;

    expect(() => {
      fireEvent.click(label);
    }).not.toThrow();
  });
});
