import { Component, computed, Directive, effect, input } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { render } from '@testing-library/angular';
import {
  injectFormFieldState,
  injectLabelState,
  NgpDescription,
  NgpFormControl,
  NgpFormField,
  NgpLabel,
  provideFormFieldState,
} from 'ng-primitives/form-field';
import { describe, expect, it } from 'vitest';

@Directive({
  selector: '[appFieldContainer]',
  hostDirectives: [NgpFormField],
})
class FieldContainer {}

/**
 * A field whose label and description live in its own view while the control
 * is projected by the consumer.
 */
@Component({
  selector: 'app-field',
  hostDirectives: [FieldContainer],
  imports: [NgpLabel, NgpDescription],
  template: `
    <label id="field-label" ngpLabel>{{ label() }}</label>
    <ng-content />
    @if (hint()) {
      <span id="field-hint" ngpDescription>{{ hint() }}</span>
    }
  `,
})
class Field {
  readonly label = input('');
  readonly hint = input<string>();
}

@Directive({
  selector: '[appIsolatedField]',
  hostDirectives: [NgpFormField],
  providers: [provideFormFieldState({ inherit: false })],
})
class IsolatedField {}

@Directive({
  selector: '[appIsolatedScope]',
  providers: [provideFormFieldState({ inherit: false })],
})
class IsolatedScope {}

@Directive({
  selector: 'label[appLabel]',
  hostDirectives: [{ directive: NgpLabel, inputs: ['id'] }],
  host: { '[attr.data-for]': 'labelState().htmlFor()' },
})
class ComposedLabel {
  protected readonly labelState = injectLabelState();
}

@Component({
  selector: 'app-combobox',
  hostDirectives: [NgpFormControl],
  host: { role: 'combobox', tabindex: '0' },
  template: '',
})
class ComposedCombobox {}

/**
 * A control that registers itself with the form field by hand because the
 * labelled element is inside its own view rather than its host.
 */
@Component({
  selector: 'app-custom-control',
  template: `
    <div
      [id]="controlId()"
      [attr.aria-labelledby]="labelledBy()"
      [attr.aria-describedby]="describedBy()"
      role="textbox"
      tabindex="0"
    ></div>
  `,
})
class ManuallyRegisteredControl {
  readonly controlId = input.required<string>();
  private readonly formField = injectFormFieldState({ optional: true });

  protected readonly labelledBy = computed(() => this.formField()?.labels().join(' ') || null);
  protected readonly describedBy = computed(
    () => this.formField()?.descriptions().join(' ') || null,
  );

  constructor() {
    effect(onCleanup => {
      const formField = this.formField();
      if (!formField) {
        return;
      }
      formField.setFormControl(this.controlId());
      onCleanup(() => formField.removeFormControl());
    });
  }
}

