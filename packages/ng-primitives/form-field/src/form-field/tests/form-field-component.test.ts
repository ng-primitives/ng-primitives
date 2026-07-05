import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { render } from '@testing-library/angular';
import {
  NgpDescription,
  NgpError,
  NgpFormControl,
  NgpFormField,
  NgpLabel,
} from 'ng-primitives/form-field';
import { describe, expect, it } from 'vitest';

/**
 * Inline fixture mirroring
 * `apps/components/.../reusable-components/form-field/form-field.ts`.
 * It is a thin wrapper that applies `NgpFormField` as a host directive and
 * projects its content, so labels, controls, descriptions and errors placed
 * inside it are wired together for accessibility.
 */
@Component({
  selector: 'app-form-field',
  hostDirectives: [NgpFormField],
  template: `
    <ng-content />
  `,
})
class FormField {}

describe('FormField (reusable component) — standalone', () => {
  it('renders and projects its content', async () => {
    const { container } = await render(
      `<app-form-field>
        <label ngpLabel>Username</label>
        <input ngpFormControl />
      </app-form-field>`,
      { imports: [FormField, NgpLabel, NgpFormControl] },
    );

    expect(container.querySelector('app-form-field')).toBeInTheDocument();
    expect(container.querySelector('label')).toHaveTextContent('Username');
    expect(container.querySelector('input')).toBeInTheDocument();
  });

  it('wires the label to the control via for/aria-labelledby', async () => {
    const { container } = await render(
      `<app-form-field>
        <label id="username-label" ngpLabel>Username</label>
        <input id="username" ngpFormControl />
      </app-form-field>`,
      { imports: [FormField, NgpLabel, NgpFormControl] },
    );
    const label = container.querySelector('label');
    const input = container.querySelector('input');

    expect(label).toHaveAttribute('for', 'username');
    expect(input).toHaveAttribute('aria-labelledby', 'username-label');
  });

  it('wires descriptions into aria-describedby', async () => {
    const { container } = await render(
      `<app-form-field>
        <label ngpLabel>Username</label>
        <input ngpFormControl />
        <div id="hint" ngpDescription>Pick something memorable</div>
      </app-form-field>`,
      { imports: [FormField, NgpLabel, NgpFormControl, NgpDescription] },
    );

    expect(container.querySelector('input')).toHaveAttribute('aria-describedby', 'hint');
  });

  it('reflects validity as data attributes and aria-invalid', async () => {
    @Component({
      template: `
        <app-form-field>
          <label ngpLabel>Username</label>
          <input [formControl]="control" ngpFormControl />
          <div id="required" ngpError ngpErrorValidator="required">Required</div>
        </app-form-field>
      `,
      imports: [FormField, NgpLabel, NgpFormControl, NgpError, ReactiveFormsModule],
    })
    class Host {
      readonly control = new FormControl('', [Validators.required]);
    }

    const { container, fixture } = await render(Host);
    const formField = container.querySelector('app-form-field');
    const input = container.querySelector('input');

    expect(formField).toHaveAttribute('data-invalid');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', 'required');

    fixture.componentInstance.control.setValue('ada');
    await fixture.whenStable();

    expect(formField).toHaveAttribute('data-valid');
    expect(input).not.toHaveAttribute('aria-invalid');
    expect(input).not.toHaveAttribute('aria-describedby');
  });

  it('reflects the disabled state onto the wrapper and projected parts', async () => {
    @Component({
      template: `
        <app-form-field>
          <label ngpLabel>Username</label>
          <input [formControl]="control" ngpFormControl />
          <div ngpDescription>Hint</div>
        </app-form-field>
      `,
      imports: [FormField, NgpLabel, NgpFormControl, NgpDescription, ReactiveFormsModule],
    })
    class Host {
      readonly control = new FormControl({ value: '', disabled: true });
    }

    const { container } = await render(Host);

    expect(container.querySelector('app-form-field')).toHaveAttribute('data-disabled');
    expect(container.querySelector('label')).toHaveAttribute('data-disabled');
    expect(container.querySelector('input')).toHaveAttribute('data-disabled');
    expect(container.querySelector('[ngpDescription]')).toHaveAttribute('data-disabled');
  });
});
