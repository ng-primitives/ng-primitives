import { By } from '@angular/platform-browser';
import { fireEvent, render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { NgpDisable } from './disable';

describe('NgpDisable', () => {
  describe('disabled state', () => {
    describe('native button', () => {
      it('should set the disabled attribute when disabled', async () => {
        await render(`<button ngpDisable [disabled]="true">Click me</button>`, {
          imports: [NgpDisable],
        });

        expect(screen.getByRole('button')).toHaveAttribute('disabled');
      });

      it('should not set the disabled attribute when not disabled', async () => {
        await render(`<button ngpDisable>Click me</button>`, { imports: [NgpDisable] });

        expect(screen.getByRole('button')).not.toHaveAttribute('disabled');
      });

      it('should update disabled attribute when disabled changes', async () => {
        const { rerender, fixture } = await render(
          `<button ngpDisable [disabled]="isDisabled">Click me</button>`,
          { imports: [NgpDisable], componentProperties: { isDisabled: false } },
        );

        const button = screen.getByRole('button');
        expect(button).not.toHaveAttribute('disabled');

        await rerender({ componentProperties: { isDisabled: true } });
        fixture.detectChanges();
        expect(button).toHaveAttribute('disabled');

        await rerender({ componentProperties: { isDisabled: false } });
        fixture.detectChanges();
        expect(button).not.toHaveAttribute('disabled');
      });
    });

    describe('non-native element', () => {
      it('should not set the disabled attribute on non-button elements', async () => {
        const container = await render(`<a ngpDisable [disabled]="true">Link</a>`, {
          imports: [NgpDisable],
        });

        const anchor = container.debugElement.queryAll(By.css('a'));
        expect(anchor.length).toBe(1);
        expect(anchor[0].nativeElement).not.toHaveAttribute('disabled');
      });

      it('should not set the disabled attribute on div elements', async () => {
        const container = await render(`<div ngpDisable [disabled]="true">Custom</div>`, {
          imports: [NgpDisable],
        });

        const div = container.debugElement.query(By.css('div'));
        expect(div.nativeElement).not.toHaveAttribute('disabled');
      });
    });
  });

  describe('data-disabled attribute', () => {
    it('should set data-disabled when disabled', async () => {
      await render(`<button ngpDisable [disabled]="true">Click me</button>`, {
        imports: [NgpDisable],
      });

      expect(screen.getByRole('button')).toHaveAttribute('data-disabled', '');
    });

    it('should not set data-disabled when not disabled', async () => {
      await render(`<button ngpDisable>Click me</button>`, { imports: [NgpDisable] });

      expect(screen.getByRole('button')).not.toHaveAttribute('data-disabled');
    });

    it('should update data-disabled when disabled changes', async () => {
      const { rerender, fixture } = await render(
        `<button ngpDisable [disabled]="isDisabled">Click me</button>`,
        { imports: [NgpDisable], componentProperties: { isDisabled: false } },
      );

      const button = screen.getByRole('button');
      expect(button).not.toHaveAttribute('data-disabled');

      await rerender({ componentProperties: { isDisabled: true } });
      fixture.detectChanges();
      expect(button).toHaveAttribute('data-disabled', '');
    });

    it('should set data-disabled on non-native elements when disabled', async () => {
      const container = await render(`<div ngpDisable [disabled]="true">Custom</div>`, {
        imports: [NgpDisable],
      });

      const div = container.debugElement.query(By.css('div'));
      expect(div.nativeElement).toHaveAttribute('data-disabled', '');
    });
  });

  describe('focusableWhenDisabled', () => {
    it('should set data-focusable-disabled when disabled and focusable', async () => {
      await render(
        `<button ngpDisable [disabled]="true" [focusableWhenDisabled]="true">Click me</button>`,
        { imports: [NgpDisable] },
      );

      expect(screen.getByRole('button')).toHaveAttribute('data-focusable-disabled', '');
    });

    it('should not set data-focusable-disabled when not focusable', async () => {
      await render(`<button ngpDisable [disabled]="true">Click me</button>`, {
        imports: [NgpDisable],
      });

      expect(screen.getByRole('button')).not.toHaveAttribute('data-focusable-disabled');
    });

    it('should not set data-focusable-disabled when not disabled', async () => {
      await render(`<button ngpDisable [focusableWhenDisabled]="true">Click me</button>`, {
        imports: [NgpDisable],
      });

      expect(screen.getByRole('button')).not.toHaveAttribute('data-focusable-disabled');
    });

    it('should not set native disabled when focusableWhenDisabled is true', async () => {
      await render(
        `<button ngpDisable [disabled]="true" [focusableWhenDisabled]="true">Click me</button>`,
        { imports: [NgpDisable] },
      );

      expect(screen.getByRole('button')).not.toHaveAttribute('disabled');
    });
  });

  describe('tabIndex behavior', () => {
    describe('non-native elements', () => {
      it('should adjust tabIndex to -1 when disabled and not focusable', async () => {
        const container = await render(
          `<div ngpDisable [disabled]="true" tabindex="0">Custom</div>`,
          { imports: [NgpDisable] },
        );

        const div = container.debugElement.query(By.css('div'));
        expect(div.nativeElement.tabIndex).toBe(-1);
      });

      it('should keep tabIndex at 0 when disabled and focusable', async () => {
        const container = await render(
          `<div ngpDisable [disabled]="true" [focusableWhenDisabled]="true" tabindex="0">Custom</div>`,
          { imports: [NgpDisable] },
        );

        const div = container.debugElement.query(By.css('div'));
        expect(div.nativeElement.tabIndex).toBe(0);
      });

      it('should adjust negative tabIndex to 0 when focusableWhenDisabled', async () => {
        const container = await render(
          `<div ngpDisable [disabled]="true" [focusableWhenDisabled]="true" [tabIndex]="-1">Custom</div>`,
          { imports: [NgpDisable] },
        );

        const div = container.debugElement.query(By.css('div'));
        expect(div.nativeElement.tabIndex).toBe(0);
      });
    });

    describe('native buttons', () => {
      it('should not modify tabIndex when native disabled is applied', async () => {
        await render(`<button ngpDisable [disabled]="true" tabindex="0">Click me</button>`, {
          imports: [NgpDisable],
        });

        // Native disabled handles focus removal
        expect(screen.getByRole('button')).toHaveAttribute('tabindex', '0');
      });
    });
  });

  describe('aria-disabled', () => {
    it('should set aria-disabled on non-native elements when disabled', async () => {
      const container = await render(`<div ngpDisable [disabled]="true">Custom</div>`, {
        imports: [NgpDisable],
      });

      const div = container.debugElement.query(By.css('div'));
      expect(div.nativeElement).toHaveAttribute('aria-disabled', 'true');
    });

    it('should not set aria-disabled on native buttons (native disabled is sufficient)', async () => {
      await render(`<button ngpDisable [disabled]="true">Click me</button>`, {
        imports: [NgpDisable],
      });

      expect(screen.getByRole('button')).not.toHaveAttribute('aria-disabled');
    });

    it('should remove aria-disabled when not disabled', async () => {
      const container = await render(`<div ngpDisable [disabled]="false">Custom</div>`, {
        imports: [NgpDisable],
      });

      const div = container.debugElement.query(By.css('div'));
      expect(div.nativeElement).not.toHaveAttribute('aria-disabled');
    });

    it('should preserve explicit aria-disabled when not disabled', async () => {
      const container = await render(
        `<div ngpDisable [disabled]="false" [ariaDisabled]="true">Custom</div>`,
        { imports: [NgpDisable] },
      );

      const div = container.debugElement.query(By.css('div'));
      expect(div.nativeElement).toHaveAttribute('aria-disabled', 'true');
    });
  });

  describe('click event blocking', () => {
    it('should prevent click when disabled', async () => {
      const handleClick = jest.fn();
      await render(`<button ngpDisable [disabled]="true" (click)="onClick()">Click me</button>`, {
        imports: [NgpDisable],
        componentProperties: { onClick: handleClick },
      });

      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should allow click when not disabled', async () => {
      const handleClick = jest.fn();
      await render(`<button ngpDisable (click)="onClick()">Click me</button>`, {
        imports: [NgpDisable],
        componentProperties: { onClick: handleClick },
      });

      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should prevent click when focusableWhenDisabled', async () => {
      const handleClick = jest.fn();
      await render(
        `<button ngpDisable [disabled]="true" [focusableWhenDisabled]="true" (click)="onClick()">Click me</button>`,
        { imports: [NgpDisable], componentProperties: { onClick: handleClick } },
      );

      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should stop click event propagation when disabled', async () => {
      await render(`<button ngpDisable [disabled]="true">Click me</button>`, {
        imports: [NgpDisable],
      });

      const button = screen.getByRole('button');
      const clickEvent = new MouseEvent('click', { bubbles: true });
      const stopSpy = jest.spyOn(clickEvent, 'stopImmediatePropagation');

      button.dispatchEvent(clickEvent);
      expect(stopSpy).toHaveBeenCalled();
    });
  });

  describe('keydown event blocking', () => {
    it('should block Enter key when disabled', async () => {
      const container = await render(`<div ngpDisable [disabled]="true">Custom</div>`, {
        imports: [NgpDisable],
      });

      const div = container.debugElement.query(By.css('div'));
      const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
      const preventSpy = jest.spyOn(event, 'preventDefault');

      div.nativeElement.dispatchEvent(event);
      expect(preventSpy).toHaveBeenCalled();
    });

    it('should block Space key when disabled', async () => {
      const container = await render(`<div ngpDisable [disabled]="true">Custom</div>`, {
        imports: [NgpDisable],
      });

      const div = container.debugElement.query(By.css('div'));
      const event = new KeyboardEvent('keydown', { key: ' ', bubbles: true });
      const preventSpy = jest.spyOn(event, 'preventDefault');

      div.nativeElement.dispatchEvent(event);
      expect(preventSpy).toHaveBeenCalled();
    });

    it('should allow Tab key when disabled (prevent focus trap)', async () => {
      const container = await render(`<div ngpDisable [disabled]="true">Custom</div>`, {
        imports: [NgpDisable],
      });

      const div = container.debugElement.query(By.css('div'));
      const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true });
      const stopSpy = jest.spyOn(event, 'stopImmediatePropagation');

      div.nativeElement.dispatchEvent(event);
      expect(stopSpy).not.toHaveBeenCalled();
    });

    it('should only block events from the element itself, not bubbled events', async () => {
      const container = await render(
        `<div ngpDisable [disabled]="true"><span>Nested</span></div>`,
        { imports: [NgpDisable] },
      );

      const span = container.debugElement.query(By.css('span'));
      const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
      const stopSpy = jest.spyOn(event, 'stopImmediatePropagation');

      span.nativeElement.dispatchEvent(event);
      expect(stopSpy).not.toHaveBeenCalled();
    });
  });

  describe('pointerdown and mousedown blocking', () => {
    it('should block pointerdown when disabled', async () => {
      await render(`<button ngpDisable [disabled]="true">Click me</button>`, {
        imports: [NgpDisable],
      });

      const button = screen.getByRole('button');
      const event = new Event('pointerdown', { bubbles: true, cancelable: true });
      const stopSpy = jest.spyOn(event, 'stopImmediatePropagation');

      button.dispatchEvent(event);
      expect(stopSpy).toHaveBeenCalled();
    });

    it('should block mousedown when disabled', async () => {
      await render(`<button ngpDisable [disabled]="true">Click me</button>`, {
        imports: [NgpDisable],
      });

      const button = screen.getByRole('button');
      const event = new MouseEvent('mousedown', { bubbles: true });
      const stopSpy = jest.spyOn(event, 'stopImmediatePropagation');

      button.dispatchEvent(event);
      expect(stopSpy).toHaveBeenCalled();
    });
  });

  describe('programmatic state changes', () => {
    it('should support setDisabled method', async () => {
      const { fixture } = await render(`<button ngpDisable #ref="ngpDisable">Click me</button>`, {
        imports: [NgpDisable],
      });

      const button = screen.getByRole('button');
      expect(button).not.toHaveAttribute('disabled');

      const directive = fixture.debugElement.children[0].references['ref'] as NgpDisable;
      directive.setDisabled(true);
      fixture.detectChanges();

      expect(button).toHaveAttribute('disabled');
      expect(button).toHaveAttribute('data-disabled', '');
    });

    it('should support setFocusableWhenDisabled method', async () => {
      const { fixture } = await render(
        `<button ngpDisable [disabled]="true" #ref="ngpDisable">Click me</button>`,
        { imports: [NgpDisable] },
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('disabled');
      expect(button).not.toHaveAttribute('data-focusable-disabled');

      const directive = fixture.debugElement.children[0].references['ref'] as NgpDisable;
      directive.setFocusableWhenDisabled(true);
      fixture.detectChanges();

      expect(button).not.toHaveAttribute('disabled');
      expect(button).toHaveAttribute('data-focusable-disabled', '');
    });

    it('should support setTabIndex method', async () => {
      const { fixture } = await render(`<button ngpDisable #ref="ngpDisable">Click me</button>`, {
        imports: [NgpDisable],
      });

      const button = screen.getByRole('button');

      const directive = fixture.debugElement.children[0].references['ref'] as NgpDisable;
      directive.setTabIndex(5);
      fixture.detectChanges();

      expect(button).toHaveAttribute('tabindex', '5');
    });

    it('should support setAriaDisabled method', async () => {
      const { fixture } = await render(`<div ngpDisable #ref="ngpDisable">Custom</div>`, {
        imports: [NgpDisable],
      });

      const div = fixture.debugElement.query(By.css('div'));
      expect(div.nativeElement).not.toHaveAttribute('aria-disabled');

      const directive = fixture.debugElement.children[0].references['ref'] as NgpDisable;
      directive.setAriaDisabled(true);
      fixture.detectChanges();

      expect(div.nativeElement).toHaveAttribute('aria-disabled', 'true');
    });
  });

  describe('tab navigation', () => {
    it('should be focusable via Tab key when not disabled', async () => {
      await render(
        `
        <input type="text" />
        <button ngpDisable>Button</button>
      `,
        { imports: [NgpDisable] },
      );

      const user = userEvent.setup();
      const button = screen.getByRole('button');

      await user.tab();
      await user.tab();
      expect(button).toHaveFocus();
    });

    it('should skip disabled native button in tab order', async () => {
      await render(
        `
        <input type="text" />
        <button ngpDisable [disabled]="true">Disabled</button>
        <button ngpDisable>Enabled</button>
      `,
        { imports: [NgpDisable] },
      );

      const user = userEvent.setup();
      const enabledButton = screen.getByRole('button', { name: 'Enabled' });

      await user.tab();
      await user.tab();
      expect(enabledButton).toHaveFocus();
    });

    it('should keep focusableWhenDisabled button in tab order', async () => {
      await render(
        `
        <input type="text" />
        <button ngpDisable [disabled]="true" [focusableWhenDisabled]="true">Focusable Disabled</button>
        <button ngpDisable>Enabled</button>
      `,
        { imports: [NgpDisable] },
      );

      const user = userEvent.setup();
      const focusableDisabled = screen.getByRole('button', { name: 'Focusable Disabled' });

      await user.tab();
      await user.tab();
      expect(focusableDisabled).toHaveFocus();
    });
  });

  describe('with different element types', () => {
    it('should work with button elements', async () => {
      await render(`<button ngpDisable>Button</button>`, { imports: [NgpDisable] });

      const button = screen.getByRole('button');
      expect(button.tagName).toBe('BUTTON');
    });

    it('should work with input[type="button"] elements', async () => {
      await render(`<input ngpDisable type="button" value="Input Button" />`, {
        imports: [NgpDisable],
      });

      const input = screen.getByRole('button');
      expect(input.tagName).toBe('INPUT');
    });

    it('should work with anchor elements', async () => {
      const container = await render(`<a ngpDisable href="#">Link</a>`, { imports: [NgpDisable] });

      const link = container.debugElement.query(By.css('a'));
      expect(link.nativeElement.tagName).toBe('A');
    });

    it('should work with div elements', async () => {
      const container = await render(`<div ngpDisable>Custom</div>`, { imports: [NgpDisable] });

      const div = container.debugElement.query(By.css('div'));
      expect(div.nativeElement.tagName).toBe('DIV');
    });

    it('should work with span elements', async () => {
      const container = await render(`<span ngpDisable>Custom</span>`, { imports: [NgpDisable] });

      const span = container.debugElement.query(By.css('span'));
      expect(span.nativeElement.tagName).toBe('SPAN');
    });
  });
});
