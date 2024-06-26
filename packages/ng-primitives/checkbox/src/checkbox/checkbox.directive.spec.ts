/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the CC BY-ND 4.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { RenderResult, fireEvent, render } from '@testing-library/angular';
import { NgpCheckboxIndicator } from '../checkbox-indicator/checkbox-indicator.directive';
import { NgpCheckboxInput } from '../checkbox-input/checkbox-input.directive';
import { NgpCheckboxLabel } from '../checkbox-label/checkbox-label.directive';
import { NgpCheckbox } from './checkbox.directive';

const imports = [NgpCheckbox, NgpCheckboxInput, NgpCheckboxLabel, NgpCheckboxIndicator];

describe('NgpCheckbox', () => {
  let container: RenderResult<unknown, unknown>;
  let checkbox: HTMLElement;
  let label: HTMLLabelElement;
  let checkedChange: jest.Mock;
  let indeterminateChange: jest.Mock;

  beforeEach(async () => {
    checkedChange = jest.fn();
    indeterminateChange = jest.fn();

    container = await render(
      `<div
        data-testid="checkbox"
        ngpCheckbox
        [ngpCheckboxChecked]="checked"
        [ngpCheckboxIndeterminate]="indeterminate"
        (ngpCheckboxCheckedChange)="checkedChange($event)"
        (ngpCheckboxIndeterminateChange)="indeterminateChange($event)"
        [ngpCheckboxDisabled]="disabled">

        <input ngpCheckboxInput data-testid="checkbox-input" />
        <span ngpCheckboxIndicator data-testid="checkbox-indicator"></span>
        <label ngpCheckboxLabel>Accept terms and conditions</label>
      </div>`,
      {
        imports,
        componentProperties: {
          checked: false,
          indeterminate: false,
          disabled: false,
          checkedChange,
          indeterminateChange,
        },
      },
    );

    checkbox = container.getByRole('checkbox');
    label = container.getByText('Accept terms and conditions') as HTMLLabelElement;
  });

  describe('checkbox', () => {
    it('should generate a unique id', () => {
      expect(checkbox.id).toMatch(/^ngp-checkbox-indicator-\d+$/);
    });

    it('should have a role of checkbox', () => {
      expect(checkbox.getAttribute('role')).toBe('checkbox');
    });

    it('should have a tabindex of 0', () => {
      expect(checkbox.getAttribute('tabindex')).toBe('0');
    });

    it('should set the tabindex to -1 when disabled', async () => {
      await container.rerender({ componentProperties: { disabled: true } });
      expect(checkbox.getAttribute('tabindex')).toBe('-1');
    });

    it('should set the aria-checked attribute to "false" when unchecked', () => {
      expect(checkbox.getAttribute('aria-checked')).toBe('false');
    });

    it('should set the aria-checked attribute to "true" when checked', async () => {
      await container.rerender({ componentProperties: { checked: true } });
      expect(checkbox.getAttribute('aria-checked')).toBe('true');
    });

    it('should set the aria-checked attribute to "mixed" when indeterminate', async () => {
      await container.rerender({ componentProperties: { checked: true, indeterminate: true } });
      expect(checkbox.getAttribute('aria-checked')).toBe('mixed');
    });

    it('should set the data-state attribute to "checked" when checked', async () => {
      await container.rerender({ componentProperties: { checked: true } });
      expect(checkbox.getAttribute('data-state')).toBe('checked');
    });

    it('should set the data-state attribute to "unchecked" when unchecked', () => {
      expect(checkbox.getAttribute('data-state')).toBe('unchecked');
    });

    it('should set the data-state attribute to "indeterminate" when indeterminate', async () => {
      await container.rerender({ componentProperties: { indeterminate: true } });
      expect(checkbox.getAttribute('data-state')).toBe('indeterminate');
    });

    it('should set the data-disabled attribute to "false" when not disabled', () => {
      expect(checkbox.getAttribute('data-disabled')).toBe('false');
    });

    it('should set the data-disabled attribute to "true" when disabled', async () => {
      await container.rerender({ componentProperties: { disabled: true } });
      expect(checkbox.getAttribute('data-disabled')).toBe('true');
    });

    it('should emit the checkedChange event when clicked', () => {
      fireEvent.click(container.getByTestId('checkbox'));
      expect(checkedChange).toHaveBeenCalledWith(true);
    });

    it('should not emit the checkedChange event when clicked and disabled', async () => {
      await container.rerender({ componentProperties: { disabled: true, checkedChange } });
      fireEvent.click(container.getByTestId('checkbox'));
      expect(checkedChange).not.toHaveBeenCalled();
    });

    it('should emit the checkedChange event when the space key is pressed', () => {
      fireEvent.keyDown(container.getByTestId('checkbox'), { key: ' ' });
      expect(checkedChange).toHaveBeenCalledWith(true);
    });

    it('should not emit the checkedChange event when the space key is pressed and disabled', async () => {
      await container.rerender({ componentProperties: { disabled: true } });
      fireEvent.keyDown(container.getByTestId('checkbox'), { key: ' ' });
      expect(checkedChange).not.toHaveBeenCalled();
    });

    it('should mark as checked when an indeterminate checkbox is clicked', async () => {
      await container.rerender({
        componentProperties: { indeterminate: true, checkedChange, indeterminateChange },
      });
      fireEvent.click(container.getByTestId('checkbox'));
      expect(checkedChange).toHaveBeenCalledWith(true);
      expect(indeterminateChange).toHaveBeenCalledWith(false);
    });
  });

  describe('label', () => {
    it('should have a for attribute that matches the checkbox id', () => {
      expect(label.getAttribute('for')).toBe(checkbox.id);
    });
  });
});
