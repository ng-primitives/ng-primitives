import { Component, Directive, forwardRef, input } from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { render } from '@testing-library/angular';
import {
  NgpError,
  NgpFormControl,
  NgpFormField,
  NgpLabel,
  injectFormFieldState,
} from 'ng-primitives/form-field';
import { afterEach, describe, expect, it, vi } from 'vitest';

/**
 * Renders the control inside its own component, so the form field's content query cannot see it.
 */
@Component({
  selector: 'test-child-input',
  template: `
    <input [formControl]="control()" [id]="inputId()" ngpFormControl />
  `,
  imports: [ReactiveFormsModule, NgpFormControl],
})
class ChildInput {
  readonly control = input.required<FormControl>();
  readonly inputId = input.required<string>();
}

/**
 * Exposes the control the form field resolved, for assertions.
 */
@Directive({ selector: '[testFormFieldProbe]', exportAs: 'probe' })
class FormFieldProbe {
  readonly state = injectFormFieldState();
}

describe('NgpFormField with a control registered from a child component', () => {
  afterEach(() => vi.restoreAllMocks());

  it('reads the status and errors of a control rendered by a child component', async () => {
    @Component({
      template: `
        <div ngpFormField data-testid="field">
          <label ngpLabel>Name</label>
          <test-child-input [control]="control" inputId="name" />
          <div ngpError ngpErrorValidator="required" data-testid="error">Required</div>
        </div>
      `,
      imports: [NgpFormField, NgpLabel, NgpError, ChildInput],
    })
    class TestComponent {
      control = new FormControl('', [Validators.required]);
    }

    const { fixture, getByTestId } = await render(TestComponent);
    const field = getByTestId('field');

    expect(field).toHaveAttribute('data-invalid');
    expect(getByTestId('error')).toHaveAttribute('data-validator', 'fail');
    expect(field).not.toHaveAttribute('data-dirty');

    fixture.componentInstance.control.markAsDirty();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(field).toHaveAttribute('data-dirty');
  });

  it('exposes the registered control in the form field state', async () => {
    @Component({
      template: `
        <div #probe="probe" ngpFormField testFormFieldProbe>
          <test-child-input [control]="control" inputId="name" />
        </div>
      `,
      imports: [NgpFormField, FormFieldProbe, ChildInput],
    })
    class TestComponent {
      control = new FormControl('', [Validators.required]);
    }

    const { fixture } = await render(TestComponent);
    await fixture.whenStable();
    const probe = fixture.debugElement.children[0].injector.get(FormFieldProbe);

    expect(probe.state().ngControl()?.control).toBe(fixture.componentInstance.control);
  });

  it('follows the visible control when @if swaps the child component', async () => {
    @Component({
      template: `
        <div ngpFormField data-testid="field">
          <label ngpLabel data-testid="label">Value</label>
          @if (first) {
            <test-child-input [control]="required" inputId="first" />
          }
          @if (!first) {
            <test-child-input [control]="optional" inputId="second" />
          }
        </div>
      `,
      imports: [NgpFormField, NgpLabel, ChildInput],
    })
    class TestComponent {
      first = true;
      required = new FormControl('', [Validators.required]);
      optional = new FormControl('');
    }

    const { fixture, getByTestId } = await render(TestComponent);
    const swap = async (first: boolean) => {
      fixture.componentInstance.first = first;
      fixture.detectChanges();
      await fixture.whenStable();
    };

    expect(getByTestId('label')).toHaveAttribute('for', 'first');
    expect(getByTestId('field')).toHaveAttribute('data-invalid');

    await swap(false);
    expect(getByTestId('label')).toHaveAttribute('for', 'second');
    expect(getByTestId('field')).toHaveAttribute('data-valid');

    await swap(true);
    expect(getByTestId('label')).toHaveAttribute('for', 'first');
    expect(getByTestId('field')).toHaveAttribute('data-invalid');
  });

  it('falls back to the remaining control when the active one leaves', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    @Component({
      template: `
        <div ngpFormField data-testid="field">
          <label ngpLabel data-testid="label">Value</label>
          <test-child-input [control]="required" inputId="first" />
          @if (showSecond) {
            <test-child-input [control]="optional" inputId="second" />
          }
        </div>
      `,
      imports: [NgpFormField, NgpLabel, ChildInput],
    })
    class TestComponent {
      showSecond = true;
      required = new FormControl('', [Validators.required]);
      optional = new FormControl('');
    }

    const { fixture, getByTestId } = await render(TestComponent);
    await fixture.whenStable();

    fixture.componentInstance.showSecond = false;
    fixture.detectChanges();
    await fixture.whenStable();

    expect(getByTestId('label')).toHaveAttribute('for', 'first');
    expect(getByTestId('field')).toHaveAttribute('data-invalid');
  });

  it('prefers the control in its own template over a control registered from inside it', async () => {
    /**
     * A custom control that renders an inner input bound to its own proxy control without
     * validators. The form field must keep reading the outer control.
     */
    @Component({
      selector: 'test-proxy-input',
      template: `
        <input [formControl]="proxy" ngpFormControl />
      `,
      imports: [ReactiveFormsModule, NgpFormControl],
      providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ProxyInput), multi: true },
      ],
    })
    class ProxyInput implements ControlValueAccessor {
      readonly proxy = new FormControl('');
      writeValue(value: string): void {
        this.proxy.setValue(value, { emitEvent: false });
      }
      registerOnChange(fn: (value: string) => void): void {
        this.proxy.valueChanges.subscribe(fn);
      }
      registerOnTouched(): void {
        // Touch state is not under test.
      }
    }

    @Component({
      template: `
        <div ngpFormField data-testid="field">
          <test-proxy-input [formControl]="control" />
        </div>
      `,
      imports: [NgpFormField, ProxyInput, ReactiveFormsModule],
    })
    class TestComponent {
      control = new FormControl('', [Validators.required]);
    }

    const { fixture, getByTestId } = await render(TestComponent);
    await fixture.whenStable();

    expect(getByTestId('field')).toHaveAttribute('data-invalid');
  });

  it('warns in dev mode when a second control registers with the same form field', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    @Component({
      template: `
        <div ngpFormField>
          <test-child-input [control]="first" inputId="first" />
          <test-child-input [control]="second" inputId="second" />
        </div>
      `,
      imports: [NgpFormField, ChildInput],
    })
    class TestComponent {
      first = new FormControl('');
      second = new FormControl('');
    }

    const { fixture } = await render(TestComponent);
    await fixture.whenStable();

    expect(warn).toHaveBeenCalledWith(expect.stringContaining('[ngpFormField]'));
  });

  it('does not warn for a single control', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    @Component({
      template: `
        <div ngpFormField>
          <test-child-input [control]="control" inputId="only" />
        </div>
      `,
      imports: [NgpFormField, ChildInput],
    })
    class TestComponent {
      control = new FormControl('');
    }

    const { fixture } = await render(TestComponent);
    await fixture.whenStable();

    expect(warn).not.toHaveBeenCalledWith(expect.stringContaining('[ngpFormField]'));
  });
});
