import { By } from '@angular/platform-browser';
import { fireEvent, render, screen } from '@testing-library/angular';
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
        await render(`<button ngpDisable>Click me</button>`, {
          imports: [NgpDisable],
        });

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
      await render(`<button ngpDisable>Click me</button>`, {
        imports: [NgpDisable],
      });

      expect(screen.getByRole('button')).not.toHaveAttribute('data-disabled');
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
    it('should set data-disabled-focusable when disabled and focusable', async () => {
      await render(
        `<button ngpDisable [disabled]="true" [focusableWhenDisabled]="true">Click me</button>`,
        {
          imports: [NgpDisable],
        },
      );

      expect(screen.getByRole('button')).toHaveAttribute('data-disabled-focusable', '');
    });

    it('should not set native disabled when focusableWhenDisabled is true', async () => {
      await render(
        `<button ngpDisable [disabled]="true" [focusableWhenDisabled]="true">Click me</button>`,
        {
          imports: [NgpDisable],
        },
      );

      expect(screen.getByRole('button')).not.toHaveAttribute('disabled');
    });

    it('should stop click propagation when disabled and focusableWhenDisabled', async () => {
      await render(
        `<button ngpDisable [disabled]="true" [focusableWhenDisabled]="true">Click me</button>`,
        {
          imports: [NgpDisable],
        },
      );

      const button = screen.getByRole('button');
      const clickEvent = new MouseEvent('click', { bubbles: true });
      const stopSpy = jest.spyOn(clickEvent, 'stopImmediatePropagation');

      button.dispatchEvent(clickEvent);
      expect(stopSpy).toHaveBeenCalled();
    });
  });

  describe('tabIndex behavior', () => {
    describe('non-native elements', () => {
      it('should adjust tabIndex to -1 when disabled and not focusableWhenDisabled', async () => {
        const container = await render(
          `<div ngpDisable [disabled]="true" tabindex="0">Custom</div>`,
          { imports: [NgpDisable] },
        );

        const div = container.debugElement.query(By.css('div'));
        expect(div.nativeElement.tabIndex).toBe(-1);
      });

      it('should keep tabIndex at 0 when disabled and focusableWhenDisabled', async () => {
        const container = await render(
          `<div ngpDisable [disabled]="true" [focusableWhenDisabled]="true" tabindex="0">Custom</div>`,
          { imports: [NgpDisable] },
        );

        const div = container.debugElement.query(By.css('div'));
        expect(div.nativeElement.tabIndex).toBe(0);
      });

      it('should preserve custom tabIndex when disabled and focusableWhenDisabled', async () => {
        const container = await render(
          `<div ngpDisable [disabled]="true" [focusableWhenDisabled]="true" tabindex="2">Custom</div>`,
          { imports: [NgpDisable] },
        );

        const div = container.debugElement.query(By.css('div'));
        expect(div.nativeElement.tabIndex).toBe(2);
      });

      it('should keep tabIndex at -1 when not disabled and focusableWhenDisabled', async () => {
        const container = await render(
          `<div ngpDisable [disabled]="false" [focusableWhenDisabled]="true">Custom</div>`,
          { imports: [NgpDisable] },
        );

        const div = container.debugElement.query(By.css('div'));
        expect(div.nativeElement.tabIndex).toBe(-1);
      });

      it('should keep tabIndex at -1 when disabled and focusableWhenDisabled', async () => {
        const container = await render(
          `<div ngpDisable [disabled]="true" [focusableWhenDisabled]="true">Custom</div>`,
          { imports: [NgpDisable] },
        );

        const div = container.debugElement.query(By.css('div'));
        expect(div.nativeElement.tabIndex).toBe(-1);
      });
    });

    describe('native elements', () => {
      it('should keep tabIndex at 0 when disabled and focusableWhenDisabled', async () => {
        const container = await render(
          `<button ngpDisable [disabled]="true" [focusableWhenDisabled]="true">Click me</button>`,
          { imports: [NgpDisable] },
        );

        const button = container.debugElement.query(By.css('button'));
        expect(button.nativeElement.tabIndex).toBe(0);
      });

      it('should preserve custom tabIndex when disabled and focusableWhenDisabled', async () => {
        const container = await render(
          `<button ngpDisable [disabled]="true" [focusableWhenDisabled]="true" tabindex="2">Click me</button>`,
          { imports: [NgpDisable] },
        );

        const button = container.debugElement.query(By.css('button'));
        expect(button.nativeElement.tabIndex).toBe(2);
      });
    });

    it('should keep tabIndex at -1 when not disabled and focusableWhenDisabled', async () => {
      const container = await render(
        `<button ngpDisable [disabled]="false" [focusableWhenDisabled]="true" tabindex="-1">Click me</button>`,
        { imports: [NgpDisable] },
      );

      const button = container.debugElement.query(By.css('button'));
      expect(button.nativeElement.tabIndex).toBe(-1);
    });

    it('should keep tabIndex at 0 when disabled and focusableWhenDisabled is false', async () => {
      const container = await render(
        `<button ngpDisable [disabled]="true" [focusableWhenDisabled]="false">Click me</button>`,
        { imports: [NgpDisable] },
      );

      const button = container.debugElement.query(By.css('button'));
      expect(button.nativeElement.tabIndex).toBe(0);
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

    it('should set aria-disabled on native buttons when focusableWhenDisabled', async () => {
      await render(
        `<button ngpDisable [disabled]="true" [focusableWhenDisabled]="true">Click me</button>`,
        {
          imports: [NgpDisable],
        },
      );

      expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true');
    });
  });

  describe('click event blocking', () => {
    it('should stop click propagation on non-native disabled elements', async () => {
      const container = await render(
        `<div ngpDisable [disabled]="true" tabindex="0">Click me</div>`,
        { imports: [NgpDisable] },
      );

      const div = container.debugElement.query(By.css('div'));
      const clickEvent = new MouseEvent('click', { bubbles: true });
      const stopSpy = jest.spyOn(clickEvent, 'stopImmediatePropagation');

      div.nativeElement.dispatchEvent(clickEvent);
      expect(stopSpy).toHaveBeenCalled();
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

  describe('tab navigation', () => {
    it('should set tabIndex to -1 for disabled non-native element', async () => {
      const container = await render(
        `<div ngpDisable [disabled]="true" tabindex="0">Disabled</div>`,
        { imports: [NgpDisable] },
      );

      const div = container.debugElement.query(By.css('div'));
      expect(div.nativeElement.tabIndex).toBe(-1);
    });

    it('should keep tabIndex for focusableWhenDisabled disabled element', async () => {
      const container = await render(
        `<div ngpDisable [disabled]="true" [focusableWhenDisabled]="true" tabindex="0">Disabled Focusable</div>`,
        { imports: [NgpDisable] },
      );

      const div = container.debugElement.query(By.css('div'));
      expect(div.nativeElement.tabIndex).toBe(0);
    });
  });

  describe('with different element types', () => {
    it('should work with button elements', async () => {
      await render(`<button ngpDisable>Button</button>`, {
        imports: [NgpDisable],
      });

      const button = screen.getByRole('button');
      expect(button.tagName).toBe('BUTTON');
    });

    it('should work with anchor elements', async () => {
      const container = await render(`<a ngpDisable href="#">Link</a>`, {
        imports: [NgpDisable],
      });

      const link = container.debugElement.query(By.css('a'));
      expect(link.nativeElement.tagName).toBe('A');
    });

    it('should work with div elements', async () => {
      const container = await render(`<div ngpDisable>Custom</div>`, {
        imports: [NgpDisable],
      });

      const div = container.debugElement.query(By.css('div'));
      expect(div.nativeElement.tagName).toBe('DIV');
    });

    it('should work with input elements', async () => {
      await render(`<input ngpDisable type="text" />`, { imports: [NgpDisable] });

      const inp = screen.getByRole('textbox');
      expect(inp.tagName).toBe('INPUT');
    });
  });
});
