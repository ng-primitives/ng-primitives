import { By } from '@angular/platform-browser';
import { fireEvent, render } from '@testing-library/angular';
import { NgpSwitch } from 'ng-primitives/switch';
import { describe, expect, it, vi } from 'vitest';

describe('NgpSwitch', () => {
  describe('roles & attributes', () => {
    it('should render with a generated id and default unchecked state', async () => {
      const { getByRole } = await render(`<button ngpSwitch></button>`, { imports: [NgpSwitch] });
      const button = getByRole('switch');

      expect(button.id).toMatch(/^ngp-switch/);
      expect(button).toHaveAttribute('aria-checked', 'false');
      expect(button).not.toHaveAttribute('data-checked');
      expect(button).toHaveAttribute('type', 'button');
      expect(button).toHaveAttribute('tabindex', '0');
    });

    it('should reflect a provided id and initial checked state', async () => {
      const { getByRole } = await render(
        `<button ngpSwitch id="custom-id" ngpSwitchChecked="true"></button>`,
        { imports: [NgpSwitch] },
      );
      const button = getByRole('switch');

      expect(button.id).toBe('custom-id');
      expect(button).toHaveAttribute('aria-checked', 'true');
      expect(button).toHaveAttribute('data-checked', '');
    });

    it('should not set the type attribute on a non-button element', async () => {
      const { getByRole } = await render(`<div ngpSwitch tabindex="0"></div>`, {
        imports: [NgpSwitch],
      });
      expect(getByRole('switch')).not.toHaveAttribute('type');
    });

    it('should expose disabled state via aria and data attributes on a button', async () => {
      const { getByRole } = await render(`<button ngpSwitch ngpSwitchDisabled></button>`, {
        imports: [NgpSwitch],
      });

      const button = getByRole('switch');
      expect(button).toHaveAttribute('aria-disabled', 'true');
      expect(button).toHaveAttribute('data-disabled', '');
      expect(button).toHaveAttribute('disabled', '');
      expect(button).toHaveAttribute('tabindex', '-1');
    });

    it('should not set the native disabled attribute on a non-button element', async () => {
      const { getByRole } = await render(`<div ngpSwitch ngpSwitchDisabled tabindex="0"></div>`, {
        imports: [NgpSwitch],
      });
      const el = getByRole('switch');
      expect(el).toHaveAttribute('aria-disabled', 'true');
      expect(el).not.toHaveAttribute('disabled');
    });

    it('should not expose aria-required by default', async () => {
      const { getByRole } = await render(`<button ngpSwitch></button>`, { imports: [NgpSwitch] });
      expect(getByRole('switch')).not.toHaveAttribute('aria-required');
    });

    it('should expose aria-required="true" when required', async () => {
      const { getByRole } = await render(`<button ngpSwitch ngpSwitchRequired></button>`, {
        imports: [NgpSwitch],
      });
      expect(getByRole('switch')).toHaveAttribute('aria-required', 'true');
    });
  });

  describe('toggle interaction', () => {
    it('should toggle on click when enabled and emit changes', async () => {
      const checkedChange = vi.fn();
      const { getByRole } = await render(
        `<button ngpSwitch (ngpSwitchCheckedChange)="checkedChange($event)"></button>`,
        { imports: [NgpSwitch], componentProperties: { checkedChange } },
      );

      const button = getByRole('switch');
      fireEvent.click(button);

      expect(checkedChange).toHaveBeenCalledWith(true);
      expect(button).toHaveAttribute('aria-checked', 'true');
      expect(button).toHaveAttribute('data-checked', '');

      fireEvent.click(button);
      expect(checkedChange).toHaveBeenLastCalledWith(false);
      expect(button).toHaveAttribute('aria-checked', 'false');
    });

    it('should not toggle or emit when disabled, and resume once enabled', async () => {
      const checkedChange = vi.fn();
      const { getByRole, rerender } = await render(
        `<button ngpSwitch [ngpSwitchDisabled]="disabled" (ngpSwitchCheckedChange)="checkedChange($event)"></button>`,
        { imports: [NgpSwitch], componentProperties: { disabled: true, checkedChange } },
      );

      fireEvent.click(getByRole('switch'));
      expect(checkedChange).not.toHaveBeenCalled();

      await rerender({ componentProperties: { disabled: false, checkedChange } });
      fireEvent.click(getByRole('switch'));
      expect(checkedChange).toHaveBeenCalledWith(true);
    });

    it('should toggle on the Space key when the element is not a button', async () => {
      const checkedChange = vi.fn();
      const { getByRole } = await render(
        `<div ngpSwitch tabindex="0" (ngpSwitchCheckedChange)="checkedChange($event)"></div>`,
        { imports: [NgpSwitch], componentProperties: { checkedChange } },
      );

      const switchDiv = getByRole('switch');
      fireEvent.keyDown(switchDiv, { key: ' ' });

      expect(checkedChange).toHaveBeenCalledWith(true);
      expect(switchDiv).toHaveAttribute('aria-checked', 'true');
    });
  });

  describe('controlled mode', () => {
    it('should reflect an external two-way binding on click', async () => {
      await render(`<button ngpSwitch [(ngpSwitchChecked)]="checked"></button>`, {
        imports: [NgpSwitch],
        componentProperties: { checked: false },
      });

      const button = document.querySelector('[ngpSwitch]')!;
      expect(button).toHaveAttribute('aria-checked', 'false');

      fireEvent.click(button);
      expect(button).toHaveAttribute('aria-checked', 'true');
      expect(button).toHaveAttribute('data-checked', '');
    });
  });

  describe('directive API', () => {
    it('should toggle via the toggle() method', async () => {
      const checkedChange = vi.fn();
      const { getByRole, fixture } = await render(
        `<button ngpSwitch (ngpSwitchCheckedChange)="checkedChange($event)"></button>`,
        { imports: [NgpSwitch], componentProperties: { checkedChange } },
      );
      const directive = fixture.debugElement.query(By.directive(NgpSwitch)).injector.get(NgpSwitch);

      directive.toggle();
      fixture.detectChanges();

      expect(checkedChange).toHaveBeenCalledWith(true);
      expect(getByRole('switch')).toHaveAttribute('aria-checked', 'true');
    });

    it('should update state silently when setChecked is called with emit: false', async () => {
      const checkedChange = vi.fn();
      const { getByRole, fixture } = await render(
        `<button ngpSwitch (ngpSwitchCheckedChange)="checkedChange($event)"></button>`,
        { imports: [NgpSwitch], componentProperties: { checkedChange } },
      );
      const directive = fixture.debugElement.query(By.directive(NgpSwitch)).injector.get(NgpSwitch);

      directive.setChecked(true, { emit: false });
      await fixture.whenStable();

      expect(getByRole('switch')).toHaveAttribute('aria-checked', 'true');
      expect(checkedChange).not.toHaveBeenCalled();
    });
  });
});
