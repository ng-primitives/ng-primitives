import { fireEvent, render } from '@testing-library/angular';
import { NgpCheckbox } from 'ng-primitives/checkbox';
import { NgpCheckboxGroup } from 'ng-primitives/checkbox-group';
import { describe, expect, it, vi } from 'vitest';

describe('NgpCheckboxGroup', () => {
  it('uses defaultValue to check matching checkbox values', async () => {
    const { getAllByRole } = await render(
      `<div ngpCheckboxGroup [ngpCheckboxGroupDefaultValue]="defaultValue">
        <div ngpCheckbox ngpCheckboxValue="one"></div>
        <div ngpCheckbox ngpCheckboxValue="two"></div>
      </div>`,
      { imports: [NgpCheckboxGroup, NgpCheckbox], componentProperties: { defaultValue: ['two'] } },
    );

    const checkboxes = getAllByRole('checkbox');
    expect(checkboxes[0]).toHaveAttribute('aria-checked', 'false');
    expect(checkboxes[1]).toHaveAttribute('aria-checked', 'true');
  });

  it('updates the group value when a child is toggled', async () => {
    const valueChange = vi.fn();
    const { getByRole } = await render(
      `<div ngpCheckboxGroup (ngpCheckboxGroupValueChange)="valueChange($event)">
        <div ngpCheckbox ngpCheckboxValue="one"></div>
      </div>`,
      { imports: [NgpCheckboxGroup, NgpCheckbox], componentProperties: { valueChange } },
    );

    const checkbox = getByRole('checkbox');
    fireEvent.click(checkbox);

    expect(checkbox).toHaveAttribute('aria-checked', 'true');
    expect(valueChange).toHaveBeenCalledWith(['one']);
  });

  it('supports a parent checkbox with checked and indeterminate state', async () => {
    const { getAllByRole } = await render(
      `<div ngpCheckboxGroup [ngpCheckboxGroupDefaultValue]="defaultValue" [ngpCheckboxGroupAllValues]="allValues">
        <div ngpCheckbox ngpCheckboxParent></div>
        <div ngpCheckbox ngpCheckboxValue="one"></div>
        <div ngpCheckbox ngpCheckboxValue="two"></div>
      </div>`,
      {
        imports: [NgpCheckboxGroup, NgpCheckbox],
        componentProperties: { allValues: ['one', 'two'], defaultValue: ['one'] },
      },
    );

    const checkboxes = getAllByRole('checkbox');
    expect(checkboxes[0]).toHaveAttribute('aria-checked', 'mixed');
    expect(checkboxes[1]).toHaveAttribute('aria-checked', 'true');
    expect(checkboxes[2]).toHaveAttribute('aria-checked', 'false');

    fireEvent.click(checkboxes[0]);
    expect(checkboxes[0]).toHaveAttribute('aria-checked', 'true');
    expect(checkboxes[2]).toHaveAttribute('aria-checked', 'true');
  });

  it('disables child interaction when the group is disabled', async () => {
    const { getByRole } = await render(
      `<div ngpCheckboxGroup ngpCheckboxGroupDisabled>
        <div ngpCheckbox ngpCheckboxValue="one"></div>
      </div>`,
      { imports: [NgpCheckboxGroup, NgpCheckbox] },
    );

    const checkbox = getByRole('checkbox');
    expect(checkbox).toHaveAttribute('aria-disabled', 'true');
    fireEvent.click(checkbox);
    expect(checkbox).toHaveAttribute('aria-checked', 'false');
  });

  it('keeps nested group state isolated from the outer group', async () => {
    const { getAllByRole } = await render(
      `<div ngpCheckboxGroup [ngpCheckboxGroupAllValues]="outerValues">
        <div ngpCheckbox ngpCheckboxValue="outer-one"></div>
        <div ngpCheckboxGroup [ngpCheckboxGroupAllValues]="innerValues">
          <div ngpCheckbox ngpCheckboxParent></div>
          <div ngpCheckbox ngpCheckboxValue="inner-one"></div>
          <div ngpCheckbox ngpCheckboxValue="inner-two"></div>
        </div>
      </div>`,
      {
        imports: [NgpCheckboxGroup, NgpCheckbox],
        componentProperties: {
          outerValues: ['outer-one'],
          innerValues: ['inner-one', 'inner-two'],
        },
      },
    );

    const checkboxes = getAllByRole('checkbox');
    fireEvent.click(checkboxes[1]);

    expect(checkboxes[0]).toHaveAttribute('aria-checked', 'false');
    expect(checkboxes[1]).toHaveAttribute('aria-checked', 'true');
    expect(checkboxes[2]).toHaveAttribute('aria-checked', 'true');
    expect(checkboxes[3]).toHaveAttribute('aria-checked', 'true');
  });
});
