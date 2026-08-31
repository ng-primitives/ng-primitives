import { By } from '@angular/platform-browser';
import { fireEvent, render } from '@testing-library/angular';
import { userEvent } from '@testing-library/user-event';
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

    it('should toggle on the Enter key when the element is not a button', async () => {
      const checkedChange = vi.fn();
      const { getByRole } = await render(
        `<div ngpSwitch tabindex="0" (ngpSwitchCheckedChange)="checkedChange($event)"></div>`,
        { imports: [NgpSwitch], componentProperties: { checkedChange } },
      );

      const switchDiv = getByRole('switch');
      fireEvent.keyDown(switchDiv, { key: 'Enter' });

      expect(checkedChange).toHaveBeenCalledWith(true);
      expect(switchDiv).toHaveAttribute('aria-checked', 'true');
    });

    it('should toggle once on the Space key when the element is a button', async () => {
      const checkedChange = vi.fn();
      const { getByRole } = await render(
        `<button ngpSwitch (ngpSwitchCheckedChange)="checkedChange($event)"></button>`,
        { imports: [NgpSwitch], componentProperties: { checkedChange } },
      );

      const button = getByRole('switch');
      button.focus();
      // a real key press, so the browser's native button activation applies
      await userEvent.keyboard(' ');

      expect(checkedChange).toHaveBeenCalledTimes(1);
      expect(checkedChange).toHaveBeenCalledWith(true);
      expect(button).toHaveAttribute('aria-checked', 'true');
    });

    it('should toggle once on the Enter key when the element is a button', async () => {
      const checkedChange = vi.fn();
      const { getByRole } = await render(
        `<button ngpSwitch (ngpSwitchCheckedChange)="checkedChange($event)"></button>`,
        { imports: [NgpSwitch], componentProperties: { checkedChange } },
      );

      const button = getByRole('switch');
      button.focus();
      await userEvent.keyboard('{Enter}');

      expect(checkedChange).toHaveBeenCalledTimes(1);
      expect(button).toHaveAttribute('aria-checked', 'true');
    });

    it('should not toggle repeatedly while Space is held on a non-button', async () => {
      const checkedChange = vi.fn();
      const { getByRole } = await render(
        `<div ngpSwitch tabindex="0" (ngpSwitchCheckedChange)="checkedChange($event)"></div>`,
        { imports: [NgpSwitch], componentProperties: { checkedChange } },
      );

      const switchDiv = getByRole('switch');
      fireEvent.keyDown(switchDiv, { key: ' ' });
      const notPrevented = fireEvent.keyDown(switchDiv, { key: ' ', repeat: true });

      // a native button activates on keyup, so a held Space toggles once
      expect(checkedChange).toHaveBeenCalledTimes(1);
      expect(switchDiv).toHaveAttribute('aria-checked', 'true');
      // still prevented, otherwise a held Space scrolls the page
      expect(notPrevented).toBe(false);
    });

    it('should toggle on every repeat while Enter is held on a non-button', async () => {
      const checkedChange = vi.fn();
      const { getByRole } = await render(
        `<div ngpSwitch tabindex="0" (ngpSwitchCheckedChange)="checkedChange($event)"></div>`,
        { imports: [NgpSwitch], componentProperties: { checkedChange } },
      );

      const switchDiv = getByRole('switch');
      fireEvent.keyDown(switchDiv, { key: 'Enter' });
      fireEvent.keyDown(switchDiv, { key: 'Enter', repeat: true });
      fireEvent.keyDown(switchDiv, { key: 'Enter', repeat: true });

      // a native button clicks on every Enter keydown, autorepeat included
      expect(checkedChange).toHaveBeenCalledTimes(3);
      expect(switchDiv).toHaveAttribute('aria-checked', 'true');
    });

    it('should not toggle on activation keys when a non-button is disabled', async () => {
      const checkedChange = vi.fn();
      const { getByRole } = await render(
        `<div ngpSwitch ngpSwitchDisabled tabindex="0" (ngpSwitchCheckedChange)="checkedChange($event)"></div>`,
        { imports: [NgpSwitch], componentProperties: { checkedChange } },
      );

      const switchDiv = getByRole('switch');
      fireEvent.keyDown(switchDiv, { key: ' ' });
      fireEvent.keyDown(switchDiv, { key: 'Enter' });

      expect(checkedChange).not.toHaveBeenCalled();
      expect(switchDiv).toHaveAttribute('aria-checked', 'false');
    });

    it('should not toggle on unrelated keys', async () => {
      const checkedChange = vi.fn();
      const { getByRole } = await render(
        `<div ngpSwitch tabindex="0" (ngpSwitchCheckedChange)="checkedChange($event)"></div>`,
        { imports: [NgpSwitch], componentProperties: { checkedChange } },
      );

      fireEvent.keyDown(getByRole('switch'), { key: 'Tab' });
      expect(checkedChange).not.toHaveBeenCalled();
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

  describe('controlled mode (no round-trip)', () => {
    it('should emit checkedChange on click but not update the DOM when the parent does not update the binding', async () => {
      const checkedChange = vi.fn();
      const { getByRole } = await render(
        `<button ngpSwitch [ngpSwitchChecked]="checked" (ngpSwitchCheckedChange)="checkedChange($event)"></button>`,
        { imports: [NgpSwitch], componentProperties: { checked: false, checkedChange } },
      );
      const button = getByRole('switch');

      // controlled to unchecked; clicking notifies via checkedChange but the
      // parent never writes the value back, so the DOM must stay unchecked.
      fireEvent.click(button);

      expect(checkedChange).toHaveBeenCalledWith(true);
      expect(button).toHaveAttribute('aria-checked', 'false');
      expect(button).not.toHaveAttribute('data-checked');
    });
  });

  describe('defaultChecked (uncontrolled)', () => {
    it('should start checked from the default value', async () => {
      const { getByRole } = await render(
        `<button ngpSwitch [ngpSwitchDefaultChecked]="true"></button>`,
        {
          imports: [NgpSwitch],
        },
      );
      expect(getByRole('switch')).toHaveAttribute('aria-checked', 'true');
    });

    it('should let a click override the default value (uncontrolled)', async () => {
      const { getByRole } = await render(
        `<button ngpSwitch [ngpSwitchDefaultChecked]="true"></button>`,
        {
          imports: [NgpSwitch],
        },
      );
      const button = getByRole('switch');

      fireEvent.click(button);
      expect(button).toHaveAttribute('aria-checked', 'false');
    });

    it('should prefer a controlled value over the default value when both are provided', async () => {
      const { getByRole } = await render(
        `<button ngpSwitch [ngpSwitchChecked]="false" [ngpSwitchDefaultChecked]="true"></button>`,
        { imports: [NgpSwitch] },
      );
      expect(getByRole('switch')).toHaveAttribute('aria-checked', 'false');
    });

    it('should stay uncontrolled when the checked binding is explicitly undefined', async () => {
      const { getByRole } = await render(
        `<button ngpSwitch [ngpSwitchChecked]="checked" [ngpSwitchDefaultChecked]="true"></button>`,
        { imports: [NgpSwitch], componentProperties: { checked: undefined } },
      );
      const button = getByRole('switch');
      // an explicit `undefined` must not coerce to `false` — it stays uncontrolled at the default
      expect(button).toHaveAttribute('aria-checked', 'true');

      fireEvent.click(button);
      expect(button).toHaveAttribute('aria-checked', 'false');
    });
  });
});
