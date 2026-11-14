import { By } from '@angular/platform-browser';
import { fireEvent, render, screen } from '@testing-library/angular';
import { NgpCheckbox } from 'ng-primitives/checkbox';
import { describe, expect, it, vi } from 'vitest';

describe('NgpCheckbox', () => {
  describe('roles & attributes', () => {
    it('should have a role of checkbox', async () => {
      const { getByRole } = await render(`<div ngpCheckbox></div>`, { imports: [NgpCheckbox] });
      expect(getByRole('checkbox')).toHaveAttribute('role', 'checkbox');
    });

    it('should have a tabindex of 0', async () => {
      const { getByRole } = await render(`<div ngpCheckbox></div>`, { imports: [NgpCheckbox] });
      expect(getByRole('checkbox')).toHaveAttribute('tabindex', '0');
    });

    it('should set the tabindex to -1 when disabled', async () => {
      const { getByRole } = await render(
        `<div ngpCheckbox [ngpCheckboxDisabled]="disabled"></div>`,
        {
          imports: [NgpCheckbox],
          componentProperties: { disabled: true },
        },
      );
      expect(getByRole('checkbox')).toHaveAttribute('tabindex', '-1');
    });

    it('should set aria-checked to "false" when unchecked', async () => {
      const { getByRole } = await render(`<div ngpCheckbox></div>`, { imports: [NgpCheckbox] });
      expect(getByRole('checkbox')).toHaveAttribute('aria-checked', 'false');
    });

    it('should set aria-checked to "true" when checked', async () => {
      const { getByRole } = await render(`<div ngpCheckbox ngpCheckboxChecked></div>`, {
        imports: [NgpCheckbox],
      });
      expect(getByRole('checkbox')).toHaveAttribute('aria-checked', 'true');
    });

    it('should set aria-checked to "mixed" when indeterminate', async () => {
      const { getByRole } = await render(
        `<div ngpCheckbox ngpCheckboxChecked ngpCheckboxIndeterminate></div>`,
        { imports: [NgpCheckbox] },
      );
      expect(getByRole('checkbox')).toHaveAttribute('aria-checked', 'mixed');
    });

    it('should set data-checked only when checked', async () => {
      const { getByRole, rerender, fixture } = await render(
        `<div ngpCheckbox [ngpCheckboxChecked]="checked"></div>`,
        { imports: [NgpCheckbox], componentProperties: { checked: false } },
      );
      expect(getByRole('checkbox')).not.toHaveAttribute('data-checked');

      await rerender({ componentProperties: { checked: true } });
      // host bindings apply via afterRenderEffect; wait for it to flush
      await fixture.whenStable();
      expect(getByRole('checkbox')).toHaveAttribute('data-checked', '');
    });

    it('should set data-indeterminate when indeterminate', async () => {
      const { getByRole } = await render(`<div ngpCheckbox ngpCheckboxIndeterminate></div>`, {
        imports: [NgpCheckbox],
      });
      expect(getByRole('checkbox')).toHaveAttribute('data-indeterminate');
    });

    it('should set data-disabled when disabled', async () => {
      const { getByRole } = await render(`<div ngpCheckbox ngpCheckboxDisabled></div>`, {
        imports: [NgpCheckbox],
      });
      expect(getByRole('checkbox')).toHaveAttribute('data-disabled');
    });

    it('should not expose aria-required by default', async () => {
      const { getByRole } = await render(`<div ngpCheckbox></div>`, { imports: [NgpCheckbox] });
      expect(getByRole('checkbox')).not.toHaveAttribute('aria-required');
    });

    it('should expose aria-required="true" when required', async () => {
      const { getByRole } = await render(`<div ngpCheckbox ngpCheckboxRequired></div>`, {
        imports: [NgpCheckbox],
      });
      expect(getByRole('checkbox')).toHaveAttribute('aria-required', 'true');
    });
  });

  describe('toggle interaction', () => {
    it('should toggle when the enclosing label is clicked', async () => {
      const { getByRole, getByText } = await render(
        `<label><div ngpCheckbox></div>Checkbox</label>`,
        { imports: [NgpCheckbox] },
      );

      fireEvent.click(getByText('Checkbox'));
      expect(getByRole('checkbox')).toHaveAttribute('aria-checked', 'true');
    });

    it('should emit checkedChange when clicked', async () => {
      const checkedChange = vi.fn();
      const { getByRole } = await render(
        `<div ngpCheckbox (ngpCheckboxCheckedChange)="checkedChange($event)"></div>`,
        { imports: [NgpCheckbox], componentProperties: { checkedChange } },
      );
      fireEvent.click(getByRole('checkbox'));
      expect(checkedChange).toHaveBeenCalledWith(true);
    });

    it('should not emit checkedChange when clicked and disabled', async () => {
      const checkedChange = vi.fn();
      const { getByRole } = await render(
        `<div ngpCheckbox ngpCheckboxDisabled (ngpCheckboxCheckedChange)="checkedChange($event)"></div>`,
        { imports: [NgpCheckbox], componentProperties: { checkedChange } },
      );
      fireEvent.click(getByRole('checkbox'));
      expect(checkedChange).not.toHaveBeenCalled();
    });

    it('should toggle on the Space key', async () => {
      const checkedChange = vi.fn();
      const { getByRole } = await render(
        `<div ngpCheckbox (ngpCheckboxCheckedChange)="checkedChange($event)"></div>`,
        { imports: [NgpCheckbox], componentProperties: { checkedChange } },
      );
      fireEvent.keyDown(getByRole('checkbox'), { key: ' ' });
      expect(checkedChange).toHaveBeenCalledWith(true);
    });

    it('should not toggle on the Space key when disabled', async () => {
      const checkedChange = vi.fn();
      const { getByRole } = await render(
        `<div ngpCheckbox ngpCheckboxDisabled (ngpCheckboxCheckedChange)="checkedChange($event)"></div>`,
        { imports: [NgpCheckbox], componentProperties: { checkedChange } },
      );
      fireEvent.keyDown(getByRole('checkbox'), { key: ' ' });
      expect(checkedChange).not.toHaveBeenCalled();
    });

    it('should not toggle on the Enter key (WAI-ARIA)', async () => {
      const checkedChange = vi.fn();
      const { getByRole } = await render(
        `<div ngpCheckbox (ngpCheckboxCheckedChange)="checkedChange($event)"></div>`,
        { imports: [NgpCheckbox], componentProperties: { checkedChange } },
      );
      const checkbox = getByRole('checkbox');
      fireEvent.keyDown(checkbox, { key: 'Enter' });
      expect(checkedChange).not.toHaveBeenCalled();
      expect(checkbox).toHaveAttribute('aria-checked', 'false');
    });

    it('should resolve indeterminate to checked on click and clear indeterminate', async () => {
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
    it('should reflect an external checked binding on click via two-way binding', async () => {
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

    it('should emit checkedChange but not update the DOM when the binding is not updated', async () => {
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

    it('should prefer controlled checked over defaultChecked when both are provided', async () => {
      await render(
        `<div ngpCheckbox [ngpCheckboxChecked]="false" ngpCheckboxDefaultChecked></div>`,
        {
          imports: [NgpCheckbox],
        },
      );
      expect(screen.getByRole('checkbox')).toHaveAttribute('aria-checked', 'false');
    });
  });

  describe('defaultChecked (uncontrolled)', () => {
    it('should initialise unchecked with no defaultChecked', async () => {
      await render(`<div ngpCheckbox></div>`, { imports: [NgpCheckbox] });
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('aria-checked', 'false');
      expect(checkbox).not.toHaveAttribute('data-checked');
    });

    it('should initialise checked when defaultChecked is true', async () => {
      await render(`<div ngpCheckbox ngpCheckboxDefaultChecked></div>`, { imports: [NgpCheckbox] });
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('aria-checked', 'true');
      expect(checkbox).toHaveAttribute('data-checked', '');
    });

    it('should stay uncontrolled when the checked binding is explicitly undefined', async () => {
      await render(
        `<div ngpCheckbox [ngpCheckboxChecked]="checked" ngpCheckboxDefaultChecked></div>`,
        {
          imports: [NgpCheckbox],
          componentProperties: { checked: undefined },
        },
      );
      const checkbox = screen.getByRole('checkbox');
      // an explicit `undefined` must not coerce to `false` — it stays uncontrolled at the default
      expect(checkbox).toHaveAttribute('aria-checked', 'true');

      fireEvent.click(checkbox);
      expect(checkbox).toHaveAttribute('aria-checked', 'false');
    });

    it('should toggle freely from a defaultChecked start', async () => {
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

    it('should not reset internal state when the parent re-renders with the same defaultChecked', async () => {
      const { rerender } = await render(
        `<div ngpCheckbox [ngpCheckboxDefaultChecked]="defaultChecked"></div>`,
        { imports: [NgpCheckbox], componentProperties: { defaultChecked: true } },
      );
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('aria-checked', 'true');

      fireEvent.click(checkbox);
      expect(checkbox).toHaveAttribute('aria-checked', 'false');

      await rerender({ componentProperties: { defaultChecked: true } });
      expect(checkbox).toHaveAttribute('aria-checked', 'false');
    });

    it('should not reset internal state when defaultChecked changes after interaction', async () => {
      const { rerender } = await render(
        `<div ngpCheckbox [ngpCheckboxDefaultChecked]="defaultChecked"></div>`,
        { imports: [NgpCheckbox], componentProperties: { defaultChecked: true } },
      );
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('aria-checked', 'true');

      fireEvent.click(checkbox);
      expect(checkbox).toHaveAttribute('aria-checked', 'false');

      await rerender({ componentProperties: { defaultChecked: false } });
      expect(checkbox).toHaveAttribute('aria-checked', 'false');
    });

    it('should not toggle when disabled in uncontrolled mode', async () => {
      const spy = vi.fn();
      await render(
        `<div ngpCheckbox ngpCheckboxDefaultChecked ngpCheckboxDisabled (ngpCheckboxCheckedChange)="onChange($event)"></div>`,
        { imports: [NgpCheckbox], componentProperties: { onChange: spy } },
      );
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('aria-checked', 'true');

      fireEvent.click(checkbox);
      expect(spy).not.toHaveBeenCalled();
      expect(checkbox).toHaveAttribute('aria-checked', 'true');
    });
  });

  describe('directive API', () => {
    it('should update state silently when setChecked is called with emit: false', async () => {
      const spy = vi.fn();
      const { fixture } = await render(
        `<div ngpCheckbox (ngpCheckboxCheckedChange)="onChange($event)"></div>`,
        { imports: [NgpCheckbox], componentProperties: { onChange: spy } },
      );

      const checkbox = screen.getByRole('checkbox');
      const directive = fixture.debugElement
        .query(By.directive(NgpCheckbox))
        .injector.get(NgpCheckbox);

      directive.setChecked(true, { emit: false });
      fixture.detectChanges();

      expect(checkbox).toHaveAttribute('aria-checked', 'true');
      expect(spy).not.toHaveBeenCalled();
    });

    it('should toggle via the toggle() method', async () => {
      const spy = vi.fn();
      const { fixture } = await render(
        `<div ngpCheckbox (ngpCheckboxCheckedChange)="onChange($event)"></div>`,
        { imports: [NgpCheckbox], componentProperties: { onChange: spy } },
      );
      const checkbox = screen.getByRole('checkbox');
      const directive = fixture.debugElement
        .query(By.directive(NgpCheckbox))
        .injector.get(NgpCheckbox);

      directive.toggle();
      fixture.detectChanges();

      expect(spy).toHaveBeenCalledWith(true);
      expect(checkbox).toHaveAttribute('aria-checked', 'true');
    });
  });
});
