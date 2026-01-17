import { FocusMonitor } from '@angular/cdk/a11y';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { fireEvent, render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { NgpButton } from './button';
import { provideButtonConfig } from './button-config';

describe('NgpButton', () => {
  // ============================================================================
  // Native Button Tests
  // ============================================================================
  describe('native button', () => {
    it('should set tabindex="0" by default', async () => {
      await render(`<button ngpButton>Click me</button>`, {
        imports: [NgpButton],
      });

      expect(screen.getByRole('button')).toHaveAttribute('tabindex', '0');
    });

    it('should NOT set type="button" by default (backwards compatibility)', async () => {
      await render(`<button ngpButton>Click me</button>`, {
        imports: [NgpButton],
      });

      // Default config: autoSetButtonType: false
      expect(screen.getByRole('button')).not.toHaveAttribute('type');
    });

    it('should set type="button" when autoSetButtonType is enabled', async () => {
      await render(`<button ngpButton>Click me</button>`, {
        imports: [NgpButton],
        providers: [provideButtonConfig({ autoSetButtonType: true })],
      });

      expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
    });

    it('should respect explicit type="submit"', async () => {
      await render(`<button ngpButton type="submit">Submit</button>`, {
        imports: [NgpButton],
        providers: [provideButtonConfig({ autoSetButtonType: true })],
      });

      expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
    });

    it('should respect explicit [type]="null" to remove type attribute', async () => {
      await render(`<button ngpButton [type]="null">Submit</button>`, {
        imports: [NgpButton],
        providers: [provideButtonConfig({ autoSetButtonType: true })],
      });

      expect(screen.getByRole('button')).not.toHaveAttribute('type');
    });

    it('should not set the disabled attribute when not disabled', async () => {
      await render(`<button ngpButton>Click me</button>`, {
        imports: [NgpButton],
      });

      expect(screen.getByRole('button')).not.toHaveAttribute('disabled');
    });

    it('should set the disabled attribute when disabled', async () => {
      await render(`<button ngpButton [disabled]="true">Click me</button>`, {
        imports: [NgpButton],
      });

      expect(screen.getByRole('button')).toHaveAttribute('disabled');
    });

    it('should set data-disabled when disabled', async () => {
      await render(`<button ngpButton [disabled]="true">Click me</button>`, {
        imports: [NgpButton],
      });

      expect(screen.getByRole('button')).toHaveAttribute('data-disabled', '');
    });

    it('should not set data-disabled when not disabled', async () => {
      await render(`<button ngpButton>Click me</button>`, {
        imports: [NgpButton],
      });

      expect(screen.getByRole('button')).not.toHaveAttribute('data-disabled');
    });

    it('should update data-disabled when disabled changes', async () => {
      const { rerender } = await render(
        `<button ngpButton [disabled]="isDisabled">Click me</button>`,
        {
          imports: [NgpButton],
          componentProperties: { isDisabled: false },
        },
      );

      const button = screen.getByRole('button');
      expect(button).not.toHaveAttribute('data-disabled');
      expect(button).not.toHaveAttribute('disabled');

      await rerender({ componentProperties: { isDisabled: true } });
      expect(button).toHaveAttribute('data-disabled');
      expect(button).toHaveAttribute('disabled');
    });
  });

  // ============================================================================
  // Non-Native Element Tests (div/span/a acting as button)
  // ============================================================================
  describe('non-native button (div/span)', () => {
    it('should NOT set role="button" by default (backwards compatibility)', async () => {
      await render(`<div ngpButton>Click me</div>`, {
        imports: [NgpButton],
      });

      // Default config: autoSetButtonRole: false
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('should set role="button" when autoSetButtonRole is enabled', async () => {
      await render(`<div ngpButton>Click me</div>`, {
        imports: [NgpButton],
        providers: [provideButtonConfig({ autoSetButtonRole: true })],
      });

      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should respect explicit role attribute over auto-set', async () => {
      await render(`<div ngpButton role="menuitem">Click me</div>`, {
        imports: [NgpButton],
        providers: [provideButtonConfig({ autoSetButtonRole: true })],
      });

      expect(screen.getByRole('menuitem')).toBeInTheDocument();
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('should respect explicit [role]="null" to prevent role being set', async () => {
      await render(`<div ngpButton [role]="null">Click me</div>`, {
        imports: [NgpButton],
        providers: [provideButtonConfig({ autoSetButtonRole: true })],
      });

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('should set tabindex="0" for keyboard focusability', async () => {
      await render(`<div ngpButton>Click me</div>`, {
        imports: [NgpButton],
        providers: [provideButtonConfig({ autoSetButtonRole: true })],
      });

      expect(screen.getByRole('button')).toHaveAttribute('tabindex', '0');
    });

    it('should set tabindex="-1" when disabled to remove from tab order', async () => {
      await render(`<div ngpButton [disabled]="true">Click me</div>`, {
        imports: [NgpButton],
        providers: [provideButtonConfig({ autoSetButtonRole: true })],
      });

      expect(screen.getByRole('button')).toHaveAttribute('tabindex', '-1');
    });

    it('should set aria-disabled="true" when disabled', async () => {
      await render(`<div ngpButton [disabled]="true">Click me</div>`, {
        imports: [NgpButton],
        providers: [provideButtonConfig({ autoSetButtonRole: true })],
      });

      expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true');
    });

    it('should not set aria-disabled when not disabled', async () => {
      await render(`<div ngpButton>Click me</div>`, {
        imports: [NgpButton],
        providers: [provideButtonConfig({ autoSetButtonRole: true })],
      });

      expect(screen.getByRole('button')).not.toHaveAttribute('aria-disabled');
    });

    describe('keyboard activation', () => {
      it('should activate on Enter key (keydown)', async () => {
        const handleClick = jest.fn();
        await render(`<div ngpButton (click)="onClick()">Click me</div>`, {
          imports: [NgpButton],
          providers: [provideButtonConfig({ autoSetButtonRole: true })],
          componentProperties: { onClick: handleClick },
        });

        const button = screen.getByRole('button');
        button.focus();
        expect(button).toHaveFocus();

        fireEvent.keyDown(button, { key: 'Enter' });
        expect(handleClick).toHaveBeenCalledTimes(1);
      });

      it('should activate on Space key (keyup)', async () => {
        const handleClick = jest.fn();
        await render(`<div ngpButton (click)="onClick()">Click me</div>`, {
          imports: [NgpButton],
          providers: [provideButtonConfig({ autoSetButtonRole: true })],
          componentProperties: { onClick: handleClick },
        });

        const button = screen.getByRole('button');
        button.focus();

        // Space should NOT activate on keydown (allows cancellation)
        fireEvent.keyDown(button, { key: ' ' });
        expect(handleClick).not.toHaveBeenCalled();

        // Space should activate on keyup
        fireEvent.keyUp(button, { key: ' ' });
        expect(handleClick).toHaveBeenCalledTimes(1);
      });

      it('should not activate keyboard events when disabled', async () => {
        const handleClick = jest.fn();
        await render(`<div ngpButton [disabled]="true" (click)="onClick()">Click me</div>`, {
          imports: [NgpButton],
          providers: [provideButtonConfig({ autoSetButtonRole: true })],
          componentProperties: { onClick: handleClick },
        });

        const button = screen.getByRole('button');

        fireEvent.keyDown(button, { key: 'Enter' });
        fireEvent.keyUp(button, { key: ' ' });

        expect(handleClick).not.toHaveBeenCalled();
      });

      it('should not activate native button via keyboard (browser handles it)', async () => {
        const handleClick = jest.fn();
        await render(`<button ngpButton (click)="onClick()">Click me</button>`, {
          imports: [NgpButton],
          componentProperties: { onClick: handleClick },
        });

        const button = screen.getByRole('button');
        button.focus();

        // For native buttons, browser handles Enter/Space
        // Our keyboard handlers should not duplicate the click
        fireEvent.keyDown(button, { key: 'Enter' });

        // Native button + our handler should only click once via browser
        // Our handler explicitly checks !isButton
        expect(handleClick).not.toHaveBeenCalled();
      });
    });
  });

  // ============================================================================
  // Anchor Element Tests
  // ============================================================================
  describe('anchor element', () => {
    it('should not add role="button" to anchor with href even when autoSetButtonRole is enabled', async () => {
      await render(`<a ngpButton href="https://example.com">Link</a>`, {
        imports: [NgpButton],
        providers: [provideButtonConfig({ autoSetButtonRole: true })],
      });

      // Should remain a link, not become a button
      expect(screen.getByRole('link')).toBeInTheDocument();
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('should not set the disabled attribute on anchor', async () => {
      const { debugElement } = await render(
        `<a ngpButton href="https://example.com" [disabled]="true">Link</a>`,
        { imports: [NgpButton] },
      );

      const anchor = debugElement.queryAll(By.css('a'));
      expect(anchor.length).toBe(1);
      expect(anchor[0].nativeElement).not.toHaveAttribute('disabled');
    });

    it('should set aria-disabled on disabled anchor', async () => {
      await render(`<a ngpButton href="https://example.com" [disabled]="true">Link</a>`, {
        imports: [NgpButton],
      });

      expect(screen.getByRole('link')).toHaveAttribute('aria-disabled', 'true');
    });

    it('should prevent click on disabled anchor', async () => {
      const handleClick = jest.fn();
      await render(
        `<a ngpButton href="https://example.com" [disabled]="true" (click)="onClick()">Link</a>`,
        {
          imports: [NgpButton],
          componentProperties: { onClick: handleClick },
        },
      );

      fireEvent.click(screen.getByRole('link'));
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should add role="button" to anchor without href when autoSetButtonRole is enabled', async () => {
      await render(`<a ngpButton>Button-like link</a>`, {
        imports: [NgpButton],
        providers: [provideButtonConfig({ autoSetButtonRole: true })],
      });

      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should allow keyboard activation on anchor without href', async () => {
      const handleClick = jest.fn();
      await render(`<a ngpButton (click)="onClick()">Click me</a>`, {
        imports: [NgpButton],
        providers: [provideButtonConfig({ autoSetButtonRole: true })],
        componentProperties: { onClick: handleClick },
      });

      const button = screen.getByRole('button');
      button.focus();

      fireEvent.keyDown(button, { key: 'Enter' });
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should not allow keyboard activation on anchor with href (browser handles it)', async () => {
      const handleClick = jest.fn();
      await render(`<a ngpButton href="https://example.com" (click)="onClick()">Click me</a>`, {
        imports: [NgpButton],
        componentProperties: { onClick: handleClick },
      });

      const link = screen.getByRole('link');
      link.focus();

      // Our handler checks isValidLink and skips keyboard activation
      fireEvent.keyDown(link, { key: 'Enter' });
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  // ============================================================================
  // Click Prevention When Disabled
  // ============================================================================
  describe('click prevention when disabled', () => {
    it('should prevent click on disabled native button', async () => {
      const handleClick = jest.fn();
      await render(`<button ngpButton [disabled]="true" (click)="onClick()">Click me</button>`, {
        imports: [NgpButton],
        componentProperties: { onClick: handleClick },
      });

      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should prevent click on disabled non-native element', async () => {
      const handleClick = jest.fn();
      await render(`<div ngpButton [disabled]="true" (click)="onClick()">Click me</div>`, {
        imports: [NgpButton],
        providers: [provideButtonConfig({ autoSetButtonRole: true })],
        componentProperties: { onClick: handleClick },
      });

      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should allow click when not disabled', async () => {
      const handleClick = jest.fn();
      await render(`<button ngpButton (click)="onClick()">Click me</button>`, {
        imports: [NgpButton],
        componentProperties: { onClick: handleClick },
      });

      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should prevent mousedown default when disabled', async () => {
      await render(`<button ngpButton [disabled]="true">Click me</button>`, {
        imports: [NgpButton],
      });

      const button = screen.getByRole('button');
      const event = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
      const preventDefaultSpy = jest.spyOn(event, 'preventDefault');

      button.dispatchEvent(event);
      expect(preventDefaultSpy).toHaveBeenCalled();
    });
  });

  // ============================================================================
  // focusableWhenDisabled Tests
  // ============================================================================
  describe('focusableWhenDisabled', () => {
    describe('on native button', () => {
      it('should allow disabled button to be focused', async () => {
        await render(
          `<button ngpButton [disabled]="true" [focusableWhenDisabled]="true">Click me</button>`,
          { imports: [NgpButton] },
        );

        const button = screen.getByRole('button');
        button.focus();
        expect(button).toHaveFocus();
      });

      it('should not set disabled attribute (uses aria-disabled instead)', async () => {
        await render(
          `<button ngpButton [disabled]="true" [focusableWhenDisabled]="true">Click me</button>`,
          { imports: [NgpButton] },
        );

        const button = screen.getByRole('button');
        expect(button).not.toHaveAttribute('disabled');
        expect(button).toHaveAttribute('aria-disabled', 'true');
      });

      it('should set data-focusable-when-disabled attribute', async () => {
        await render(`<button ngpButton [focusableWhenDisabled]="true">Click me</button>`, {
          imports: [NgpButton],
        });

        expect(screen.getByRole('button')).toHaveAttribute('data-focusable-when-disabled', '');
      });

      it('should keep tabindex="0" when disabled', async () => {
        await render(
          `<button ngpButton [disabled]="true" [focusableWhenDisabled]="true">Click me</button>`,
          { imports: [NgpButton] },
        );

        expect(screen.getByRole('button')).toHaveAttribute('tabindex', '0');
      });
    });

    describe('on non-native element', () => {
      it('should keep tabindex="0" when disabled', async () => {
        await render(
          `<div ngpButton [disabled]="true" [focusableWhenDisabled]="true">Click me</div>`,
          {
            imports: [NgpButton],
            providers: [provideButtonConfig({ autoSetButtonRole: true })],
          },
        );

        expect(screen.getByRole('button')).toHaveAttribute('tabindex', '0');
      });

      it('should allow focusing when disabled', async () => {
        await render(
          `<div ngpButton [disabled]="true" [focusableWhenDisabled]="true">Click me</div>`,
          {
            imports: [NgpButton],
            providers: [provideButtonConfig({ autoSetButtonRole: true })],
          },
        );

        const button = screen.getByRole('button');
        button.focus();
        expect(button).toHaveFocus();
      });
    });

    describe('interaction blocking', () => {
      it('should prevent click when disabled and focusableWhenDisabled', async () => {
        const handleClick = jest.fn();
        await render(
          `<button ngpButton [disabled]="true" [focusableWhenDisabled]="true" (click)="onClick()">Click me</button>`,
          {
            imports: [NgpButton],
            componentProperties: { onClick: handleClick },
          },
        );

        fireEvent.click(screen.getByRole('button'));
        expect(handleClick).not.toHaveBeenCalled();
      });

      it('should prevent Enter key when disabled and focusableWhenDisabled', async () => {
        const handleClick = jest.fn();
        await render(
          `<div ngpButton [disabled]="true" [focusableWhenDisabled]="true" (click)="onClick()">Click me</div>`,
          {
            imports: [NgpButton],
            providers: [provideButtonConfig({ autoSetButtonRole: true })],
            componentProperties: { onClick: handleClick },
          },
        );

        const button = screen.getByRole('button');
        button.focus();
        fireEvent.keyDown(button, { key: 'Enter' });

        expect(handleClick).not.toHaveBeenCalled();
      });

      it('should prevent Space key when disabled and focusableWhenDisabled', async () => {
        const handleClick = jest.fn();
        await render(
          `<div ngpButton [disabled]="true" [focusableWhenDisabled]="true" (click)="onClick()">Click me</div>`,
          {
            imports: [NgpButton],
            providers: [provideButtonConfig({ autoSetButtonRole: true })],
            componentProperties: { onClick: handleClick },
          },
        );

        const button = screen.getByRole('button');
        button.focus();
        fireEvent.keyDown(button, { key: ' ' });
        fireEvent.keyUp(button, { key: ' ' });

        expect(handleClick).not.toHaveBeenCalled();
      });

      it('should allow Tab key when disabled and focusableWhenDisabled', async () => {
        await render(
          `
          <button ngpButton [disabled]="true" [focusableWhenDisabled]="true">First</button>
          <button ngpButton>Second</button>
        `,
          { imports: [NgpButton] },
        );

        const user = userEvent.setup();
        const firstButton = screen.getByRole('button', { name: 'First' });

        firstButton.focus();
        expect(firstButton).toHaveFocus();

        // Tab should work - focus moves to next element
        await user.tab();
        expect(screen.getByRole('button', { name: 'Second' })).toHaveFocus();
      });
    });
  });

  // ============================================================================
  // Interaction States (ngpInteractions integration)
  // ============================================================================
  describe('interaction states', () => {
    it('should add data-hover when hovered', async () => {
      await render(`<button ngpButton>Click me</button>`, {
        imports: [NgpButton],
      });

      const button = screen.getByRole('button');
      fireEvent.mouseEnter(button);
      expect(button).toHaveAttribute('data-hover', '');
    });

    it('should remove data-hover when not hovered', async () => {
      await render(`<button ngpButton>Click me</button>`, {
        imports: [NgpButton],
      });

      const button = screen.getByRole('button');
      fireEvent.mouseEnter(button);
      expect(button).toHaveAttribute('data-hover', '');
      fireEvent.mouseLeave(button);
      expect(button).not.toHaveAttribute('data-hover');
    });

    it('should add data-focus-visible when keyboard focused', async () => {
      await render(`<button ngpButton>Click me</button>`, {
        imports: [NgpButton],
      });

      const focusMonitor = TestBed.inject(FocusMonitor);
      const button = screen.getByRole('button');
      focusMonitor.focusVia(button, 'keyboard');
      expect(button).toHaveAttribute('data-focus-visible');
    });

    it('should remove data-focus-visible when blurred', async () => {
      await render(`<button ngpButton>Click me</button>`, {
        imports: [NgpButton],
      });

      const focusMonitor = TestBed.inject(FocusMonitor);
      const button = screen.getByRole('button');
      focusMonitor.focusVia(button, 'keyboard');
      expect(button).toHaveAttribute('data-focus-visible');
      fireEvent.blur(button);
      expect(button).not.toHaveAttribute('data-focus-visible');
    });

    it('should add data-press when pressed', async () => {
      await render(`<button ngpButton>Click me</button>`, {
        imports: [NgpButton],
      });

      const button = screen.getByRole('button');
      fireEvent.pointerDown(button);
      expect(button).toHaveAttribute('data-press', '');
    });

    it('should remove data-press when released', async () => {
      await render(`<button ngpButton>Click me</button>`, {
        imports: [NgpButton],
      });

      const button = screen.getByRole('button');
      fireEvent.pointerDown(button);
      expect(button).toHaveAttribute('data-press', '');
      fireEvent.pointerUp(button);
      expect(button).not.toHaveAttribute('data-press');
    });

    it('should not add data-press when disabled', async () => {
      await render(`<button ngpButton [disabled]="true">Click me</button>`, {
        imports: [NgpButton],
      });

      const button = screen.getByRole('button');
      fireEvent.pointerDown(button);
      expect(button).not.toHaveAttribute('data-press');
    });

    it('should not add data-focus-visible when disabled', async () => {
      await render(`<button ngpButton [disabled]="true">Click me</button>`, {
        imports: [NgpButton],
      });

      const focusMonitor = TestBed.inject(FocusMonitor);
      const button = screen.getByRole('button');
      focusMonitor.focusVia(button, 'keyboard');
      expect(button).not.toHaveAttribute('data-focus-visible');
    });

    it('should not add data-hover when disabled', async () => {
      await render(`<button ngpButton [disabled]="true">Click me</button>`, {
        imports: [NgpButton],
      });

      const button = screen.getByRole('button');
      fireEvent.mouseEnter(button);
      expect(button).not.toHaveAttribute('data-hover');
    });

    describe('when focusableWhenDisabled (soft disabled)', () => {
      it('should still show data-focus-visible', async () => {
        await render(
          `<button ngpButton [disabled]="true" [focusableWhenDisabled]="true">Click me</button>`,
          { imports: [NgpButton] },
        );

        const focusMonitor = TestBed.inject(FocusMonitor);
        const button = screen.getByRole('button');
        focusMonitor.focusVia(button, 'keyboard');
        expect(button).toHaveAttribute('data-focus-visible');
      });

      it('should still show data-hover', async () => {
        await render(
          `<button ngpButton [disabled]="true" [focusableWhenDisabled]="true">Click me</button>`,
          { imports: [NgpButton] },
        );

        const button = screen.getByRole('button');
        fireEvent.mouseEnter(button);
        expect(button).toHaveAttribute('data-hover', '');
      });

      it('should still show data-press', async () => {
        await render(
          `<button ngpButton [disabled]="true" [focusableWhenDisabled]="true">Click me</button>`,
          { imports: [NgpButton] },
        );

        const button = screen.getByRole('button');
        fireEvent.pointerDown(button);
        expect(button).toHaveAttribute('data-press', '');
      });
    });
  });

  // ============================================================================
  // Configuration Options
  // ============================================================================
  describe('configuration options', () => {
    describe('autoSetButtonRole', () => {
      it('should NOT set role="button" by default on non-native elements', async () => {
        await render(`<div ngpButton>Click me</div>`, {
          imports: [NgpButton],
        });

        // Default config: autoSetButtonRole: false
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
      });

      it('should set role="button" when autoSetButtonRole is true', async () => {
        await render(`<div ngpButton>Click me</div>`, {
          imports: [NgpButton],
          providers: [provideButtonConfig({ autoSetButtonRole: true })],
        });

        expect(screen.getByRole('button')).toBeInTheDocument();
      });
    });

    describe('autoSetButtonType', () => {
      it('should NOT set type="button" by default on native buttons', async () => {
        await render(`<button ngpButton>Click me</button>`, {
          imports: [NgpButton],
        });

        // Default config: autoSetButtonType: false
        expect(screen.getByRole('button')).not.toHaveAttribute('type');
      });

      it('should set type="button" when autoSetButtonType is true', async () => {
        await render(`<button ngpButton>Click me</button>`, {
          imports: [NgpButton],
          providers: [provideButtonConfig({ autoSetButtonType: true })],
        });

        expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
      });
    });
  });

  // ============================================================================
  // State Methods (Imperative API)
  // ============================================================================
  describe('imperative state methods', () => {
    it('should expose setDisabled method', async () => {
      const { fixture } = await render(`<button ngpButton>Click me</button>`, {
        imports: [NgpButton],
      });

      const directive = fixture.debugElement.children[0].injector.get(NgpButton);
      expect(directive['state'].disabled()).toBe(false);

      directive.setDisabled(true);
      fixture.detectChanges();

      expect(directive['state'].disabled()).toBe(true);
      expect(screen.getByRole('button')).toHaveAttribute('data-disabled', '');
    });

    it('should expose setFocusableWhenDisabled method', async () => {
      const { fixture } = await render(`<button ngpButton [disabled]="true">Click me</button>`, {
        imports: [NgpButton],
      });

      const directive = fixture.debugElement.children[0].injector.get(NgpButton);
      expect(directive['state'].focusableWhenDisabled()).toBe(false);
      expect(screen.getByRole('button')).toHaveAttribute('disabled');

      directive.setFocusableWhenDisabled(true);
      fixture.detectChanges();

      expect(directive['state'].focusableWhenDisabled()).toBe(true);
      expect(screen.getByRole('button')).not.toHaveAttribute('disabled');
      expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true');
    });
  });

  // ============================================================================
  // Edge Cases
  // ============================================================================
  describe('edge cases', () => {
    it('should handle rapid disabled state changes', async () => {
      const { rerender } = await render(
        `<button ngpButton [disabled]="isDisabled">Click me</button>`,
        {
          imports: [NgpButton],
          componentProperties: { isDisabled: false },
        },
      );

      const button = screen.getByRole('button');

      await rerender({ componentProperties: { isDisabled: true } });
      expect(button).toHaveAttribute('disabled');

      await rerender({ componentProperties: { isDisabled: false } });
      expect(button).not.toHaveAttribute('disabled');

      await rerender({ componentProperties: { isDisabled: true } });
      expect(button).toHaveAttribute('disabled');

      await rerender({ componentProperties: { isDisabled: false } });
      expect(button).not.toHaveAttribute('disabled');
    });

    it('should handle toggling focusableWhenDisabled while disabled', async () => {
      const { rerender } = await render(
        `<button ngpButton [disabled]="true" [focusableWhenDisabled]="focusable">Click me</button>`,
        {
          imports: [NgpButton],
          componentProperties: { focusable: false },
        },
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('disabled');
      expect(button).not.toHaveAttribute('aria-disabled');

      await rerender({ componentProperties: { focusable: true } });
      expect(button).not.toHaveAttribute('disabled');
      expect(button).toHaveAttribute('aria-disabled', 'true');

      await rerender({ componentProperties: { focusable: false } });
      expect(button).toHaveAttribute('disabled');
      expect(button).not.toHaveAttribute('aria-disabled');
    });

    it('should work correctly on span elements with autoSetButtonRole', async () => {
      const handleClick = jest.fn();
      await render(`<span ngpButton (click)="onClick()">Click me</span>`, {
        imports: [NgpButton],
        providers: [provideButtonConfig({ autoSetButtonRole: true })],
        componentProperties: { onClick: handleClick },
      });

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('role', 'button');
      expect(button).toHaveAttribute('tabindex', '0');

      button.focus();
      fireEvent.keyDown(button, { key: 'Enter' });
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should prevent scroll on Space key for non-native elements', async () => {
      await render(`<div ngpButton>Click me</div>`, {
        imports: [NgpButton],
        providers: [provideButtonConfig({ autoSetButtonRole: true })],
      });

      const button = screen.getByRole('button');
      button.focus();

      const event = new KeyboardEvent('keydown', {
        key: ' ',
        bubbles: true,
        cancelable: true,
      });
      const preventDefaultSpy = jest.spyOn(event, 'preventDefault');

      button.dispatchEvent(event);
      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('should not double-click on Enter for native buttons', async () => {
      const handleClick = jest.fn();
      await render(`<button ngpButton (click)="onClick()">Click me</button>`, {
        imports: [NgpButton],
        componentProperties: { onClick: handleClick },
      });

      const button = screen.getByRole('button');
      button.focus();

      // Simulating Enter key - browser would trigger click, but our handler
      // checks isButton and skips
      fireEvent.keyDown(button, { key: 'Enter' });

      // Our handler should not have triggered click (isButton check)
      expect(handleClick).not.toHaveBeenCalled();
    });
  });
});
