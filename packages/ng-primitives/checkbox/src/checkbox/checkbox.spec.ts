import { RenderResult, fireEvent, render } from '@testing-library/angular';
import { NgpCheckbox } from './checkbox';

describe('NgpCheckbox', () => {
  let container: RenderResult<unknown, unknown>;
  let checkbox: HTMLElement;
  let checkedChange: jest.Mock;
  let indeterminateChange: jest.Mock;

  beforeEach(async () => {
    checkedChange = jest.fn();
    indeterminateChange = jest.fn();

    container = await render(
      `<div
        ngpCheckbox
        [(ngpCheckboxChecked)]="checked"
        [ngpCheckboxIndeterminate]="indeterminate"
        (ngpCheckboxCheckedChange)="checkedChange($event)"
        (ngpCheckboxIndeterminateChange)="indeterminateChange($event)"
        [ngpCheckboxDisabled]="disabled">
      </div>`,
      {
        imports: [NgpCheckbox],
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
  });

  describe('checkbox', () => {
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
      container.detectChanges();
      expect(checkbox.getAttribute('aria-checked')).toBe('true');
    });

    it('should set the aria-checked attribute to "mixed" when indeterminate', async () => {
      await container.rerender({ componentProperties: { checked: true, indeterminate: true } });
      container.detectChanges();
      expect(checkbox.getAttribute('aria-checked')).toBe('mixed');
    });

    it('should set the data-checked attribute when checked', async () => {
      await container.rerender({ componentProperties: { checked: true } });
      container.detectChanges();
      expect(checkbox.getAttribute('data-checked')).toBe('');
    });

    it('should remove the data-checked attribute when unchecked', () => {
      expect(checkbox.getAttribute('data-checked')).toBeNull();
    });

    it('should set the data-indeterminate when indeterminate', async () => {
      await container.rerender({ componentProperties: { indeterminate: true } });
      container.detectChanges();
      expect(checkbox.getAttribute('data-indeterminate')).toBe('');
    });

    it('should remove the data-checked attribute when unchecked', () => {
      expect(checkbox.getAttribute('data-checked')).toBeNull();
    });

    it('should set the data-disabled when disabled', async () => {
      await container.rerender({ componentProperties: { disabled: true } });
      container.detectChanges();
      expect(checkbox.getAttribute('data-disabled')).toBe('');
    });

    it('should emit the checkedChange event when clicked', () => {
      fireEvent.click(container.getByRole('checkbox'));
      expect(checkedChange).toHaveBeenCalledWith(true);
    });

    it('should not emit the checkedChange event when clicked and disabled', async () => {
      await container.rerender({ componentProperties: { disabled: true, checkedChange } });
      fireEvent.click(container.getByRole('checkbox'));
      expect(checkedChange).not.toHaveBeenCalled();
    });

    it('should emit the checkedChange event when the space key is pressed', () => {
      fireEvent.keyDown(container.getByRole('checkbox'), { key: ' ' });
      expect(checkedChange).toHaveBeenCalledWith(true);
    });

    it('should not emit the checkedChange event when the space key is pressed and disabled', async () => {
      await container.rerender({ componentProperties: { disabled: true } });
      fireEvent.keyDown(container.getByRole('checkbox'), { key: ' ' });
      expect(checkedChange).not.toHaveBeenCalled();
    });

    it('should mark as checked when an indeterminate checkbox is clicked', async () => {
      await container.rerender({
        componentProperties: { indeterminate: true, checkedChange, indeterminateChange },
      });
      fireEvent.click(container.getByRole('checkbox'));
      expect(checkedChange).toHaveBeenCalledWith(true);
      expect(indeterminateChange).toHaveBeenCalledWith(false);
    });

    it('should not emit the checkedChange event when the enter key is pressed', () => {
      fireEvent.keyDown(container.getByRole('checkbox'), { key: 'Enter' });
      expect(checkedChange).not.toHaveBeenCalled();
    });
  });
});
