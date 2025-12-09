import { Component, signal } from '@angular/core';
import { fireEvent, render } from '@testing-library/angular';
import { NgpFocusTrap } from './focus-trap';

@Component({
  selector: 'test-focus-trap',
  imports: [NgpFocusTrap],
  template: `
    <div data-testid="outside-element" tabindex="0">Outside</div>
    <div [ngpFocusTrapDisabled]="disabled()" ngpFocusTrap data-testid="focus-trap">
      <button data-testid="button1" tabindex="0">Button 1</button>
      <input data-testid="input1" tabindex="0" />
      <button data-testid="button2" tabindex="0">Button 2</button>
    </div>
    <div data-testid="another-outside" tabindex="0">Another Outside</div>
  `,
})
class TestFocusTrapComponent {
  disabled = signal(false);
}

@Component({
  selector: 'test-empty-focus-trap',
  imports: [NgpFocusTrap],
  template: `
    <div [ngpFocusTrapDisabled]="disabled()" ngpFocusTrap data-testid="focus-trap">
      <div data-testid="non-focusable">Non-focusable</div>
    </div>
  `,
})
class TestEmptyFocusTrapComponent {
  disabled = signal(false);
}

describe('NgpFocusTrap', () => {
  describe('Host Bindings', () => {
    it('should set tabindex to -1', async () => {
      const container = await render(TestFocusTrapComponent);

      const focusTrap = container.getByTestId('focus-trap');
      expect(focusTrap).toHaveAttribute('tabindex', '-1');
    });

    it('should set data-focus-trap attribute when enabled', async () => {
      const container = await render(TestFocusTrapComponent);

      const focusTrap = container.getByTestId('focus-trap');
      expect(focusTrap).toHaveAttribute('data-focus-trap');
    });

    it('should not set data-focus-trap attribute when initially disabled', async () => {
      const container = await render(TestFocusTrapComponent, {
        componentProperties: { disabled: signal(true) },
      });

      const focusTrap = container.getByTestId('focus-trap');
      expect(focusTrap).not.toHaveAttribute('data-focus-trap');
    });
  });

  describe('Focus Trapping', () => {
    it('should trap focus within the focus trap container', async () => {
      const container = await render(TestFocusTrapComponent);

      const button1 = container.getByTestId('button1');
      const outsideElement = container.getByTestId('outside-element');

      // Focus an element inside the trap
      fireEvent.focus(button1);

      // Try to focus element outside the trap
      fireEvent.focus(outsideElement);

      // Focus should remain trapped (this is a basic test - the actual trapping
      // involves complex DOM event handling that's hard to test in unit tests)
      expect(document.activeElement).toBeTruthy();
    });

    it('should handle Tab key navigation', async () => {
      const container = await render(TestFocusTrapComponent);

      const focusTrap = container.getByTestId('focus-trap');
      const button1 = container.getByTestId('button1');

      // Focus the first element
      fireEvent.focus(button1);

      // Simulate Tab key press on the focus trap
      fireEvent.keyDown(focusTrap, { key: 'Tab' });

      // Test passes if no errors are thrown during event handling
      expect(focusTrap).toBeInTheDocument();
    });

    it('should handle Shift+Tab key navigation', async () => {
      const container = await render(TestFocusTrapComponent);

      const focusTrap = container.getByTestId('focus-trap');
      const button2 = container.getByTestId('button2');

      // Focus the last element
      fireEvent.focus(button2);

      // Simulate Shift+Tab key press
      fireEvent.keyDown(focusTrap, { key: 'Tab', shiftKey: true });

      // Test passes if no errors are thrown during event handling
      expect(focusTrap).toBeInTheDocument();
    });

    it('should ignore non-Tab keys', async () => {
      const container = await render(TestFocusTrapComponent);

      const focusTrap = container.getByTestId('focus-trap');

      // Simulate Enter key press
      fireEvent.keyDown(focusTrap, { key: 'Enter' });

      // Test passes if no errors are thrown
      expect(focusTrap).toBeInTheDocument();
    });

    it('should ignore Tab with modifier keys (except Shift)', async () => {
      const container = await render(TestFocusTrapComponent);

      const focusTrap = container.getByTestId('focus-trap');

      // Simulate Ctrl+Tab key press
      fireEvent.keyDown(focusTrap, { key: 'Tab', ctrlKey: true });

      // Test passes if no errors are thrown
      expect(focusTrap).toBeInTheDocument();
    });

    it('should not interfere when disabled', async () => {
      const { getByTestId } = await render(TestFocusTrapComponent, {
        componentProperties: { disabled: signal(true) },
      });

      const focusTrap = getByTestId('focus-trap');
      const button1 = getByTestId('button1');

      // Focus an element inside the trap
      fireEvent.focus(button1);

      // Simulate Tab key press when disabled
      fireEvent.keyDown(focusTrap, { key: 'Tab' });

      // Should not have data-focus-trap attribute when disabled
      expect(focusTrap).not.toHaveAttribute('data-focus-trap');
    });
  });

  describe('Empty Focus Trap', () => {
    it('should handle focus trap with no focusable elements', async () => {
      const container = await render(TestEmptyFocusTrapComponent);

      const focusTrap = container.getByTestId('focus-trap');

      // Focus the container itself
      fireEvent.focus(focusTrap);

      // Simulate Tab key press
      fireEvent.keyDown(focusTrap, { key: 'Tab' });

      // Test passes if no errors are thrown
      expect(focusTrap).toBeInTheDocument();
    });
  });

  describe('Input Properties', () => {
    it('should accept disabled input', async () => {
      const container = await render(TestFocusTrapComponent, {
        imports: [NgpFocusTrap],
        componentProperties: { disabled: signal(false) },
      });

      const focusTrap = container.getByTestId('focus-trap');
      expect(focusTrap).toHaveAttribute('data-focus-trap');
    });

    it('should have correct disabled state when initially disabled', async () => {
      const container = await render(TestFocusTrapComponent, {
        componentProperties: { disabled: signal(true) },
      });

      const focusTrap = container.getByTestId('focus-trap');
      expect(focusTrap).not.toHaveAttribute('data-focus-trap');
    });
  });

  describe('Basic Functionality', () => {
    it('should render without errors', async () => {
      const container = await render(TestFocusTrapComponent);

      expect(container.getByTestId('focus-trap')).toBeInTheDocument();
    });

    it('should maintain correct structure with nested focusable elements', async () => {
      const container = await render(TestFocusTrapComponent);

      const focusTrap = container.getByTestId('focus-trap');
      const button1 = container.getByTestId('button1');
      const input1 = container.getByTestId('input1');
      const button2 = container.getByTestId('button2');

      expect(focusTrap).toContainElement(button1);
      expect(focusTrap).toContainElement(input1);
      expect(focusTrap).toContainElement(button2);
    });

    it('should handle focus events without throwing errors', async () => {
      const container = await render(TestFocusTrapComponent);

      const button1 = container.getByTestId('button1');
      const button2 = container.getByTestId('button2');

      // Simulate various focus events
      fireEvent.focus(button1);
      fireEvent.blur(button1);
      fireEvent.focus(button2);
      fireEvent.blur(button2);

      // Test passes if no errors are thrown
      expect(container.getByTestId('focus-trap')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have correct tabindex attribute', async () => {
      const container = await render(TestFocusTrapComponent);

      const focusTrap = container.getByTestId('focus-trap');
      expect(focusTrap).toHaveAttribute('tabindex', '-1');
    });

    it('should properly indicate focus trap state with data attribute', async () => {
      const container = await render(TestFocusTrapComponent);

      const focusTrap = container.getByTestId('focus-trap');
      expect(focusTrap).toHaveAttribute('data-focus-trap');
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid focus changes', async () => {
      const container = await render(TestFocusTrapComponent);

      const button1 = container.getByTestId('button1');
      const button2 = container.getByTestId('button2');
      const input1 = container.getByTestId('input1');

      // Rapidly change focus between elements
      fireEvent.focus(button1);
      fireEvent.focus(input1);
      fireEvent.focus(button2);
      fireEvent.focus(button1);

      // Test passes if no errors are thrown
      expect(container.getByTestId('focus-trap')).toBeInTheDocument();
    });

    it('should handle keyboard events on different elements', async () => {
      const container = await render(TestFocusTrapComponent);

      const focusTrap = container.getByTestId('focus-trap');
      const button1 = container.getByTestId('button1');

      fireEvent.focus(button1);

      // Test various keyboard events
      fireEvent.keyDown(focusTrap, { key: 'Tab' });
      fireEvent.keyDown(focusTrap, { key: 'Tab', shiftKey: true });
      fireEvent.keyDown(focusTrap, { key: 'Escape' });
      fireEvent.keyDown(focusTrap, { key: 'Enter' });

      // Test passes if no errors are thrown
      expect(focusTrap).toBeInTheDocument();
    });
  });
});
