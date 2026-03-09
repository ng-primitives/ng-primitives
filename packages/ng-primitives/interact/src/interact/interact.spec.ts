import { By } from '@angular/platform-browser';
import { render, screen } from '@testing-library/angular';
import { NgpInteract } from './interact';

describe('NgpInteract', () => {
  describe('disabled state', () => {
    describe('native button', () => {
      it('should set the disabled attribute when disabled', async () => {
        await render(`<button ngpInteract [disabled]="true">Click me</button>`, {
          imports: [NgpInteract],
        });

        expect(screen.getByRole('button')).toHaveAttribute('disabled');
      });

      it('should not set the disabled attribute when not disabled', async () => {
        await render(`<button ngpInteract>Click me</button>`, { imports: [NgpInteract] });

        expect(screen.getByRole('button')).not.toHaveAttribute('disabled');
      });

      it('should update disabled attribute when disabled changes', async () => {
        const { rerender, fixture } = await render(
          `<button ngpInteract [disabled]="isDisabled">Click me</button>`,
          { imports: [NgpInteract], componentProperties: { isDisabled: false } },
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
        const container = await render(`<a ngpInteract [disabled]="true">Link</a>`, {
          imports: [NgpInteract],
        });

        const anchor = container.debugElement.queryAll(By.css('a'));
        expect(anchor.length).toBe(1);
        expect(anchor[0].nativeElement).not.toHaveAttribute('disabled');
      });

      it('should not set the disabled attribute on div elements', async () => {
        const container = await render(`<div ngpInteract [disabled]="true">Custom</div>`, {
          imports: [NgpInteract],
        });

        const div = container.debugElement.query(By.css('div'));
        expect(div.nativeElement).not.toHaveAttribute('disabled');
      });
    });
  });

  describe('data-disabled attribute', () => {
    it('should set data-disabled when disabled', async () => {
      await render(`<button ngpInteract [disabled]="true">Click me</button>`, {
        imports: [NgpInteract],
      });

      expect(screen.getByRole('button')).toHaveAttribute('data-disabled', '');
    });

    it('should not set data-disabled when not disabled', async () => {
      await render(`<button ngpInteract>Click me</button>`, { imports: [NgpInteract] });

      expect(screen.getByRole('button')).not.toHaveAttribute('data-disabled');
    });

    it('should set data-disabled on non-native elements when disabled', async () => {
      const container = await render(`<div ngpInteract [disabled]="true">Custom</div>`, {
        imports: [NgpInteract],
      });

      const div = container.debugElement.query(By.css('div'));
      expect(div.nativeElement).toHaveAttribute('data-disabled', '');
    });
  });

  describe('focusable', () => {
    it('should set data-disabled-focusable when disabled and focusable', async () => {
      await render(
        `<button ngpInteract [disabled]="true" [focusableWhenDisabled]="true">Click me</button>`,
        { imports: [NgpInteract] },
      );

      expect(screen.getByRole('button')).toHaveAttribute('data-disabled-focusable', '');
    });

    it('should not set native disabled when focusable is true', async () => {
      await render(
        `<button ngpInteract [disabled]="true" [focusableWhenDisabled]="true">Click me</button>`,
        { imports: [NgpInteract] },
      );

      expect(screen.getByRole('button')).not.toHaveAttribute('disabled');
    });
  });

  describe('tabIndex behavior', () => {
    describe('non-native elements', () => {
      it('should adjust tabIndex to -1 when disabled and not focusable', async () => {
        const container = await render(
          `<div ngpInteract [disabled]="true" tabIndex="0">Custom</div>`,
          { imports: [NgpInteract] },
        );

        const div = container.debugElement.query(By.css('div'));
        expect(div.nativeElement.tabIndex).toBe(-1);
      });

      it('should keep tabIndex at 0 when disabled and focusable', async () => {
        const container = await render(
          `<div ngpInteract [disabled]="true" [focusableWhenDisabled]="true" tabIndex="0">Custom</div>`,
          { imports: [NgpInteract] },
        );

        const div = container.debugElement.query(By.css('div'));
        expect(div.nativeElement.tabIndex).toBe(0);
      });

      it('should preserve custom tabIndex when disabled and focusable', async () => {
        const container = await render(
          `<div ngpInteract [disabled]="true" [focusableWhenDisabled]="true" tabIndex="2">Custom</div>`,
          { imports: [NgpInteract] },
        );

        const div = container.debugElement.query(By.css('div'));
        expect(div.nativeElement.tabIndex).toBe(2);
      });

      it('should keep tabIndex at 0 when not disabled and focusable', async () => {
        const container = await render(
          `<div ngpInteract [disabled]="false" [focusableWhenDisabled]="true">Custom</div>`,
          { imports: [NgpInteract] },
        );

        const div = container.debugElement.query(By.css('div'));
        expect(div.nativeElement.tabIndex).toBe(0);
      });

      it('should keep tabIndex at 0 when disabled and focusable', async () => {
        const container = await render(
          `<div ngpInteract [disabled]="true" [focusableWhenDisabled]="true">Custom</div>`,
          { imports: [NgpInteract] },
        );

        const div = container.debugElement.query(By.css('div'));
        expect(div.nativeElement.tabIndex).toBe(0);
      });
    });

    describe('native elements', () => {
      it('should keep tabIndex at 0 when disabled and focusable', async () => {
        const container = await render(
          `<button ngpInteract [disabled]="true" [focusableWhenDisabled]="true">Click me</button>`,
          { imports: [NgpInteract] },
        );

        const button = container.debugElement.query(By.css('button'));
        expect(button.nativeElement.tabIndex).toBe(0);
      });

      it('should preserve custom tabIndex when disabled and focusable', async () => {
        const container = await render(
          `<button ngpInteract [disabled]="true" [focusableWhenDisabled]="true" tabIndex="2">Click me</button>`,
          { imports: [NgpInteract] },
        );

        const button = container.debugElement.query(By.css('button'));
        expect(button.nativeElement.tabIndex).toBe(2);
      });
    });

    it('should keep tabIndex at -1 when not disabled and focusable', async () => {
      const container = await render(
        `<button ngpInteract [disabled]="false" [focusableWhenDisabled]="true" tabIndex="-1">Click me</button>`,
        { imports: [NgpInteract] },
      );

      const button = container.debugElement.query(By.css('button'));
      expect(button.nativeElement.tabIndex).toBe(-1);
    });

    it('should keep tabIndex at 0 when disabled and focusable is false', async () => {
      const container = await render(
        `<button ngpInteract [disabled]="true" [focusableWhenDisabled]="false">Click me</button>`,
        { imports: [NgpInteract] },
      );

      const button = container.debugElement.query(By.css('button'));
      expect(button.nativeElement.tabIndex).toBe(0);
    });
  });

  describe('aria-disabled', () => {
    it('should set aria-disabled on non-native elements when disabled', async () => {
      const container = await render(`<div ngpInteract [disabled]="true">Custom</div>`, {
        imports: [NgpInteract],
      });

      const div = container.debugElement.query(By.css('div'));
      expect(div.nativeElement).toHaveAttribute('aria-disabled', 'true');
    });

    it('should not set aria-disabled on native buttons (native disabled is sufficient)', async () => {
      await render(`<button ngpInteract [disabled]="true">Click me</button>`, {
        imports: [NgpInteract],
      });

      expect(screen.getByRole('button')).not.toHaveAttribute('aria-disabled');
    });

    it('should set aria-disabled on native buttons when focusable', async () => {
      await render(
        `<button ngpInteract [disabled]="true" [focusableWhenDisabled]="true">Click me</button>`,
        { imports: [NgpInteract] },
      );

      expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true');
    });
  });

  describe('keydown event blocking', () => {
    it('should block Enter key when disabled', async () => {
      const container = await render(`<div ngpInteract [disabled]="true">Custom</div>`, {
        imports: [NgpInteract],
      });

      const div = container.debugElement.query(By.css('div'));
      const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
      const preventSpy = jest.spyOn(event, 'preventDefault');

      div.nativeElement.dispatchEvent(event);
      expect(preventSpy).toHaveBeenCalled();
    });

    it('should allow Tab key when disabled (prevent focus trap)', async () => {
      const container = await render(`<div ngpInteract [disabled]="true">Custom</div>`, {
        imports: [NgpInteract],
      });

      const div = container.debugElement.query(By.css('div'));
      const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true });
      const stopSpy = jest.spyOn(event, 'preventDefault');

      div.nativeElement.dispatchEvent(event);
      expect(stopSpy).not.toHaveBeenCalled();
    });

    it('should block events bubbling from children', async () => {
      const container = await render(
        `<div ngpInteract [disabled]="true"><span>Nested</span></div>`,
        { imports: [NgpInteract] },
      );

      const span = container.debugElement.query(By.css('span'));
      const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
      const stopSpy = jest.spyOn(event, 'stopImmediatePropagation');

      span.nativeElement.dispatchEvent(event);
      expect(stopSpy).toHaveBeenCalled();
    });
  });

  describe('tab navigation', () => {
    it('should set tabIndex to -1 for disabled non-native element', async () => {
      const container = await render(
        `<div ngpInteract [disabled]="true" tabIndex="0">Disabled</div>`,
        { imports: [NgpInteract] },
      );

      const div = container.debugElement.query(By.css('div'));
      expect(div.nativeElement.tabIndex).toBe(-1);
    });

    it('should keep tabIndex for focusable disabled element', async () => {
      const container = await render(
        `<div ngpInteract [disabled]="true" [focusableWhenDisabled]="true" tabIndex="0">Disabled Focusable</div>`,
        { imports: [NgpInteract] },
      );

      const div = container.debugElement.query(By.css('div'));
      expect(div.nativeElement.tabIndex).toBe(0);
    });
  });

  describe('with different element types', () => {
    it('should work with button elements', async () => {
      await render(`<button ngpInteract>Button</button>`, { imports: [NgpInteract] });

      const button = screen.getByRole('button');
      expect(button.tagName).toBe('BUTTON');
    });

    it('should work with anchor elements', async () => {
      const container = await render(`<a ngpInteract href="#">Link</a>`, {
        imports: [NgpInteract],
      });

      const link = container.debugElement.query(By.css('a'));
      expect(link.nativeElement.tagName).toBe('A');
    });

    it('should work with div elements', async () => {
      const container = await render(`<div ngpInteract>Custom</div>`, {
        imports: [NgpInteract],
      });

      const div = container.debugElement.query(By.css('div'));
      expect(div.nativeElement.tagName).toBe('DIV');
    });

    it('should work with input elements', async () => {
      await render(`<input ngpInteract type="text" />`, { imports: [NgpInteract] });

      const inp = screen.getByRole('textbox');
      expect(inp.tagName).toBe('INPUT');
    });
  });
});
