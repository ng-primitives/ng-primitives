import { By } from '@angular/platform-browser';
import { fireEvent, render, screen } from '@testing-library/angular';
import { NgpCheckbox } from 'ng-primitives/checkbox';
import { describe, expect, it, vi } from 'vitest';

describe('NgpCheckbox', () => {
  describe('checkbox', () => {
    it('should have a role of checkbox', async () => {
      const { getByRole } = await render(`<div ngpCheckbox></div>`, { imports: [NgpCheckbox] });
      expect(getByRole('checkbox')).toHaveAttribute('role', 'checkbox');
    });

    it('should have a tabindex of 0', async () => {
      const { getByRole } = await render(`<div ngpCheckbox></div>`, { imports: [NgpCheckbox] });
      expect(getByRole('checkbox')).toHaveAttribute('tabindex', '0');
    });

    it('should set the tabindex to -1 when disabled', async () => {
      const container = await render(`<div ngpCheckbox [ngpCheckboxDisabled]="disabled"></div>`, {
        imports: [NgpCheckbox],
        componentProperties: { disabled: true },
      });
      expect(container.getByRole('checkbox')).toHaveAttribute('tabindex', '-1');
    });

    it('should set the aria-checked attribute to "false" when unchecked', async () => {
      const { getByRole } = await render(`<div ngpCheckbox></div>`, { imports: [NgpCheckbox] });
      expect(getByRole('checkbox')).toHaveAttribute('aria-checked', 'false');
    });

    it('should set the aria-checked attribute to "true" when checked', async () => {
      const { getByRole } = await render(`<div ngpCheckbox ngpCheckboxChecked></div>`, {
        imports: [NgpCheckbox],
      });
      expect(getByRole('checkbox')).toHaveAttribute('aria-checked', 'true');
    });

    it('should set the aria-checked attribute to "mixed" when indeterminate', async () => {
      const { getByRole } = await render(
        `<div ngpCheckbox ngpCheckboxChecked ngpCheckboxIndeterminate></div>`,
        { imports: [NgpCheckbox] },
      );
      expect(getByRole('checkbox')).toHaveAttribute('aria-checked', 'mixed');
    });

    it('should set the data-checked attribute when checked', async () => {
      const { getByRole } = await render(`<div ngpCheckbox ngpCheckboxChecked></div>`, {
        imports: [NgpCheckbox],
      });
      expect(getByRole('checkbox')).toHaveAttribute('data-checked');
    });

    it('should not have data-checked attribute when unchecked', async () => {
      const { getByRole } = await render(`<div ngpCheckbox></div>`, { imports: [NgpCheckbox] });
      expect(getByRole('checkbox')).not.toHaveAttribute('data-checked');
    });

    it('should set the data-indeterminate when indeterminate', async () => {
      const { getByRole } = await render(`<div ngpCheckbox ngpCheckboxIndeterminate></div>`, {
        imports: [NgpCheckbox],
      });
      expect(getByRole('checkbox')).toHaveAttribute('data-indeterminate');
    });

    it('should set the data-disabled when disabled', async () => {
      const { getByRole } = await render(`<div ngpCheckbox ngpCheckboxDisabled></div>`, {
        imports: [NgpCheckbox],
      });
      expect(getByRole('checkbox')).toHaveAttribute('data-disabled');
    });

    it('should emit the checkedChange event when clicked', async () => {
      const checkedChange = vi.fn();
      const { getByRole } = await render(
        `<div ngpCheckbox (ngpCheckboxCheckedChange)="checkedChange($event)"></div>`,
        { imports: [NgpCheckbox], componentProperties: { checkedChange } },
      );
      fireEvent.click(getByRole('checkbox'));
      expect(checkedChange).toHaveBeenCalledWith(true);
    });

    it('should not emit the checkedChange event when clicked and disabled', async () => {
      const checkedChange = vi.fn();
      const { getByRole } = await render(
        `<div ngpCheckbox ngpCheckboxDisabled (ngpCheckboxCheckedChange)="checkedChange($event)"></div>`,
        { imports: [NgpCheckbox], componentProperties: { checkedChange } },
      );
      fireEvent.click(getByRole('checkbox'));
      expect(checkedChange).not.toHaveBeenCalled();
    });

    it('should emit the checkedChange event when the space key is pressed', async () => {
      const checkedChange = vi.fn();
      const { getByRole } = await render(
        `<div ngpCheckbox (ngpCheckboxCheckedChange)="checkedChange($event)"></div>`,
        { imports: [NgpCheckbox], componentProperties: { checkedChange } },
      );
      fireEvent.keyDown(getByRole('checkbox'), { key: ' ' });
      expect(checkedChange).toHaveBeenCalledWith(true);
    });

    it('should not emit the checkedChange event when the space key is pressed and disabled', async () => {
      const checkedChange = vi.fn();
      const { getByRole } = await render(
        `<div ngpCheckbox ngpCheckboxDisabled (ngpCheckboxCheckedChange)="checkedChange($event)"></div>`,
        { imports: [NgpCheckbox], componentProperties: { checkedChange } },
      );
      fireEvent.keyDown(getByRole('checkbox'), { key: ' ' });
      expect(checkedChange).not.toHaveBeenCalled();
    });

    it('should mark as checked when an indeterminate checkbox is clicked', async () => {
      const checkedChange = vi.fn();
      const indeterminateChange = vi.fn();
      const { getByRole } = await render(
        `<div ngpCheckbox ngpCheckboxIndeterminate (ngpCheckboxCheckedChange)="checkedChange($event)" (ngpCheckboxIndeterminateChange)="indeterminateChange($event)"></div>`,
        { imports: [NgpCheckbox], componentProperties: { checkedChange, indeterminateChange } },
      );
      fireEvent.click(getByRole('checkbox'));
      expect(checkedChange).toHaveBeenCalledWith(true);
      expect(indeterminateChange).toHaveBeenCalledWith(false);
    });
  });

  describe('controlled mode', () => {
    it('should update the DOM when controlled value changes via two-way binding on click', async () => {
      await render(`<div ngpCheckbox [(ngpCheckboxChecked)]="checked"></div>`, {
        imports: [NgpCheckbox],
        componentProperties: { checked: false },
      });

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('aria-checked', 'false');

      fireEvent.click(checkbox);
      expect(checkbox).toHaveAttribute('aria-checked', 'true');
      expect(checkbox).toHaveAttribute('data-checked', '');

      fireEvent.click(checkbox);
      expect(checkbox).toHaveAttribute('aria-checked', 'false');
      expect(checkbox).not.toHaveAttribute('data-checked');
    });

    it('should emit checkedChange on click but not update DOM without parent updating binding', async () => {
      const spy = vi.fn();
      await render(
        `<div ngpCheckbox [ngpCheckboxChecked]="false" (ngpCheckboxCheckedChange)="onChange($event)"></div>`,
        { imports: [NgpCheckbox], componentProperties: { onChange: spy } },
      );

      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      expect(spy).toHaveBeenCalledWith(true);
      expect(checkbox).toHaveAttribute('aria-checked', 'false');
      expect(checkbox).not.toHaveAttribute('data-checked');
    });
  });

  describe('defaultChecked (uncontrolled)', () => {
    it('should initialize as unchecked when no defaultChecked is provided', async () => {
      await render(`<div ngpCheckbox></div>`, { imports: [NgpCheckbox] });
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('aria-checked', 'false');
      expect(checkbox).not.toHaveAttribute('data-checked');
    });

    it('should initialize as checked when defaultChecked is true', async () => {
      await render(`<div ngpCheckbox ngpCheckboxDefaultChecked></div>`, { imports: [NgpCheckbox] });
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('aria-checked', 'true');
      expect(checkbox).toHaveAttribute('data-checked', '');
    });

    it('should toggle from defaultChecked state on click', async () => {
      const spy = vi.fn();
      await render(
        `<div ngpCheckbox ngpCheckboxDefaultChecked (ngpCheckboxCheckedChange)="onChange($event)"></div>`,
        { imports: [NgpCheckbox], componentProperties: { onChange: spy } },
      );
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('aria-checked', 'true');

      fireEvent.click(checkbox);
      expect(spy).toHaveBeenCalledWith(false);
      expect(checkbox).toHaveAttribute('aria-checked', 'false');

      fireEvent.click(checkbox);
      expect(spy).toHaveBeenCalledWith(true);
      expect(checkbox).toHaveAttribute('aria-checked', 'true');
    });

    it('should not reset internal state when parent re-renders with same defaultChecked', async () => {
      const spy = vi.fn();
      const { rerender } = await render(
        `<div ngpCheckbox [ngpCheckboxDefaultChecked]="defaultChecked" (ngpCheckboxCheckedChange)="onChange($event)"></div>`,
        { imports: [NgpCheckbox], componentProperties: { defaultChecked: true, onChange: spy } },
      );
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('aria-checked', 'true');

      fireEvent.click(checkbox);
      expect(checkbox).toHaveAttribute('aria-checked', 'false');

      await rerender({ componentProperties: { defaultChecked: true, onChange: spy } });
      expect(checkbox).toHaveAttribute('aria-checked', 'false');
    });

    it('should not reset internal state when defaultChecked changes after user interaction', async () => {
      const spy = vi.fn();
      const { rerender } = await render(
        `<div ngpCheckbox [ngpCheckboxDefaultChecked]="defaultChecked" (ngpCheckboxCheckedChange)="onChange($event)"></div>`,
        { imports: [NgpCheckbox], componentProperties: { defaultChecked: true, onChange: spy } },
      );
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('aria-checked', 'true');

      fireEvent.click(checkbox);
      expect(checkbox).toHaveAttribute('aria-checked', 'false');

      await rerender({ componentProperties: { defaultChecked: false, onChange: spy } });
      expect(checkbox).toHaveAttribute('aria-checked', 'false');

      fireEvent.click(checkbox);
      expect(checkbox).toHaveAttribute('aria-checked', 'true');

      await rerender({ componentProperties: { defaultChecked: true, onChange: spy } });
      expect(checkbox).toHaveAttribute('aria-checked', 'true');
    });

    it('should not toggle when disabled in uncontrolled mode', async () => {
      const spy = vi.fn();
      await render(
        `<div ngpCheckbox ngpCheckboxDefaultChecked [ngpCheckboxDisabled]="true" (ngpCheckboxCheckedChange)="onChange($event)"></div>`,
        { imports: [NgpCheckbox], componentProperties: { onChange: spy } },
      );
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('aria-checked', 'true');

      fireEvent.click(checkbox);
      expect(spy).not.toHaveBeenCalled();
      expect(checkbox).toHaveAttribute('aria-checked', 'true');
    });

    it('should use controlled checked over defaultChecked when both provided', async () => {
      await render(
        `<div ngpCheckbox [ngpCheckboxChecked]="false" ngpCheckboxDefaultChecked></div>`,
        { imports: [NgpCheckbox] },
      );
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('aria-checked', 'false');
    });

    it('should toggle on click with no defaultChecked and no checked binding', async () => {
      const spy = vi.fn();
      await render(`<div ngpCheckbox (ngpCheckboxCheckedChange)="onChange($event)"></div>`, {
        imports: [NgpCheckbox],
        componentProperties: { onChange: spy },
      });
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('aria-checked', 'false');

      fireEvent.click(checkbox);
      expect(spy).toHaveBeenCalledWith(true);
      expect(checkbox).toHaveAttribute('aria-checked', 'true');

      fireEvent.click(checkbox);
      expect(spy).toHaveBeenCalledWith(false);
      expect(checkbox).toHaveAttribute('aria-checked', 'false');
    });

    it('should update state silently without emitting checkedChange when emit: false', async () => {
      const spy = vi.fn();
      const { fixture } = await render(
        `<div ngpCheckbox (ngpCheckboxCheckedChange)="onChange($event)"></div>`,
        { imports: [NgpCheckbox], componentProperties: { onChange: spy } },
      );

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('aria-checked', 'false');

      const directive = fixture.debugElement
        .query(By.directive(NgpCheckbox))
        .injector.get(NgpCheckbox);
      directive.setChecked(true, { emit: false });
      fixture.detectChanges();

      expect(checkbox).toHaveAttribute('aria-checked', 'true');
      expect(spy).not.toHaveBeenCalled();
    });

    it('should resolve indeterminate to checked then unchecked uncontrolled', async () => {
      const checkedSpy = vi.fn();
      const indeterminateSpy = vi.fn();
      await render(
        `<div ngpCheckbox [ngpCheckboxIndeterminate]="indeterminate" (ngpCheckboxCheckedChange)="onChecked($event)" (ngpCheckboxIndeterminateChange)="onIndeterminate($event)"></div>`,
        {
          imports: [NgpCheckbox],
          componentProperties: {
            indeterminate: true,
            onChecked: checkedSpy,
            onIndeterminate: indeterminateSpy,
          },
        },
      );
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('aria-checked', 'mixed');

      fireEvent.click(checkbox);
      expect(checkedSpy).toHaveBeenCalledWith(true);
      expect(indeterminateSpy).toHaveBeenCalledWith(false);
      expect(checkbox).toHaveAttribute('aria-checked', 'true');

      fireEvent.click(checkbox);
      expect(checkedSpy).toHaveBeenCalledWith(false);
      expect(checkbox).toHaveAttribute('aria-checked', 'false');
    });
  });
});
