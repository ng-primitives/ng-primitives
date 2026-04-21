import { By } from '@angular/platform-browser';
import { RenderResult, fireEvent, render, screen } from '@testing-library/angular';
import { NgpCheckbox } from './checkbox';

describe('NgpCheckbox', () => {
  describe('checkbox', () => {
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

    it('should have a role of checkbox', () => {
      expect(checkbox).toHaveAttribute('role', 'checkbox');
    });

    it('should have a tabindex of 0', () => {
      expect(checkbox).toHaveAttribute('tabindex', '0');
    });

    it('should set the tabindex to -1 when disabled', async () => {
      await container.rerender({ componentProperties: { disabled: true } });
      container.detectChanges();
      expect(checkbox).toHaveAttribute('tabindex', '-1');
    });

    it('should set the aria-checked attribute to "false" when unchecked', () => {
      expect(checkbox).toHaveAttribute('aria-checked', 'false');
    });

    it('should set the aria-checked attribute to "true" when checked', async () => {
      await container.rerender({ componentProperties: { checked: true } });
      container.detectChanges();
      expect(checkbox).toHaveAttribute('aria-checked', 'true');
    });

    it('should set the aria-checked attribute to "mixed" when indeterminate', async () => {
      await container.rerender({ componentProperties: { checked: true, indeterminate: true } });
      container.detectChanges();
      expect(checkbox).toHaveAttribute('aria-checked', 'mixed');
    });

    it('should set the data-checked attribute when checked', async () => {
      await container.rerender({ componentProperties: { checked: true } });
      container.detectChanges();
      expect(checkbox).toHaveAttribute('data-checked');
    });

    it('should remove the data-checked attribute when unchecked', () => {
      expect(checkbox).not.toHaveAttribute('data-checked');
    });

    it('should set the data-indeterminate when indeterminate', async () => {
      await container.rerender({ componentProperties: { indeterminate: true } });
      container.detectChanges();
      expect(checkbox).toHaveAttribute('data-indeterminate');
    });

    it('should remove the data-checked attribute when unchecked', () => {
      expect(checkbox).not.toHaveAttribute('data-checked');
    });

    it('should set the data-disabled when disabled', async () => {
      await container.rerender({ componentProperties: { disabled: true } });
      container.detectChanges();
      expect(checkbox).toHaveAttribute('data-disabled');
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
      const spy = jest.fn();

      await render(
        `<div ngpCheckbox [ngpCheckboxChecked]="false" (ngpCheckboxCheckedChange)="onChange($event)"></div>`,
        { imports: [NgpCheckbox], componentProperties: { onChange: spy } },
      );

      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      expect(spy).toHaveBeenCalledWith(true);
      // DOM must stay at the controlled value — no internal divergence
      expect(checkbox).toHaveAttribute('aria-checked', 'false');
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
      const spy = jest.fn();
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
      const spy = jest.fn();
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
      const spy = jest.fn();
      const { rerender } = await render(
        `<div ngpCheckbox [ngpCheckboxDefaultChecked]="defaultChecked" (ngpCheckboxCheckedChange)="onChange($event)"></div>`,
        { imports: [NgpCheckbox], componentProperties: { defaultChecked: true, onChange: spy } },
      );
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('aria-checked', 'true');

      fireEvent.click(checkbox);
      expect(checkbox).toHaveAttribute('aria-checked', 'false');

      // Parent changes defaultChecked to false — should NOT reset user's state
      await rerender({ componentProperties: { defaultChecked: false, onChange: spy } });
      expect(checkbox).toHaveAttribute('aria-checked', 'false');

      fireEvent.click(checkbox);
      expect(checkbox).toHaveAttribute('aria-checked', 'true');

      // Parent changes defaultChecked back to true — should NOT reset
      await rerender({ componentProperties: { defaultChecked: true, onChange: spy } });
      expect(checkbox).toHaveAttribute('aria-checked', 'true');
    });

    it('should not toggle when disabled in uncontrolled mode', async () => {
      const spy = jest.fn();
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
      const spy = jest.fn();
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
      const spy = jest.fn();
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
      const checkedSpy = jest.fn();
      const indeterminateSpy = jest.fn();
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
