import { FocusMonitor } from '@angular/cdk/a11y';
import { TestBed } from '@angular/core/testing';
import { fireEvent, render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { NgpFocusable } from './focusable';
import { provideFocusableConfig } from './focusable-config';

describe('NgpFocusable', () => {
  // ============================================================================
  // Native Button Tests
  // ============================================================================
  describe('native button', () => {
    it('should set tabindex="0" by default', async () => {
      await render(`<button ngpFocusable>Click me</button>`, {
        imports: [NgpFocusable],
      });

      expect(screen.getByRole('button')).toHaveAttribute('tabindex', '0');
    });

    it('should not set the disabled attribute when not disabled', async () => {
      await render(`<button ngpFocusable>Click me</button>`, {
        imports: [NgpFocusable],
      });

      expect(screen.getByRole('button')).not.toHaveAttribute('disabled');
    });

    it('should set the disabled attribute when disabled', async () => {
      await render(`<button ngpFocusable [ngpFocusableDisabled]="true">Click me</button>`, {
        imports: [NgpFocusable],
      });

      expect(screen.getByRole('button')).toHaveAttribute('disabled');
    });

    it('should set data-disabled when disabled', async () => {
      await render(`<button ngpFocusable [ngpFocusableDisabled]="true">Click me</button>`, {
        imports: [NgpFocusable],
      });

      expect(screen.getByRole('button')).toHaveAttribute('data-disabled', '');
    });

    it('should not set data-disabled when not disabled', async () => {
      await render(`<button ngpFocusable>Click me</button>`, {
        imports: [NgpFocusable],
      });

      expect(screen.getByRole('button')).not.toHaveAttribute('data-disabled');
    });

    it('should update data-disabled when disabled changes', async () => {
      const { rerender } = await render(
        `<button ngpFocusable [ngpFocusableDisabled]="isDisabled">Click me</button>`,
        {
          imports: [NgpFocusable],
          componentProperties: { isDisabled: false },
        },
      );

      const button = screen.getByRole('button');
      expect(button).not.toHaveAttribute('data-disabled');

      await rerender({ componentProperties: { isDisabled: true } });
      expect(button).toHaveAttribute('data-disabled', '');

      await rerender({ componentProperties: { isDisabled: false } });
      expect(button).not.toHaveAttribute('data-disabled');
    });

    it('should not set aria-disabled on native button when disabled without focusableWhenDisabled', async () => {
      await render(`<button ngpFocusable [ngpFocusableDisabled]="true">Click me</button>`, {
        imports: [NgpFocusable],
      });

      // Native buttons use the disabled attribute, not aria-disabled
      expect(screen.getByRole('button')).not.toHaveAttribute('aria-disabled');
    });
  });

  // ============================================================================
  // Non-Native Element Tests (div/span)
  // ============================================================================
  describe('non-native element (div/span)', () => {
    it('should set tabindex="0" for keyboard focusability', async () => {
      await render(`<div ngpFocusable>Click me</div>`, {
        imports: [NgpFocusable],
      });

      // ngpFocusable doesn't set role, so we query by text
      expect(screen.getByText('Click me')).toHaveAttribute('tabindex', '0');
    });

    it('should set tabindex="-1" when disabled to remove from tab order', async () => {
      await render(`<div ngpFocusable [ngpFocusableDisabled]="true">Click me</div>`, {
        imports: [NgpFocusable],
      });

      expect(screen.getByText('Click me')).toHaveAttribute('tabindex', '-1');
    });

    it('should set aria-disabled="true" when disabled', async () => {
      await render(`<div ngpFocusable [ngpFocusableDisabled]="true">Click me</div>`, {
        imports: [NgpFocusable],
      });

      expect(screen.getByText('Click me')).toHaveAttribute('aria-disabled', 'true');
    });

    it('should not set aria-disabled when not disabled', async () => {
      await render(`<div ngpFocusable>Click me</div>`, {
        imports: [NgpFocusable],
      });

      expect(screen.getByText('Click me')).not.toHaveAttribute('aria-disabled');
    });

    it('should not set the disabled attribute on non-native elements', async () => {
      await render(`<div ngpFocusable [ngpFocusableDisabled]="true">Click me</div>`, {
        imports: [NgpFocusable],
      });

      // Non-native elements don't have disabled attribute, they use aria-disabled
      expect(screen.getByText('Click me')).not.toHaveAttribute('disabled');
    });
  });

  // ============================================================================
  // focusableWhenDisabled Tests
  // ============================================================================
  describe('focusableWhenDisabled', () => {
    describe('on native button', () => {
      it('should allow disabled button to be focused', async () => {
        await render(
          `<button ngpFocusable [ngpFocusableDisabled]="true" [ngpFocusableWhenDisabled]="true">Click me</button>`,
          { imports: [NgpFocusable] },
        );

        const button = screen.getByRole('button');
        button.focus();
        expect(button).toHaveFocus();
      });

      it('should not set disabled attribute (uses aria-disabled instead)', async () => {
        await render(
          `<button ngpFocusable [ngpFocusableDisabled]="true" [ngpFocusableWhenDisabled]="true">Click me</button>`,
          { imports: [NgpFocusable] },
        );

        const button = screen.getByRole('button');
        expect(button).not.toHaveAttribute('disabled');
        expect(button).toHaveAttribute('aria-disabled', 'true');
      });

      it('should set data-focusable-when-disabled attribute', async () => {
        await render(`<button ngpFocusable [ngpFocusableWhenDisabled]="true">Click me</button>`, {
          imports: [NgpFocusable],
        });

        expect(screen.getByRole('button')).toHaveAttribute('data-focusable-when-disabled', '');
      });

      it('should keep tabindex="0" when disabled', async () => {
        await render(
          `<button ngpFocusable [ngpFocusableDisabled]="true" [ngpFocusableWhenDisabled]="true">Click me</button>`,
          { imports: [NgpFocusable] },
        );

        expect(screen.getByRole('button')).toHaveAttribute('tabindex', '0');
      });
    });

    describe('on non-native element', () => {
      it('should keep tabindex="0" when disabled', async () => {
        await render(
          `<div ngpFocusable [ngpFocusableDisabled]="true" [ngpFocusableWhenDisabled]="true">Click me</div>`,
          { imports: [NgpFocusable] },
        );

        expect(screen.getByText('Click me')).toHaveAttribute('tabindex', '0');
      });

      it('should allow focusing when disabled', async () => {
        await render(
          `<div ngpFocusable [ngpFocusableDisabled]="true" [ngpFocusableWhenDisabled]="true">Click me</div>`,
          { imports: [NgpFocusable] },
        );

        const element = screen.getByText('Click me');
        element.focus();
        expect(element).toHaveFocus();
      });
    });

    describe('keyboard interaction blocking', () => {
      it('should block non-Tab keys when disabled and focusableWhenDisabled', async () => {
        await render(
          `<button ngpFocusable [ngpFocusableDisabled]="true" [ngpFocusableWhenDisabled]="true">Click me</button>`,
          { imports: [NgpFocusable] },
        );

        const button = screen.getByRole('button');
        button.focus();

        const event = new KeyboardEvent('keydown', {
          key: 'Enter',
          bubbles: true,
          cancelable: true,
        });
        const preventDefaultSpy = jest.spyOn(event, 'preventDefault');
        const stopImmediatePropagationSpy = jest.spyOn(event, 'stopImmediatePropagation');

        button.dispatchEvent(event);

        expect(preventDefaultSpy).toHaveBeenCalled();
        expect(stopImmediatePropagationSpy).toHaveBeenCalled();
      });

      it('should allow Tab key when disabled and focusableWhenDisabled', async () => {
        await render(
          `
          <button ngpFocusable [ngpFocusableDisabled]="true" [ngpFocusableWhenDisabled]="true">First</button>
          <button ngpFocusable>Second</button>
        `,
          { imports: [NgpFocusable] },
        );

        const user = userEvent.setup();
        const firstButton = screen.getByRole('button', { name: 'First' });

        firstButton.focus();
        expect(firstButton).toHaveFocus();

        // Tab should work - focus moves to next element
        await user.tab();
        expect(screen.getByRole('button', { name: 'Second' })).toHaveFocus();
      });

      it('should not block keys when not disabled', async () => {
        await render(`<button ngpFocusable>Click me</button>`, {
          imports: [NgpFocusable],
        });

        const button = screen.getByRole('button');
        button.focus();

        const event = new KeyboardEvent('keydown', {
          key: 'Enter',
          bubbles: true,
          cancelable: true,
        });
        const preventDefaultSpy = jest.spyOn(event, 'preventDefault');

        button.dispatchEvent(event);

        expect(preventDefaultSpy).not.toHaveBeenCalled();
      });

      it('should not block keys when disabled but not focusableWhenDisabled', async () => {
        await render(`<button ngpFocusable [ngpFocusableDisabled]="true">Click me</button>`, {
          imports: [NgpFocusable],
        });

        const button = screen.getByRole('button');

        // Native disabled button won't even receive keyboard events in the same way
        // but our listener should not prevent if focusableWhenDisabled is false
        const event = new KeyboardEvent('keydown', {
          key: 'Enter',
          bubbles: true,
          cancelable: true,
        });
        const preventDefaultSpy = jest.spyOn(event, 'preventDefault');

        button.dispatchEvent(event);

        // The focusable primitive only prevents when BOTH disabled AND focusableWhenDisabled
        expect(preventDefaultSpy).not.toHaveBeenCalled();
      });
    });
  });

  // ============================================================================
  // Interaction States (ngpInteractions integration)
  // ============================================================================
  describe('interaction states', () => {
    it('should add data-hover when hovered', async () => {
      await render(`<button ngpFocusable>Click me</button>`, {
        imports: [NgpFocusable],
      });

      const button = screen.getByRole('button');
      fireEvent.mouseEnter(button);
      expect(button).toHaveAttribute('data-hover', '');
    });

    it('should remove data-hover when not hovered', async () => {
      await render(`<button ngpFocusable>Click me</button>`, {
        imports: [NgpFocusable],
      });

      const button = screen.getByRole('button');
      fireEvent.mouseEnter(button);
      expect(button).toHaveAttribute('data-hover', '');
      fireEvent.mouseLeave(button);
      expect(button).not.toHaveAttribute('data-hover');
    });

    it('should add data-press when pressed', async () => {
      await render(`<button ngpFocusable>Click me</button>`, {
        imports: [NgpFocusable],
      });

      const button = screen.getByRole('button');
      fireEvent.pointerDown(button);
      expect(button).toHaveAttribute('data-press', '');
    });

    it('should remove data-press when released', async () => {
      await render(`<button ngpFocusable>Click me</button>`, {
        imports: [NgpFocusable],
      });

      const button = screen.getByRole('button');
      fireEvent.pointerDown(button);
      expect(button).toHaveAttribute('data-press', '');
      fireEvent.pointerUp(button);
      expect(button).not.toHaveAttribute('data-press');
    });

    it('should add data-focus-visible when keyboard focused', async () => {
      await render(`<button ngpFocusable>Click me</button>`, {
        imports: [NgpFocusable],
      });

      const focusMonitor = TestBed.inject(FocusMonitor);
      const button = screen.getByRole('button');
      focusMonitor.focusVia(button, 'keyboard');
      expect(button).toHaveAttribute('data-focus-visible');
    });

    it('should remove data-focus-visible when blurred', async () => {
      await render(`<button ngpFocusable>Click me</button>`, {
        imports: [NgpFocusable],
      });

      const focusMonitor = TestBed.inject(FocusMonitor);
      const button = screen.getByRole('button');
      focusMonitor.focusVia(button, 'keyboard');
      expect(button).toHaveAttribute('data-focus-visible');
      fireEvent.blur(button);
      expect(button).not.toHaveAttribute('data-focus-visible');
    });

    describe('when hardDisabled (disabled && !focusableWhenDisabled)', () => {
      it('should not add data-hover when disabled', async () => {
        await render(`<button ngpFocusable [ngpFocusableDisabled]="true">Click me</button>`, {
          imports: [NgpFocusable],
        });

        const button = screen.getByRole('button');
        fireEvent.mouseEnter(button);
        expect(button).not.toHaveAttribute('data-hover');
      });

      it('should not add data-press when disabled', async () => {
        await render(`<button ngpFocusable [ngpFocusableDisabled]="true">Click me</button>`, {
          imports: [NgpFocusable],
        });

        const button = screen.getByRole('button');
        fireEvent.pointerDown(button);
        expect(button).not.toHaveAttribute('data-press');
      });

      it('should not add data-focus-visible when disabled', async () => {
        await render(`<button ngpFocusable [ngpFocusableDisabled]="true">Click me</button>`, {
          imports: [NgpFocusable],
        });

        const focusMonitor = TestBed.inject(FocusMonitor);
        const button = screen.getByRole('button');
        focusMonitor.focusVia(button, 'keyboard');
        expect(button).not.toHaveAttribute('data-focus-visible');
      });
    });

    describe('when focusableWhenDisabled (soft disabled)', () => {
      it('should still show data-focus-visible when focusableWhenDisabled', async () => {
        await render(
          `<button ngpFocusable [ngpFocusableDisabled]="true" [ngpFocusableWhenDisabled]="true">Click me</button>`,
          { imports: [NgpFocusable] },
        );

        const focusMonitor = TestBed.inject(FocusMonitor);
        const button = screen.getByRole('button');
        focusMonitor.focusVia(button, 'keyboard');
        // focusableWhenDisabled means hardDisabled is false, so focus-visible should work
        expect(button).toHaveAttribute('data-focus-visible');
      });

      it('should still show data-hover when focusableWhenDisabled', async () => {
        await render(
          `<button ngpFocusable [ngpFocusableDisabled]="true" [ngpFocusableWhenDisabled]="true">Click me</button>`,
          { imports: [NgpFocusable] },
        );

        const button = screen.getByRole('button');
        fireEvent.mouseEnter(button);
        expect(button).toHaveAttribute('data-hover', '');
      });

      it('should still show data-press when focusableWhenDisabled', async () => {
        await render(
          `<button ngpFocusable [ngpFocusableDisabled]="true" [ngpFocusableWhenDisabled]="true">Click me</button>`,
          { imports: [NgpFocusable] },
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
    describe('global configuration via provideFocusableConfig', () => {
      it('should respect autoManageTabIndex: false', async () => {
        await render(`<div ngpFocusable>Click me</div>`, {
          imports: [NgpFocusable],
          providers: [provideFocusableConfig({ autoManageTabIndex: false })],
        });

        // Without autoManageTabIndex, tabindex is not set
        expect(screen.getByText('Click me').getAttribute('tabindex')).toBe(null);
      });

      it('should respect autoManageAriaDisabled: false', async () => {
        await render(`<div ngpFocusable [ngpFocusableDisabled]="true">Click me</div>`, {
          imports: [NgpFocusable],
          providers: [provideFocusableConfig({ autoManageAriaDisabled: false })],
        });

        expect(screen.getByText('Click me')).not.toHaveAttribute('aria-disabled');
      });
    });
  });

  // ============================================================================
  // State Methods (Imperative API)
  // ============================================================================
  describe('imperative state methods', () => {
    it('should expose setDisabled method', async () => {
      const { fixture } = await render(`<button ngpFocusable>Click me</button>`, {
        imports: [NgpFocusable],
      });

      const directive = fixture.debugElement.children[0].injector.get(NgpFocusable);
      expect(directive['state'].disabled()).toBe(false);

      directive.setDisabled(true);
      fixture.detectChanges();

      expect(directive['state'].disabled()).toBe(true);
      expect(screen.getByRole('button')).toHaveAttribute('data-disabled', '');
    });

    it('should expose setFocusableWhenDisabled method', async () => {
      const { fixture } = await render(
        `<button ngpFocusable [ngpFocusableDisabled]="true">Click me</button>`,
        {
          imports: [NgpFocusable],
        },
      );

      const directive = fixture.debugElement.children[0].injector.get(NgpFocusable);
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
        `<button ngpFocusable [ngpFocusableDisabled]="isDisabled">Click me</button>`,
        {
          imports: [NgpFocusable],
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
        `<button ngpFocusable [ngpFocusableDisabled]="true" [ngpFocusableWhenDisabled]="focusable">Click me</button>`,
        {
          imports: [NgpFocusable],
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

    it('should work correctly on span elements', async () => {
      await render(`<span ngpFocusable>Click me</span>`, {
        imports: [NgpFocusable],
      });

      const span = screen.getByText('Click me');
      expect(span).toHaveAttribute('tabindex', '0');

      span.focus();
      expect(span).toHaveFocus();
    });

    it('should work correctly on anchor elements without href', async () => {
      await render(`<a ngpFocusable>Click me</a>`, {
        imports: [NgpFocusable],
      });

      const anchor = screen.getByText('Click me');
      expect(anchor).toHaveAttribute('tabindex', '0');
    });

    it('should work correctly on anchor elements with href', async () => {
      await render(`<a ngpFocusable href="https://example.com">Link</a>`, {
        imports: [NgpFocusable],
      });

      const anchor = screen.getByRole('link');
      expect(anchor).toHaveAttribute('tabindex', '0');
    });

    it('should set aria-disabled on anchor with href when disabled', async () => {
      await render(
        `<a ngpFocusable href="https://example.com" [ngpFocusableDisabled]="true">Link</a>`,
        { imports: [NgpFocusable] },
      );

      expect(screen.getByRole('link')).toHaveAttribute('aria-disabled', 'true');
    });
  });
});
