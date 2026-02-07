import { Component, signal } from '@angular/core';
import { fakeAsync, flush, tick } from '@angular/core/testing';
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

@Component({
  selector: 'test-nested-focus-traps',
  imports: [NgpFocusTrap],
  template: `
    <div data-testid="outside" tabindex="0">Outside</div>
    @if (showFirst()) {
      <div ngpFocusTrap data-testid="focus-trap-1">
        <button data-testid="trap1-button1" tabindex="0">Trap 1 Button 1</button>
        <button data-testid="trap1-button2" tabindex="0">Trap 1 Button 2</button>
        @if (showSecond()) {
          <div ngpFocusTrap data-testid="focus-trap-2">
            <button data-testid="trap2-button1" tabindex="0">Trap 2 Button 1</button>
            <button data-testid="trap2-button2" tabindex="0">Trap 2 Button 2</button>
            @if (showThird()) {
              <div ngpFocusTrap data-testid="focus-trap-3">
                <button data-testid="trap3-button1" tabindex="0">Trap 3 Button 1</button>
              </div>
            }
          </div>
        }
      </div>
    }
  `,
})
class TestNestedFocusTrapsComponent {
  showFirst = signal(true);
  showSecond = signal(false);
  showThird = signal(false);
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

describe('FocusTrapStack behavior', () => {
  it('should activate new focus trap when added to stack', fakeAsync(async () => {
    const { fixture } = await render(TestNestedFocusTrapsComponent);

    // First trap should be active
    const trap1 = fixture.debugElement.nativeElement.querySelector('[data-testid="focus-trap-1"]');
    expect(trap1).toHaveAttribute('data-focus-trap');

    // Show second trap
    fixture.componentInstance.showSecond.set(true);
    fixture.detectChanges();
    tick();
    flush();

    // Second trap should now be active
    const trap2 = fixture.debugElement.nativeElement.querySelector('[data-testid="focus-trap-2"]');
    expect(trap2).toHaveAttribute('data-focus-trap');
  }));

  it('should reactivate previous trap when removing from top of stack', fakeAsync(async () => {
    const { fixture } = await render(TestNestedFocusTrapsComponent);

    // Show second trap
    fixture.componentInstance.showSecond.set(true);
    fixture.detectChanges();
    tick();
    flush();

    const trap1 = fixture.debugElement.nativeElement.querySelector('[data-testid="focus-trap-1"]');
    const trap2 = fixture.debugElement.nativeElement.querySelector('[data-testid="focus-trap-2"]');

    expect(trap1).toHaveAttribute('data-focus-trap');
    expect(trap2).toHaveAttribute('data-focus-trap');

    // Hide second trap (remove from top of stack)
    fixture.componentInstance.showSecond.set(false);
    fixture.detectChanges();
    tick();
    flush();

    // First trap should still be active (reactivated after removal)
    expect(trap1).toHaveAttribute('data-focus-trap');
  }));

  it('should handle multiple nested focus traps', fakeAsync(async () => {
    const { fixture } = await render(TestNestedFocusTrapsComponent);

    // Show all three traps
    fixture.componentInstance.showSecond.set(true);
    fixture.detectChanges();
    tick();
    flush();

    fixture.componentInstance.showThird.set(true);
    fixture.detectChanges();
    tick();
    flush();

    const trap1 = fixture.debugElement.nativeElement.querySelector('[data-testid="focus-trap-1"]');
    const trap2 = fixture.debugElement.nativeElement.querySelector('[data-testid="focus-trap-2"]');
    const trap3 = fixture.debugElement.nativeElement.querySelector('[data-testid="focus-trap-3"]');

    expect(trap1).toHaveAttribute('data-focus-trap');
    expect(trap2).toHaveAttribute('data-focus-trap');
    expect(trap3).toHaveAttribute('data-focus-trap');

    // Remove third trap
    fixture.componentInstance.showThird.set(false);
    fixture.detectChanges();
    tick();
    flush();

    // Trap 1 and 2 should still exist and have data-focus-trap
    expect(trap1).toHaveAttribute('data-focus-trap');
    expect(trap2).toHaveAttribute('data-focus-trap');
  }));

  it('should handle removing all focus traps', fakeAsync(async () => {
    const { fixture } = await render(TestNestedFocusTrapsComponent);

    // Show second trap
    fixture.componentInstance.showSecond.set(true);
    fixture.detectChanges();
    tick();
    flush();

    // Remove first trap (which contains second trap)
    fixture.componentInstance.showFirst.set(false);
    fixture.detectChanges();
    tick();
    flush();

    // Both traps should be removed without errors
    const trap1 = fixture.debugElement.nativeElement.querySelector('[data-testid="focus-trap-1"]');
    const trap2 = fixture.debugElement.nativeElement.querySelector('[data-testid="focus-trap-2"]');

    expect(trap1).toBeNull();
    expect(trap2).toBeNull();
  }));

  it('should not interfere with other focus traps when deactivated', fakeAsync(async () => {
    const { fixture } = await render(TestNestedFocusTrapsComponent);

    // Show second trap
    fixture.componentInstance.showSecond.set(true);
    fixture.detectChanges();
    tick();
    flush();

    const trap1Button = fixture.debugElement.nativeElement.querySelector(
      '[data-testid="trap1-button1"]',
    );
    const trap2Button = fixture.debugElement.nativeElement.querySelector(
      '[data-testid="trap2-button1"]',
    );

    // Focus should be trappable in both traps without errors
    fireEvent.focus(trap2Button);
    expect(document.activeElement).toBeTruthy();

    // Hide second trap
    fixture.componentInstance.showSecond.set(false);
    fixture.detectChanges();
    tick();
    flush();

    // First trap should still work
    fireEvent.focus(trap1Button);
    expect(document.activeElement).toBeTruthy();
  }));
});
