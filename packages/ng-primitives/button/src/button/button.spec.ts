import { FocusMonitor } from '@angular/cdk/a11y';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { fireEvent, render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { NgpButton } from './button';

describe('NgpButton', () => {
  describe('disabled state', () => {
    describe('native button', () => {
      it('should set the disabled attribute when disabled', async () => {
        await render(`<button ngpButton [disabled]="true">Click me</button>`, {
          imports: [NgpButton],
        });

        expect(screen.getByRole('button')).toHaveAttribute('disabled');
      });

      it('should not set the disabled attribute when not disabled', async () => {
        await render(`<button ngpButton>Click me</button>`, {
          imports: [NgpButton],
        });

        expect(screen.getByRole('button')).not.toHaveAttribute('disabled');
      });

      it('should update disabled attribute when disabled changes', async () => {
        const { rerender, fixture } = await render(
          `<button ngpButton [disabled]="isDisabled">Click me</button>`,
          {
            imports: [NgpButton],
            componentProperties: { isDisabled: false },
          },
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
        const container = await render(`<a ngpButton [disabled]="true">Link</a>`, {
          imports: [NgpButton],
        });

        const anchor = container.debugElement.queryAll(By.css('a'));
        expect(anchor.length).toBe(1);
        expect(anchor[0].nativeElement).not.toHaveAttribute('disabled');
      });

      it('should not set the disabled attribute on div elements', async () => {
        await render(`<div ngpButton [disabled]="true">Custom</div>`, {
          imports: [NgpButton],
        });

        const div = screen.getByRole('button');
        expect(div).not.toHaveAttribute('disabled');
      });
    });
  });

  describe('data-disabled attribute', () => {
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
      const { rerender, fixture } = await render(
        `<button ngpButton [disabled]="isDisabled">Click me</button>`,
        {
          imports: [NgpButton],
          componentProperties: { isDisabled: false },
        },
      );

      const button = screen.getByRole('button');
      expect(button).not.toHaveAttribute('data-disabled');

      await rerender({ componentProperties: { isDisabled: true } });
      fixture.detectChanges();
      expect(button).toHaveAttribute('data-disabled', '');
    });

    it('should set data-disabled on non-native elements when disabled', async () => {
      await render(`<div ngpButton [disabled]="true">Custom</div>`, {
        imports: [NgpButton],
      });

      expect(screen.getByRole('button')).toHaveAttribute('data-disabled', '');
    });
  });

  describe('role attribute', () => {
    it('should not add role="button" to native button elements', async () => {
      await render(`<button ngpButton>Click me</button>`, {
        imports: [NgpButton],
      });

      // Native buttons have implicit button role, no explicit attribute needed
      const button = screen.getByRole('button');
      expect(button.tagName).toBe('BUTTON');
    });

    it('should add role="button" to non-native elements without explicit role', async () => {
      await render(`<div ngpButton>Custom Button</div>`, {
        imports: [NgpButton],
      });

      const div = screen.getByRole('button');
      expect(div).toHaveAttribute('role', 'button');
    });

    it('should not override explicit role attribute', async () => {
      await render(`<div ngpButton role="menuitem">Menu Item</div>`, {
        imports: [NgpButton],
      });

      const div = screen.getByRole('menuitem');
      expect(div).toHaveAttribute('role', 'menuitem');
    });

    it('should preserve link role for anchors with href', async () => {
      const container = await render(`<a ngpButton href="/test">Link</a>`, {
        imports: [NgpButton],
      });

      const link = container.debugElement.query(By.css('a'));
      expect(link.nativeElement).not.toHaveAttribute('role', 'button');
    });
  });

  describe('click handling', () => {
    it('should call click handler when clicked', async () => {
      const handleClick = jest.fn();
      await render(`<button ngpButton (click)="onClick()">Click me</button>`, {
        imports: [NgpButton],
        componentProperties: { onClick: handleClick },
      });

      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should prevent click when disabled', async () => {
      const handleClick = jest.fn();
      await render(`<button ngpButton [disabled]="true" (click)="onClick()">Click me</button>`, {
        imports: [NgpButton],
        componentProperties: { onClick: handleClick },
      });

      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should stop click event propagation when disabled', async () => {
      await render(`<button ngpButton [disabled]="true">Click me</button>`, {
        imports: [NgpButton],
      });

      const button = screen.getByRole('button');
      const clickEvent = new MouseEvent('click', { bubbles: true });
      const stopSpy = jest.spyOn(clickEvent, 'stopImmediatePropagation');

      button.dispatchEvent(clickEvent);
      expect(stopSpy).toHaveBeenCalled();
    });
  });

  describe('keyboard interactions (non-native elements)', () => {
    it('should trigger click on Enter keydown for non-native elements', async () => {
      const handleClick = jest.fn();
      await render(`<div ngpButton (click)="onClick()">Custom Button</div>`, {
        imports: [NgpButton],
        componentProperties: { onClick: handleClick },
      });

      const div = screen.getByRole('button');
      div.focus();
      fireEvent.keyDown(div, { key: 'Enter' });

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should trigger click on Space keyup for non-native elements', async () => {
      const handleClick = jest.fn();
      await render(`<div ngpButton (click)="onClick()">Custom Button</div>`, {
        imports: [NgpButton],
        componentProperties: { onClick: handleClick },
      });

      const div = screen.getByRole('button');
      div.focus();
      fireEvent.keyDown(div, { key: ' ' });
      fireEvent.keyUp(div, { key: ' ' });

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should prevent default on Space keydown to avoid page scroll', async () => {
      await render(`<div ngpButton>Custom Button</div>`, {
        imports: [NgpButton],
      });

      const div = screen.getByRole('button');
      const spaceEvent = new KeyboardEvent('keydown', { key: ' ', bubbles: true });
      const preventSpy = jest.spyOn(spaceEvent, 'preventDefault');

      div.dispatchEvent(spaceEvent);
      expect(preventSpy).toHaveBeenCalled();
    });

    it('should prevent default on Enter keydown for non-native elements', async () => {
      await render(`<div ngpButton>Custom Button</div>`, {
        imports: [NgpButton],
      });

      const div = screen.getByRole('button');
      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
      const preventSpy = jest.spyOn(enterEvent, 'preventDefault');

      div.dispatchEvent(enterEvent);
      expect(preventSpy).toHaveBeenCalled();
    });

    it('should not trigger click on keyboard for native buttons (browser handles it)', async () => {
      const handleClick = jest.fn();
      await render(`<button ngpButton (click)="onClick()">Click me</button>`, {
        imports: [NgpButton],
        componentProperties: { onClick: handleClick },
      });

      const button = screen.getByRole('button');
      button.focus();

      // For native buttons, the browser handles Enter/Space -> click
      // NgpButton should not duplicate this behavior
      // This test verifies our keydown handler doesn't fire extra clicks
      fireEvent.keyDown(button, { key: 'Enter' });
      fireEvent.keyUp(button, { key: 'Enter' });

      // Click count should be 0 because we're using fireEvent.keyDown, not actual key press
      // The native button click-on-enter happens at the browser level
      expect(handleClick).toHaveBeenCalledTimes(0);
    });

    it('should not trigger click on keyboard when disabled', async () => {
      const handleClick = jest.fn();
      await render(`<div ngpButton [disabled]="true" (click)="onClick()">Custom Button</div>`, {
        imports: [NgpButton],
        componentProperties: { onClick: handleClick },
      });

      const div = screen.getByRole('button');
      div.focus();
      fireEvent.keyDown(div, { key: 'Enter' });
      fireEvent.keyDown(div, { key: ' ' });
      fireEvent.keyUp(div, { key: ' ' });

      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should not trigger click for keys other than Enter/Space', async () => {
      const handleClick = jest.fn();
      await render(`<div ngpButton (click)="onClick()">Custom Button</div>`, {
        imports: [NgpButton],
        componentProperties: { onClick: handleClick },
      });

      const div = screen.getByRole('button');
      div.focus();
      fireEvent.keyDown(div, { key: 'a' });
      fireEvent.keyDown(div, { key: 'Escape' });
      fireEvent.keyDown(div, { key: 'Tab' });

      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should only trigger click when target is the button itself', async () => {
      const handleClick = jest.fn();
      await render(`<div ngpButton (click)="onClick()"><span>Nested content</span></div>`, {
        imports: [NgpButton],
        componentProperties: { onClick: handleClick },
      });

      const span = screen.getByText('Nested content');
      fireEvent.keyDown(span, { key: 'Enter' });

      // Click should not be triggered because target is not the button
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('interaction states', () => {
    describe('hover state', () => {
      it('should add data-hover attribute when hovered', async () => {
        await render(`<button ngpButton>Click me</button>`, {
          imports: [NgpButton],
        });

        const button = screen.getByRole('button');
        fireEvent.mouseEnter(button);
        expect(button).toHaveAttribute('data-hover', '');
      });

      it('should remove data-hover attribute when not hovered', async () => {
        await render(`<button ngpButton>Click me</button>`, {
          imports: [NgpButton],
        });

        const button = screen.getByRole('button');
        fireEvent.mouseEnter(button);
        expect(button).toHaveAttribute('data-hover', '');
        fireEvent.mouseLeave(button);
        expect(button).not.toHaveAttribute('data-hover');
      });

      it('should not add data-hover when disabled', async () => {
        await render(`<button ngpButton [disabled]="true">Click me</button>`, {
          imports: [NgpButton],
        });

        const button = screen.getByRole('button');
        fireEvent.mouseEnter(button);
        expect(button).not.toHaveAttribute('data-hover');
      });
    });

    describe('press state', () => {
      it('should add data-press attribute when pressed', async () => {
        await render(`<button ngpButton>Click me</button>`, {
          imports: [NgpButton],
        });

        const button = screen.getByRole('button');
        fireEvent.pointerDown(button);
        expect(button).toHaveAttribute('data-press', '');
      });

      it('should remove data-press attribute when released', async () => {
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
    });

    describe('focus-visible state', () => {
      it('should add data-focus-visible attribute when keyboard focused', async () => {
        await render(`<button ngpButton>Click me</button>`, {
          imports: [NgpButton],
        });

        const focusMonitor = TestBed.inject(FocusMonitor);
        const button = screen.getByRole('button');

        focusMonitor.focusVia(button, 'keyboard');
        expect(button).toHaveAttribute('data-focus-visible');
      });

      it('should remove data-focus-visible attribute when blurred', async () => {
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

      it('should not add data-focus-visible when disabled', async () => {
        await render(`<button ngpButton [disabled]="true">Click me</button>`, {
          imports: [NgpButton],
        });

        const focusMonitor = TestBed.inject(FocusMonitor);
        const button = screen.getByRole('button');

        focusMonitor.focusVia(button, 'keyboard');
        expect(button).not.toHaveAttribute('data-focus-visible');
      });
    });
  });

  describe('programmatic state changes', () => {
    it('should support setDisabled method', async () => {
      const { fixture } = await render(`<button ngpButton #ref="ngpButton">Click me</button>`, {
        imports: [NgpButton],
      });

      const button = screen.getByRole('button');
      expect(button).not.toHaveAttribute('disabled');

      const directive = fixture.debugElement.children[0].references['ref'] as NgpButton;
      directive.setDisabled(true);
      fixture.detectChanges();

      expect(button).toHaveAttribute('disabled');
      expect(button).toHaveAttribute('data-disabled', '');
    });
  });

  describe('with different element types', () => {
    it('should work with button elements', async () => {
      await render(`<button ngpButton>Button</button>`, {
        imports: [NgpButton],
      });

      const button = screen.getByRole('button');
      expect(button.tagName).toBe('BUTTON');
    });

    it('should work with anchor elements', async () => {
      const container = await render(`<a ngpButton href="#">Link</a>`, {
        imports: [NgpButton],
      });

      const link = container.debugElement.query(By.css('a'));
      expect(link.nativeElement.tagName).toBe('A');
    });

    it('should work with div elements and add role', async () => {
      await render(`<div ngpButton>Custom</div>`, {
        imports: [NgpButton],
      });

      const div = screen.getByRole('button');
      expect(div.tagName).toBe('DIV');
      expect(div).toHaveAttribute('role', 'button');
    });

    it('should work with span elements and add role', async () => {
      await render(`<span ngpButton>Custom</span>`, {
        imports: [NgpButton],
      });

      const span = screen.getByRole('button');
      expect(span.tagName).toBe('SPAN');
      expect(span).toHaveAttribute('role', 'button');
    });

    it('should work with input[type="button"] elements', async () => {
      await render(`<input ngpButton type="button" value="Input Button" />`, {
        imports: [NgpButton],
      });

      const input = screen.getByRole('button');
      expect(input.tagName).toBe('INPUT');
    });

    it('should work with input[type="submit"] elements', async () => {
      await render(`<input ngpButton type="submit" value="Submit" />`, {
        imports: [NgpButton],
      });

      const input = screen.getByRole('button');
      expect(input.tagName).toBe('INPUT');
    });
  });

  describe('tab navigation', () => {
    it('should be focusable via Tab key', async () => {
      await render(
        `
        <input type="text" />
        <button ngpButton>Button</button>
      `,
        { imports: [NgpButton] },
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
        <button ngpButton [disabled]="true">Disabled</button>
        <button ngpButton>Enabled</button>
      `,
        { imports: [NgpButton] },
      );

      const user = userEvent.setup();
      const enabledButton = screen.getByRole('button', { name: 'Enabled' });

      await user.tab();
      await user.tab();
      expect(enabledButton).toHaveFocus();
    });
  });

  describe('anchor button behavior', () => {
    it('should not trigger keyboard click on anchors with href (browser handles navigation)', async () => {
      const handleClick = jest.fn();
      await render(`<a ngpButton href="/test" (click)="onClick()">Link</a>`, {
        imports: [NgpButton],
        componentProperties: { onClick: handleClick },
      });

      const link = screen.getByRole('link');
      link.focus();
      fireEvent.keyDown(link, { key: 'Enter' });

      // Anchors with href should be handled by browser, not our code
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should trigger keyboard click on anchors without href', async () => {
      const handleClick = jest.fn();
      await render(`<a ngpButton (click)="onClick()">Custom Action</a>`, {
        imports: [NgpButton],
        componentProperties: { onClick: handleClick },
      });

      const button = screen.getByRole('button');
      button.focus();
      fireEvent.keyDown(button, { key: 'Enter' });

      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('initial attribute values (HostAttributeToken)', () => {
    describe('role attribute initialization', () => {
      it('should preserve role="menuitem" from static attribute', async () => {
        await render(`<div ngpButton role="menuitem">Menu Item</div>`, {
          imports: [NgpButton],
        });

        expect(screen.getByRole('menuitem')).toHaveAttribute('role', 'menuitem');
      });

      it('should preserve role="tab" from static attribute', async () => {
        await render(`<div ngpButton role="tab">Tab</div>`, {
          imports: [NgpButton],
        });

        expect(screen.getByRole('tab')).toHaveAttribute('role', 'tab');
      });

      it('should preserve role="option" from static attribute', async () => {
        await render(`<div ngpButton role="option">Option</div>`, {
          imports: [NgpButton],
        });

        expect(screen.getByRole('option')).toHaveAttribute('role', 'option');
      });

      it('should preserve role="switch" from static attribute', async () => {
        await render(`<div ngpButton role="switch">Toggle</div>`, {
          imports: [NgpButton],
        });

        expect(screen.getByRole('switch')).toHaveAttribute('role', 'switch');
      });

      it('should add role="button" to div without explicit role', async () => {
        await render(`<div ngpButton>Custom Button</div>`, {
          imports: [NgpButton],
        });

        expect(screen.getByRole('button')).toHaveAttribute('role', 'button');
      });

      it('should add role="button" to span without explicit role', async () => {
        await render(`<span ngpButton>Custom Button</span>`, {
          imports: [NgpButton],
        });

        expect(screen.getByRole('button')).toHaveAttribute('role', 'button');
      });

      it('should not add explicit role to native button', async () => {
        await render(`<button ngpButton>Click me</button>`, {
          imports: [NgpButton],
        });

        // Native buttons have implicit button role, no explicit attribute added
        const button = screen.getByRole('button');
        expect(button.tagName).toBe('BUTTON');
        // The role attribute should not be explicitly set
        expect(button.getAttribute('role')).toBeNull();
      });

      it('should prefer property binding over static attribute for role', async () => {
        await render(`<div ngpButton role="menuitem" [role]="'tab'">Item</div>`, {
          imports: [NgpButton],
        });

        expect(screen.getByRole('tab')).toHaveAttribute('role', 'tab');
      });

      it('should allow removing role with null via property binding', async () => {
        const container = await render(`<div ngpButton [role]="null">Custom</div>`, {
          imports: [NgpButton],
        });

        const div = container.debugElement.query(By.css('div'));
        // When role is explicitly set to null, no role should be added
        expect(div.nativeElement.getAttribute('role')).toBeNull();
      });
    });

    describe('programmatic role changes with initial attribute', () => {
      it('should allow setRole to override initial attribute', async () => {
        const { fixture } = await render(
          `<div ngpButton role="menuitem" #ref="ngpButton">Item</div>`,
          {
            imports: [NgpButton],
          },
        );

        const div = screen.getByRole('menuitem');
        expect(div).toHaveAttribute('role', 'menuitem');

        const directive = fixture.debugElement.children[0].references['ref'] as NgpButton;
        directive.setRole('tab');
        fixture.detectChanges();

        expect(div).toHaveAttribute('role', 'tab');
      });

      it('should allow setRole to remove role with null', async () => {
        const { fixture } = await render(
          `<div ngpButton role="menuitem" #ref="ngpButton">Item</div>`,
          {
            imports: [NgpButton],
          },
        );

        const div = screen.getByRole('menuitem');
        expect(div).toHaveAttribute('role', 'menuitem');

        const directive = fixture.debugElement.children[0].references['ref'] as NgpButton;
        directive.setRole(null);
        fixture.detectChanges();

        expect(div.getAttribute('role')).toBeNull();
      });

      it('should allow setRole to set undefined for automatic role assignment', async () => {
        const { fixture } = await render(
          `<div ngpButton role="menuitem" #ref="ngpButton">Item</div>`,
          {
            imports: [NgpButton],
          },
        );

        const div = screen.getByRole('menuitem');
        expect(div).toHaveAttribute('role', 'menuitem');

        const directive = fixture.debugElement.children[0].references['ref'] as NgpButton;
        directive.setRole(undefined);
        fixture.detectChanges();

        // Automatic assignment should add role="button" for div
        expect(div).toHaveAttribute('role', 'button');
      });
    });

    describe('role with disabled state', () => {
      it('should preserve custom role when disabled', async () => {
        await render(`<div ngpButton role="menuitem" [disabled]="true">Menu Item</div>`, {
          imports: [NgpButton],
        });

        expect(screen.getByRole('menuitem')).toHaveAttribute('role', 'menuitem');
        expect(screen.getByRole('menuitem')).toHaveAttribute('data-disabled', '');
      });

      it('should preserve custom role through disabled state changes', async () => {
        const { rerender, fixture } = await render(
          `<div ngpButton role="tab" [disabled]="isDisabled">Tab</div>`,
          {
            imports: [NgpButton],
            componentProperties: { isDisabled: false },
          },
        );

        const div = screen.getByRole('tab');
        expect(div).toHaveAttribute('role', 'tab');

        await rerender({ componentProperties: { isDisabled: true } });
        fixture.detectChanges();
        expect(div).toHaveAttribute('role', 'tab');
        expect(div).toHaveAttribute('data-disabled', '');

        await rerender({ componentProperties: { isDisabled: false } });
        fixture.detectChanges();
        expect(div).toHaveAttribute('role', 'tab');
        expect(div).not.toHaveAttribute('data-disabled');
      });
    });
  });
});
