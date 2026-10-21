import { Component } from '@angular/core';
import { render } from '@testing-library/angular';
import { NgpFormField, NgpLabel } from 'ng-primitives/form-field';
import { NgpInput } from 'ng-primitives/input';
import { describe, expect, it } from 'vitest';

@Component({
  selector: 'input[app-input]',
  hostDirectives: [{ directive: NgpInput, inputs: ['id', 'disabled'] }],
  template: '',
})
class ComposedInput {}

describe('NgpInput composition', () => {
  it('should apply a forwarded id and disabled state and use the id as the label target', async () => {
    const { container, fixture, rerender } = await render(
      `<div ngpFormField>
        <label id="label" ngpLabel>Name</label>
        <input app-input id="name" [disabled]="disabled" />
      </div>`,
      {
        imports: [NgpFormField, NgpLabel, ComposedInput],
        componentProperties: { disabled: false },
      },
    );
    const label = container.querySelector('label')!;
    const field = container.querySelector('input')!;

    expect(field).toHaveAttribute('id', 'name');
    expect(label).toHaveAttribute('for', 'name');
    expect(field).toHaveAttribute('aria-labelledby', 'label');
    expect(field).not.toHaveAttribute('disabled');

    await rerender({ componentProperties: { disabled: true } });
    await fixture.whenStable();

    expect(field).toHaveAttribute('disabled');
    expect(field).toHaveAttribute('data-disabled');
  });
});