describe('NgpFormField composition', () => {
  it('should wire a projected control to labels and descriptions rendered in the host component view', async () => {
    const control = new FormControl('', [Validators.required]);
    const { container, fixture } = await render(
      `<app-field label="Name" hint="Your full name">
        <input id="name" [formControl]="control" ngpFormControl />
      </app-field>`,
      {
        imports: [Field, NgpFormControl, ReactiveFormsModule],
        componentProperties: { control },
      },
    );
    const field = container.querySelector('app-field')!;
    const label = container.querySelector('label')!;
    const input = container.querySelector('input')!;

    expect(label).toHaveAttribute('for', 'name');
    expect(input).toHaveAttribute('aria-labelledby', 'field-label');
    expect(input).toHaveAttribute('aria-describedby', 'field-hint');
    expect(field).toHaveAttribute('data-invalid');
    expect(field).not.toHaveAttribute('data-touched');

    control.setValue('Ada');
    control.markAsTouched();
    control.markAsDirty();
    await fixture.whenStable();

    expect(field).toHaveAttribute('data-valid');
    expect(field).toHaveAttribute('data-touched');
    expect(field).toHaveAttribute('data-dirty', '');
  });

  it('should keep a nested field with an isolated state from taking over the outer field', async () => {
    const { getByTestId } = await render(
      `<div ngpFormField>
        <label data-testid="outer-label" id="outer-label" ngpLabel>Outer</label>
        <input data-testid="outer-control" id="outer-control" ngpFormControl />
        <div appIsolatedField>
          <label data-testid="inner-label" id="inner-label" ngpLabel>Inner</label>
          <input data-testid="inner-control" id="inner-control" ngpFormControl />
        </div>
      </div>`,
      { imports: [NgpFormField, IsolatedField, NgpLabel, NgpFormControl] },
    );

    expect(getByTestId('outer-label')).toHaveAttribute('for', 'outer-control');
    expect(getByTestId('outer-control')).toHaveAttribute('aria-labelledby', 'outer-label');
    expect(getByTestId('inner-label')).toHaveAttribute('for', 'inner-control');
    expect(getByTestId('inner-control')).toHaveAttribute('aria-labelledby', 'inner-label');
  });

  it('should not register controls inside an isolated scope with the surrounding field', async () => {
    const { getByTestId } = await render(
      `<div ngpFormField>
        <label data-testid="label" id="label" ngpLabel>Label</label>
        <input data-testid="control" id="control" ngpFormControl />
        <div appIsolatedScope>
          <input data-testid="scoped-control" id="scoped-control" ngpFormControl />
        </div>
      </div>`,
      { imports: [NgpFormField, IsolatedScope, NgpLabel, NgpFormControl] },
    );

    expect(getByTestId('label')).toHaveAttribute('for', 'control');
    expect(getByTestId('scoped-control')).not.toHaveAttribute('aria-labelledby');
  });

  it('should forward an id to a label composed as a host directive and expose its resolved for', async () => {
    const { container } = await render(
      `<div ngpFormField>
        <label appLabel id="custom-label">Name</label>
        <input id="name" ngpFormControl />
      </div>`,
      { imports: [NgpFormField, ComposedLabel, NgpFormControl] },
    );
    const label = container.querySelector('label')!;

    expect(label).toHaveAttribute('id', 'custom-label');
    expect(label).toHaveAttribute('for', 'name');
    expect(label).toHaveAttribute('data-for', 'name');
    expect(container.querySelector('input')).toHaveAttribute('aria-labelledby', 'custom-label');
  });

  it('should label a non-form element that composes the form control as a host directive', async () => {
    const { container } = await render(
      `<div ngpFormField>
        <label id="label" ngpLabel>Field</label>
        <app-combobox />
      </div>`,
      { imports: [NgpFormField, NgpLabel, ComposedCombobox] },
    );
    const combobox = container.querySelector('app-combobox')!;

    expect(combobox.id).toMatch(/^ngp-form-control-/);
    expect(container.querySelector('label')).toHaveAttribute('for', combobox.id);
    expect(combobox).toHaveAttribute('aria-labelledby', 'label');
    expect(combobox).not.toHaveAttribute('disabled');
  });

  it('should let a control register its id manually and read labels and descriptions from the injected state', async () => {
    const { container, fixture, rerender } = await render(
      `<div ngpFormField>
        <label id="label" ngpLabel>Field</label>
        @if (show) {
          <app-custom-control controlId="surface" />
        }
        <span id="hint" ngpDescription>Hint</span>
      </div>`,
      {
        imports: [NgpFormField, NgpLabel, NgpDescription, ManuallyRegisteredControl],
        componentProperties: { show: true },
      },
    );
    await fixture.whenStable();
    const label = container.querySelector('label')!;
    const surface = container.querySelector('[role="textbox"]')!;

    expect(label).toHaveAttribute('for', 'surface');
    expect(surface).toHaveAttribute('aria-labelledby', 'label');
    expect(surface).toHaveAttribute('aria-describedby', 'hint');

    await rerender({ componentProperties: { show: false } });
    await fixture.whenStable();

    expect(label).not.toHaveAttribute('for');
  });

  it('should provide no form field state to a control outside of a form field', async () => {
    const { container } = await render(`<app-custom-control controlId="surface" />`, {
      imports: [ManuallyRegisteredControl],
    });
    const surface = container.querySelector('[role="textbox"]')!;

    expect(surface).not.toHaveAttribute('aria-labelledby');
    expect(surface).not.toHaveAttribute('aria-describedby');
  });
});
