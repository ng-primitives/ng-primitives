import { Component, Directive, signal, viewChild } from '@angular/core';
import { fireEvent, render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { NgpButton } from 'ng-primitives/button';
import { injectElementRef } from 'ng-primitives/internal';
import { listener } from 'ng-primitives/state';
import { NgpSoftDisabled } from './soft-disabled';

expect.extend(toHaveNoViolations);

describe('NgpSoftDisabled + NgpButton composability', () => {
  describe('accessibility validation', () => {
    it('should have no a11y violations when soft disabled button is focusable', async () => {
      const { container } = await render(
        `<button ngpButton ngpSoftDisabled softDisabled="true">Focusable Disabled Button</button>`,
        { imports: [NgpButton, NgpSoftDisabled] },
      );

      const results = await axe(container, {
        rules: {
          // Ignore page-level rules that don't apply to component testing
          'document-title': { enabled: false },
          'html-has-lang': { enabled: false },
          'landmark-one-main': { enabled: false },
          'page-has-heading-one': { enabled: false },
          region: { enabled: false },
        },
      });

      expect(results).toHaveNoViolations();
    });

    it('should have no a11y violations when hard disabled', async () => {
      const { container } = await render(
        `<button ngpButton ngpSoftDisabled="false" [disabled]="true">Hard Disabled Button</button>`,
        { imports: [NgpButton, NgpSoftDisabled] },
      );

      const results = await axe(container, {
        rules: {
          'document-title': { enabled: false },
          'html-has-lang': { enabled: false },
          'landmark-one-main': { enabled: false },
          'page-has-heading-one': { enabled: false },
          region: { enabled: false },
        },
      });

      expect(results).toHaveNoViolations();
    });

    it('should have no a11y violations for non-native button with soft disabled', async () => {
      const { container } = await render(
        `<div ngpButton ngpSoftDisabled softDisabled="true">Custom Disabled Button</div>`,
        { imports: [NgpButton, NgpSoftDisabled] },
      );

      const results = await axe(container, {
        rules: {
          'document-title': { enabled: false },
          'html-has-lang': { enabled: false },
          'landmark-one-main': { enabled: false },
          'page-has-heading-one': { enabled: false },
          region: { enabled: false },
        },
      });

      expect(results).toHaveNoViolations();
    });

    it('should have no a11y violations for non-focusable soft disabled element', async () => {
      const { container } = await render(
        `<div ngpButton ngpSoftDisabled softDisabled="true" softDisabledFocusable="false">Non-Focusable</div>`,
        { imports: [NgpButton, NgpSoftDisabled] },
      );

      const results = await axe(container, {
        rules: {
          'document-title': { enabled: false },
          'html-has-lang': { enabled: false },
          'landmark-one-main': { enabled: false },
          'page-has-heading-one': { enabled: false },
          region: { enabled: false },
        },
      });

      expect(results).toHaveNoViolations();
    });

    it('should have no a11y violations for enabled button', async () => {
      const { container } = await render(
        `<button ngpButton ngpSoftDisabled="false">Enabled Button</button>`,
        { imports: [NgpButton, NgpSoftDisabled] },
      );

      const results = await axe(container, {
        rules: {
          'document-title': { enabled: false },
          'html-has-lang': { enabled: false },
          'landmark-one-main': { enabled: false },
          'page-has-heading-one': { enabled: false },
          region: { enabled: false },
        },
      });

      expect(results).toHaveNoViolations();
    });
  });

  describe('attribute composition', () => {
    it('should set tabindex="0" when composed', async () => {
      await render(`<button ngpButton ngpSoftDisabled softDisabled="true">Click me</button>`, {
        imports: [NgpButton, NgpSoftDisabled],
      });

      expect(screen.getByRole('button')).toHaveAttribute('tabindex', '0');
    });

    it('should not set the disabled attribute when soft disabled', async () => {
      await render(`<button ngpButton ngpSoftDisabled softDisabled="true">Click me</button>`, {
        imports: [NgpButton, NgpSoftDisabled],
      });

      expect(screen.getByRole('button')).not.toHaveAttribute('disabled');
    });

    it('should set the disabled attribute when hard disabled and soft disabled is false', async () => {
      await render(
        `<button ngpButton ngpSoftDisabled="false" [disabled]="true">Click me</button>`,
        { imports: [NgpButton, NgpSoftDisabled] },
      );

      expect(screen.getByRole('button')).toHaveAttribute('disabled');
    });

    it('should set data-soft-disabled when using soft disabled (not hard disabled)', async () => {
      await render(`<button ngpButton ngpSoftDisabled softDisabled="true">Click me</button>`, {
        imports: [NgpButton, NgpSoftDisabled],
      });

      const button = screen.getByRole('button');
      // data-soft-disabled is managed by NgpSoftDisabled
      expect(button).toHaveAttribute('data-soft-disabled', '');
      // When using soft disabled, the button is NOT hard disabled
      expect(button).not.toHaveAttribute('disabled');
    });

    it('should set data-disabled when using hard disabled (not soft disabled)', async () => {
      await render(
        `<button ngpButton ngpSoftDisabled="false" [disabled]="true">Click me</button>`,
        {
          imports: [NgpButton, NgpSoftDisabled],
        },
      );

      const button = screen.getByRole('button');
      // data-disabled is managed by NgpButton based on its disabled input
      expect(button).toHaveAttribute('data-disabled', '');
      expect(button).toHaveAttribute('disabled');
      // soft disabled is off
      expect(button).not.toHaveAttribute('data-soft-disabled');
    });

    it('should not set data-disabled when neither soft nor hard disabled', async () => {
      await render(`<button ngpButton ngpSoftDisabled="false">Click me</button>`, {
        imports: [NgpButton, NgpSoftDisabled],
      });

      const button = screen.getByRole('button');
      expect(button).not.toHaveAttribute('data-disabled');
      expect(button).not.toHaveAttribute('data-soft-disabled');
    });

    it('should set data-soft-disabled only when soft disabled', async () => {
      await render(`<button ngpButton ngpSoftDisabled softDisabled="true">Click me</button>`, {
        imports: [NgpButton, NgpSoftDisabled],
      });

      expect(screen.getByRole('button')).toHaveAttribute('data-soft-disabled', '');
    });

    it('should update attributes when switching between soft and hard disabled', async () => {
      const { fixture, rerender } = await render(
        `<button ngpButton ngpSoftDisabled [softDisabled]="softDisabled" [disabled]="isDisabled">Click me</button>`,
        {
          imports: [NgpButton, NgpSoftDisabled],
          // Start with soft disabled (focusable disabled state)
          componentProperties: { isDisabled: false, softDisabled: true },
        },
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('data-soft-disabled');
      expect(button).not.toHaveAttribute('disabled');

      // Switch to hard disabled (turn off soft disabled first to avoid conflicts)
      await rerender({ componentProperties: { softDisabled: false, isDisabled: true } });
      fixture.detectChanges();
      expect(button).toHaveAttribute('data-disabled');
      expect(button).toHaveAttribute('disabled');
      expect(button).not.toHaveAttribute('data-soft-disabled');

      // Switch back to soft disabled
      await rerender({ componentProperties: { softDisabled: true, isDisabled: false } });
      fixture.detectChanges();
      expect(button).toHaveAttribute('data-soft-disabled');
      expect(button).not.toHaveAttribute('disabled');
    });
  });

  describe('aria-disabled behavior', () => {
    it('should set aria-disabled="true" when soft disabled (uses aria-disabled instead of disabled)', async () => {
      await render(`<button ngpButton ngpSoftDisabled softDisabled="true">Click me</button>`, {
        imports: [NgpButton, NgpSoftDisabled],
      });

      const button = screen.getByRole('button');
      expect(button).not.toHaveAttribute('disabled');
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });

    it('should not set aria-disabled when hard disabled (browser handles it)', async () => {
      await render(
        `<button ngpButton ngpSoftDisabled softDisabled="true" disabled>Click me</button>`,
        {
          imports: [NgpButton, NgpSoftDisabled],
        },
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('disabled');
      expect(button).not.toHaveAttribute('aria-disabled');
    });
  });

  describe('focus behavior', () => {
    it('should allow soft disabled button to be focused', async () => {
      await render(`<button ngpButton ngpSoftDisabled softDisabled="true">Click me</button>`, {
        imports: [NgpButton, NgpSoftDisabled],
      });

      const button = screen.getByRole('button');
      button.focus();
      expect(button).toHaveFocus();
    });

    it('should keep tabindex="0" when soft disabled', async () => {
      await render(`<button ngpButton ngpSoftDisabled softDisabled="true">Click me</button>`, {
        imports: [NgpButton, NgpSoftDisabled],
      });

      expect(screen.getByRole('button')).toHaveAttribute('tabindex', '0');
    });

    it('should allow tabbing through soft disabled buttons', async () => {
      await render(
        `
          <button ngpButton ngpSoftDisabled softDisabled="true">First</button>
          <button ngpButton ngpSoftDisabled softDisabled="true">Second</button>
        `,
        { imports: [NgpButton, NgpSoftDisabled] },
      );

      const user = userEvent.setup();
      const firstButton = screen.getByRole('button', { name: 'First' });
      const secondButton = screen.getByRole('button', { name: 'Second' });

      firstButton.focus();
      expect(firstButton).toHaveFocus();

      await user.tab();
      expect(secondButton).toHaveFocus();
    });

    it('should skip non-focusable soft disabled buttons in tab order', async () => {
      await render(
        `
          <button ngpButton>First</button>
          <div ngpButton ngpSoftDisabled softDisabled="true" softDisabledFocusable="false">Skipped</div>
          <button ngpButton>Third</button>
        `,
        { imports: [NgpButton, NgpSoftDisabled] },
      );

      const user = userEvent.setup();
      const firstButton = screen.getByRole('button', { name: 'First' });
      const thirdButton = screen.getByRole('button', { name: 'Third' });

      firstButton.focus();
      expect(firstButton).toHaveFocus();

      await user.tab();
      expect(thirdButton).toHaveFocus();
    });
  });

  describe('click prevention', () => {
    it('should prevent click when soft disabled', async () => {
      const handleClick = jest.fn();
      await render(
        `<button ngpButton ngpSoftDisabled softDisabled="true" (click)="onClick()">Click me</button>`,
        {
          imports: [NgpButton, NgpSoftDisabled],
          componentProperties: { onClick: handleClick },
        },
      );

      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should allow click when soft disabled is false', async () => {
      const handleClick = jest.fn();
      await render(
        `<button ngpButton ngpSoftDisabled="false" (click)="onClick()">Click me</button>`,
        {
          imports: [NgpButton, NgpSoftDisabled],
          componentProperties: { onClick: handleClick },
        },
      );

      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalled();
    });
  });

  describe('keyboard interaction prevention', () => {
    it('should prevent Enter key when soft disabled', async () => {
      const handleClick = jest.fn();
      await render(
        `<button ngpButton ngpSoftDisabled softDisabled="true" (click)="onClick()">Click me</button>`,
        {
          imports: [NgpButton, NgpSoftDisabled],
          componentProperties: { onClick: handleClick },
        },
      );

      const button = screen.getByRole('button');
      button.focus();
      fireEvent.keyDown(button, { key: 'Enter' });

      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should prevent Space key when soft disabled', async () => {
      const handleClick = jest.fn();
      await render(
        `<button ngpButton ngpSoftDisabled softDisabled="true" (click)="onClick()">Click me</button>`,
        {
          imports: [NgpButton, NgpSoftDisabled],
          componentProperties: { onClick: handleClick },
        },
      );

      const button = screen.getByRole('button');
      button.focus();
      fireEvent.keyDown(button, { key: ' ' });
      fireEvent.keyUp(button, { key: ' ' });

      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should allow Tab key when soft disabled and focusable', async () => {
      await render(
        `
          <button ngpButton ngpSoftDisabled softDisabled="true">First</button>
          <button ngpButton ngpSoftDisabled softDisabled="true">Second</button>
        `,
        { imports: [NgpButton, NgpSoftDisabled] },
      );

      const user = userEvent.setup();
      const firstButton = screen.getByRole('button', { name: 'First' });

      firstButton.focus();
      expect(firstButton).toHaveFocus();

      await user.tab();
      expect(screen.getByRole('button', { name: 'Second' })).toHaveFocus();
    });
  });

  describe('with host directives', () => {
    @Directive({
      selector: '[ngpTestButton]',
      hostDirectives: [
        {
          directive: NgpButton,
          inputs: ['disabled'],
        },
        {
          directive: NgpSoftDisabled,
          inputs: ['softDisabled', 'softDisabledFocusable'],
        },
      ],
    })
    class TestButton {}

    it('should compose correctly via host directives', async () => {
      await render(
        `<button ngpTestButton ngpSoftDisabled softDisabled="true" softDisabledFocusable="true">Click me</button>`,
        { imports: [TestButton] },
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('data-soft-disabled', '');
      expect(button).toHaveAttribute('aria-disabled', 'true');
      expect(button).toHaveAttribute('tabindex', '0');
    });

    it('should allow soft disabled host directive button to be focused', async () => {
      await render(
        `<button ngpTestButton ngpSoftDisabled softDisabled="true" softDisabledFocusable="true">Click me</button>`,
        { imports: [TestButton] },
      );

      const user = userEvent.setup();
      const button = screen.getByRole('button');
      button.focus();
      expect(button).toHaveFocus();
      await user.tab();
      expect(button).not.toHaveFocus();
    });

    it('should prevent tabbing away when focusable is false', async () => {
      await render(
        `<button ngpTestButton ngpSoftDisabled softDisabled="true" softDisabledFocusable="false">Click me</button>`,
        { imports: [TestButton] },
      );

      const user = userEvent.setup();
      const button = screen.getByRole('button');
      button.focus();
      expect(button).toHaveFocus();
      await user.tab();
      // Tab is blocked when not focusable, so focus should remain
      expect(button).toHaveFocus();
    });

    it('should have no a11y violations with host directives', async () => {
      const { container } = await render(
        `<button ngpTestButton ngpSoftDisabled softDisabled="true" softDisabledFocusable="true">Accessible Button</button>`,
        { imports: [TestButton] },
      );

      const results = await axe(container, {
        rules: {
          'document-title': { enabled: false },
          'html-has-lang': { enabled: false },
          'landmark-one-main': { enabled: false },
          'page-has-heading-one': { enabled: false },
          region: { enabled: false },
        },
      });

      expect(results).toHaveNoViolations();
    });
  });

  describe('event handler blocking order', () => {
    @Directive({ selector: '[ngpTestDirective]' })
    class TestDirective {
      readonly didClick = signal(false);
      readonly didKeydown = signal(false);
      readonly didPointerdown = signal(false);
      readonly didMousedown = signal(false);

      constructor() {
        listener(injectElementRef(), 'click', event => {
          this.didClick.set(true);
          event.preventDefault();
          event.stopImmediatePropagation();
        });

        listener(injectElementRef(), 'keydown', event => {
          this.didKeydown.set(true);
          event.preventDefault();
          event.stopImmediatePropagation();
        });

        listener(injectElementRef(), 'pointerdown', event => {
          this.didPointerdown.set(true);
          event.preventDefault();
          event.stopImmediatePropagation();
        });

        listener(injectElementRef(), 'mousedown', event => {
          this.didMousedown.set(true);
          event.preventDefault();
          event.stopImmediatePropagation();
        });
      }
    }

    @Component({
      selector: 'test-host',
      imports: [TestDirective, NgpButton, NgpSoftDisabled],
      template: `
        <button ngpButton ngpTestDirective ngpSoftDisabled softDisabled="true">Click me</button>
      `,
    })
    class TestHost {
      readonly ngpTestDirective = viewChild.required(TestDirective);
    }

    it('should block all interaction events when soft disabled', async () => {
      const { fixture } = await render(TestHost);

      const button = screen.getByRole('button');

      // Click should be blocked
      button.click();
      expect(fixture.componentInstance.ngpTestDirective().didClick()).toBe(false);

      // Keydown should be blocked (except Tab)
      button.focus();
      fireEvent.keyDown(button, { key: 'Enter' });
      expect(fixture.componentInstance.ngpTestDirective().didKeydown()).toBe(false);

      // Tab should pass through
      fireEvent.keyDown(button, { key: 'Tab' });
      expect(fixture.componentInstance.ngpTestDirective().didKeydown()).toBe(true);

      // Pointerdown should be blocked
      fireEvent.pointerDown(button);
      expect(fixture.componentInstance.ngpTestDirective().didPointerdown()).toBe(false);

      // Mousedown should be blocked
      fireEvent.mouseDown(button);
      expect(fixture.componentInstance.ngpTestDirective().didMousedown()).toBe(false);
    });
  });

  describe('non-native elements with NgpButton + NgpSoftDisabled', () => {
    it('should set role="button" and aria-disabled on div', async () => {
      await render(`<div ngpButton ngpSoftDisabled softDisabled="true">Custom</div>`, {
        imports: [NgpButton, NgpSoftDisabled],
      });

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('role', 'button');
      expect(button).toHaveAttribute('aria-disabled', 'true');
      expect(button).toHaveAttribute('tabindex', '0');
    });

    it('should handle keyboard activation for non-native elements when not soft disabled', async () => {
      const handleClick = jest.fn();
      await render(`<div ngpButton ngpSoftDisabled="false" (click)="onClick()">Custom</div>`, {
        imports: [NgpButton, NgpSoftDisabled],
        componentProperties: { onClick: handleClick },
      });

      const button = screen.getByRole('button');
      button.focus();
      fireEvent.keyDown(button, { key: 'Enter' });

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should block keyboard activation for non-native elements when soft disabled', async () => {
      const handleClick = jest.fn();
      await render(
        `<div ngpButton ngpSoftDisabled softDisabled="true" (click)="onClick()">Custom</div>`,
        {
          imports: [NgpButton, NgpSoftDisabled],
          componentProperties: { onClick: handleClick },
        },
      );

      const button = screen.getByRole('button');
      button.focus();
      fireEvent.keyDown(button, { key: 'Enter' });
      fireEvent.keyDown(button, { key: ' ' });
      fireEvent.keyUp(button, { key: ' ' });

      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should have no a11y violations for non-native soft disabled element', async () => {
      const { container } = await render(
        `<div ngpButton ngpSoftDisabled softDisabled="true">Accessible Custom Button</div>`,
        { imports: [NgpButton, NgpSoftDisabled] },
      );

      const results = await axe(container, {
        rules: {
          'document-title': { enabled: false },
          'html-has-lang': { enabled: false },
          'landmark-one-main': { enabled: false },
          'page-has-heading-one': { enabled: false },
          region: { enabled: false },
        },
      });

      expect(results).toHaveNoViolations();
    });
  });

  describe('anchor elements with NgpButton + NgpSoftDisabled', () => {
    it('should preserve link role for anchor with href', async () => {
      await render(`<a ngpButton ngpSoftDisabled softDisabled="true" href="#">Link</a>`, {
        imports: [NgpButton, NgpSoftDisabled],
      });

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('aria-disabled', 'true');
      expect(link).toHaveAttribute('data-soft-disabled', '');
    });

    it('should block navigation when soft disabled anchor is clicked', async () => {
      const handleClick = jest.fn(e => e.preventDefault());
      await render(
        `<a ngpButton ngpSoftDisabled softDisabled="true" href="#" (click)="onClick($event)">Link</a>`,
        {
          imports: [NgpButton, NgpSoftDisabled],
          componentProperties: { onClick: handleClick },
        },
      );

      fireEvent.click(screen.getByRole('link'));
      // Click handler should not be called because soft disabled blocks it
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should have no a11y violations for soft disabled anchor', async () => {
      const { container } = await render(
        `<a ngpButton ngpSoftDisabled softDisabled="true" href="#">Accessible Link</a>`,
        { imports: [NgpButton, NgpSoftDisabled] },
      );

      const results = await axe(container, {
        rules: {
          'document-title': { enabled: false },
          'html-has-lang': { enabled: false },
          'landmark-one-main': { enabled: false },
          'page-has-heading-one': { enabled: false },
          region: { enabled: false },
        },
      });

      expect(results).toHaveNoViolations();
    });
  });

  describe('WCAG compliance scenarios', () => {
    it('should maintain focus visibility for keyboard users (WCAG 2.4.7)', async () => {
      await render(
        `<button ngpButton ngpSoftDisabled softDisabled="true">Focusable Disabled</button>`,
        {
          imports: [NgpButton, NgpSoftDisabled],
        },
      );

      const button = screen.getByRole('button');
      button.focus();

      // Button should be focusable for keyboard users
      expect(button).toHaveFocus();
      expect(button).toHaveAttribute('tabindex', '0');
    });

    it('should communicate disabled state to assistive tech via aria-disabled (WCAG 4.1.2)', async () => {
      await render(
        `<button ngpButton ngpSoftDisabled softDisabled="true">Disabled Action</button>`,
        {
          imports: [NgpButton, NgpSoftDisabled],
        },
      );

      const button = screen.getByRole('button');
      // aria-disabled communicates the disabled state without removing from accessibility tree
      expect(button).toHaveAttribute('aria-disabled', 'true');
      // The button should still be discoverable
      expect(button).toBeInTheDocument();
    });

    it('should be keyboard operable for non-native elements (WCAG 2.1.1)', async () => {
      const handleClick = jest.fn();
      await render(
        `<div ngpButton ngpSoftDisabled="false" (click)="onClick()">Custom Action</div>`,
        {
          imports: [NgpButton, NgpSoftDisabled],
          componentProperties: { onClick: handleClick },
        },
      );

      const button = screen.getByRole('button');
      button.focus();

      // Should activate with Enter
      fireEvent.keyDown(button, { key: 'Enter' });
      expect(handleClick).toHaveBeenCalledTimes(1);

      // Should activate with Space
      fireEvent.keyDown(button, { key: ' ' });
      fireEvent.keyUp(button, { key: ' ' });
      expect(handleClick).toHaveBeenCalledTimes(2);
    });

    it('should have proper role for custom elements (WCAG 4.1.2)', async () => {
      await render(`<span ngpButton ngpSoftDisabled softDisabled="true">Custom Button</span>`, {
        imports: [NgpButton, NgpSoftDisabled],
      });

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('role', 'button');
    });
  });
});
