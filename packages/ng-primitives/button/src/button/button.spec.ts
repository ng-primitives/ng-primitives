import { FocusMonitor } from '@angular/cdk/a11y';
import { TestBed } from '@angular/core/testing';
import { RouterLink } from '@angular/router';
import { fireEvent, render } from '@testing-library/angular';
import { NgpButton } from './button';

describe('NgpButton', () => {
  it('should set the disabled attribute when disabled', async () => {
    const container = await render(`<button ngpButton [disabled]="true"></button>`, {
      imports: [NgpButton],
    });

    expect(container.getByRole('button')).toHaveAttribute('disabled');
  });

  it('should not set the disabled attribute when not disabled', async () => {
    const container = await render(`<button ngpButton></button>`, {
      imports: [NgpButton],
    });

    expect(container.getByRole('button')).not.toHaveAttribute('disabled');
  });

  it('should not set the disabled attribute when not a button', async () => {
    const container = await render(`<a ngpButton [disabled]="true"></a>`, {
      imports: [NgpButton],
    });

    const button = container.getByRole('button');
    expect(button).not.toHaveAttribute('disabled');
  });

  it('should set the data-disabled attribute when disabled', async () => {
    const container = await render(`<button ngpButton [disabled]="true"></button>`, {
      imports: [NgpButton],
    });

    expect(container.getByRole('button')).toHaveAttribute('data-disabled', '');
  });

  it('should not set the data-disabled attribute when not disabled', async () => {
    const container = await render(`<button ngpButton></button>`, {
      imports: [NgpButton],
    });

    expect(container.getByRole('button')).not.toHaveAttribute('data-disabled');
  });

  it('should update the data-disabled attribute when disabled changes', async () => {
    const { getByRole, rerender } = await render(
      `<button ngpButton [disabled]="isDisabled"></button>`,
      {
        imports: [NgpButton],
        componentProperties: { isDisabled: false },
      },
    );

    const button = getByRole('button');
    expect(button).not.toHaveAttribute('data-disabled');
    expect(button).not.toHaveAttribute('disabled');

    await rerender({ componentProperties: { isDisabled: true } });
    expect(button).toHaveAttribute('data-disabled');
    expect(button).toHaveAttribute('disabled');
  });

  it('should add the data-hover attribute when hovered', async () => {
    const container = await render(`<button ngpButton></button>`, {
      imports: [NgpButton],
    });

    const button = container.getByRole('button');
    fireEvent.mouseEnter(button);
    expect(button).toHaveAttribute('data-hover', '');
  });

  it('should remove the data-hover attribute when not hovered', async () => {
    const container = await render(`<button ngpButton></button>`, {
      imports: [NgpButton],
    });

    const button = container.getByRole('button');
    fireEvent.mouseEnter(button);
    expect(button).toHaveAttribute('data-hover', '');
    fireEvent.mouseLeave(button);
    expect(button).not.toHaveAttribute('data-hover');
  });

  it('should add the data-focus attribute when focused', async () => {
    const container = await render(`<button ngpButton></button>`, {
      imports: [NgpButton],
    });

    const focusMonitor = TestBed.inject(FocusMonitor);

    const button = container.getByRole('button');
    focusMonitor.focusVia(button, 'keyboard');
    expect(button).toHaveAttribute('data-focus-visible');
  });

  it('should remove the data-focus attribute when not focused', async () => {
    const container = await render(`<button ngpButton></button>`, {
      imports: [NgpButton],
    });

    const focusMonitor = TestBed.inject(FocusMonitor);

    const button = container.getByRole('button');
    focusMonitor.focusVia(button, 'keyboard');
    expect(button).toHaveAttribute('data-focus-visible');
    fireEvent.blur(button);
    expect(button).not.toHaveAttribute('data-focus-visible');
  });

  it('should add the data-press attribute when pressed', async () => {
    const container = await render(`<button ngpButton></button>`, {
      imports: [NgpButton],
    });

    const button = container.getByRole('button');
    fireEvent.pointerDown(button);
    expect(button).toHaveAttribute('data-press', '');
  });

  it('should remove the data-press attribute when not pressed', async () => {
    const container = await render(`<button ngpButton></button>`, {
      imports: [NgpButton],
    });

    const button = container.getByRole('button');
    fireEvent.pointerDown(button);
    expect(button).toHaveAttribute('data-press', '');
    fireEvent.pointerUp(button);
    expect(button).not.toHaveAttribute('data-press');
  });

  it('should not add the data-press attribute when disabled', async () => {
    const container = await render(`<button ngpButton [disabled]="true"></button>`, {
      imports: [NgpButton],
    });

    const button = container.getByRole('button');
    fireEvent.pointerDown(button);
    expect(button).not.toHaveAttribute('data-press');
  });

  it('should not add the data-focus-visible attribute when disabled', async () => {
    const container = await render(`<button ngpButton [disabled]="true"></button>`, {
      imports: [NgpButton],
    });

    const focusMonitor = TestBed.inject(FocusMonitor);

    const button = container.getByRole('button');
    focusMonitor.focusVia(button, 'keyboard');
    expect(button).not.toHaveAttribute('data-focus-visible');
  });

  it('should not add the data-hover attribute when disabled', async () => {
    const container = await render(`<button ngpButton [disabled]="true"></button>`, {
      imports: [NgpButton],
    });

    const button = container.getByRole('button');
    fireEvent.mouseEnter(button);
    expect(button).not.toHaveAttribute('data-hover');
  });

  describe('focusableWhenDisabled', () => {
    it('should allow a disabled button to receive focus when focusableWhenDisabled is true', async () => {
      const container = await render(
        `<button ngpButton [disabled]="true" [focusableWhenDisabled]="true"></button>`,
        {
          imports: [NgpButton],
        },
      );

      const button = container.getByRole('button');
      button.focus();
      expect(document.activeElement).toBe(button);
    });

    it('should not add the disabled attribute when focusableWhenDisabled is true', async () => {
      const container = await render(
        `<button ngpButton [disabled]="true" [focusableWhenDisabled]="true"></button>`,
        { imports: [NgpButton] },
      );

      const button = container.getByRole('button');
      expect(button).not.toHaveAttribute('disabled');
    });

    it('should still set the data-disabled attribute when focusableWhenDisabled is true', async () => {
      const container = await render(
        `<button ngpButton [disabled]="true" [focusableWhenDisabled]="true"></button>`,
        { imports: [NgpButton] },
      );

      const button = container.getByRole('button');
      expect(button).toHaveAttribute('data-disabled', '');
    });

    it('should set aria-disabled on non-native buttons when focusableWhenDisabled is true', async () => {
      const container = await render(
        `<span ngpButton [disabled]="true" [focusableWhenDisabled]="true"></span>`,
        { imports: [NgpButton] },
      );

      const button = container.getByRole('button');
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });

    it('should have tabindex 0 when focusableWhenDisabled is true and disabled', async () => {
      const container = await render(
        `<button ngpButton [disabled]="true" [focusableWhenDisabled]="true"></button>`,
        { imports: [NgpButton] },
      );

      const button = container.getByRole('button');
      expect(button).toHaveAttribute('tabindex', '0');
    });

    it('should prevent click events when disabled with focusableWhenDisabled', async () => {
      const handleClick = jest.fn();
      const container = await render(
        `<button ngpButton [disabled]="true" [focusableWhenDisabled]="true" (click)="onClick()"></button>`,
        {
          imports: [NgpButton],
          componentProperties: { onClick: handleClick },
        },
      );

      const button = container.getByRole('button');
      fireEvent.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should allow focus and blur events when disabled with focusableWhenDisabled', async () => {
      const handleFocus = jest.fn();
      const handleBlur = jest.fn();
      const container = await render(
        `<button ngpButton [disabled]="true" [focusableWhenDisabled]="true" (focus)="onFocus()" (blur)="onBlur()"></button>`,
        {
          imports: [NgpButton],
          componentProperties: { onFocus: handleFocus, onBlur: handleBlur },
        },
      );

      const button = container.getByRole('button');
      button.focus();
      expect(handleFocus).toHaveBeenCalledTimes(1);

      button.blur();
      expect(handleBlur).toHaveBeenCalledTimes(1);
    });

    it('should not add data-focus-visible when disabled with focusableWhenDisabled', async () => {
      const container = await render(
        `<button ngpButton [disabled]="true" [focusableWhenDisabled]="true"></button>`,
        {
          imports: [NgpButton],
        },
      );

      const focusMonitor = TestBed.inject(FocusMonitor);
      const button = container.getByRole('button');
      focusMonitor.focusVia(button, 'keyboard');
      expect(button).not.toHaveAttribute('data-focus-visible');
    });

    it('should not add data-hover when disabled with focusableWhenDisabled', async () => {
      const container = await render(
        `<button ngpButton [disabled]="true" [focusableWhenDisabled]="true"></button>`,
        {
          imports: [NgpButton],
        },
      );

      const button = container.getByRole('button');
      fireEvent.mouseEnter(button);
      expect(button).not.toHaveAttribute('data-hover');
    });

    it('should not add data-press when disabled with focusableWhenDisabled', async () => {
      const container = await render(
        `<button ngpButton [disabled]="true" [focusableWhenDisabled]="true"></button>`,
        {
          imports: [NgpButton],
        },
      );

      const button = container.getByRole('button');
      fireEvent.pointerDown(button);
      expect(button).not.toHaveAttribute('data-press');
    });
  });

  describe('role attribute (a11y)', () => {
    it('should add role="button" for non-native elements', async () => {
      const container = await render(`<span ngpButton></span>`, {
        imports: [NgpButton],
      });

      const button = container.getByRole('button');
      expect(button).toHaveAttribute('role', 'button');
    });

    it('should add role="button" for div elements', async () => {
      const container = await render(`<div ngpButton></div>`, {
        imports: [NgpButton],
      });

      const button = container.getByRole('button');
      expect(button).toHaveAttribute('role', 'button');
    });

    it('should not add role attribute for native buttons', async () => {
      const container = await render(`<button ngpButton></button>`, {
        imports: [NgpButton],
      });

      const button = container.getByRole('button');
      expect(button).not.toHaveAttribute('role');
    });

    it('should preserve initial role if already set', async () => {
      const container = await render(`<span ngpButton role="menuitem"></span>`, {
        imports: [NgpButton],
      });

      const menuitem = container.getByRole('menuitem');
      expect(menuitem).toHaveAttribute('role', 'menuitem');
    });
  });

  describe('aria-disabled attribute (a11y)', () => {
    it('should set aria-disabled on disabled non-native buttons', async () => {
      const container = await render(`<span ngpButton [disabled]="true"></span>`, {
        imports: [NgpButton],
      });

      const button = container.getByRole('button');
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });

    it('should not set aria-disabled on enabled non-native buttons', async () => {
      const container = await render(`<span ngpButton></span>`, {
        imports: [NgpButton],
      });

      const button = container.getByRole('button');
      expect(button).not.toHaveAttribute('aria-disabled', 'true');
    });

    it('should not set aria-disabled on native buttons when disabled attr is used', async () => {
      const container = await render(`<button ngpButton [disabled]="true"></button>`, {
        imports: [NgpButton],
      });

      const button = container.getByRole('button');
      // Native disabled attribute already communicates disabled state to assistive tech
      expect(button).not.toHaveAttribute('aria-disabled');
    });

    it('should set aria-disabled on native buttons when focusableWhenDisabled is true', async () => {
      const container = await render(
        `<button ngpButton [disabled]="true" [focusableWhenDisabled]="true"></button>`,
        { imports: [NgpButton] },
      );

      const button = container.getByRole('button');
      // When focusableWhenDisabled is true, we don't use the disabled attribute,
      // so we must use aria-disabled to communicate disabled state to assistive tech
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });
  });

  describe('tabindex attribute (a11y)', () => {
    it('should not set tabindex on enabled native buttons (browser default is sufficient)', async () => {
      const container = await render(`<button ngpButton></button>`, {
        imports: [NgpButton],
      });

      const button = container.getByRole('button');
      // Native buttons are focusable by default, no explicit tabindex needed
      expect(button).not.toHaveAttribute('tabindex');
    });

    it('should not set tabindex on disabled native buttons (disabled attr handles it)', async () => {
      const container = await render(`<button ngpButton [disabled]="true"></button>`, {
        imports: [NgpButton],
      });

      const button = container.getByRole('button');
      // Native disabled buttons are automatically removed from tab order by the browser.
      // Setting tabindex has no effect when the disabled attribute is present.
      expect(button).not.toHaveAttribute('tabindex');
    });

    it('should allow explicit tabindex override on native buttons', async () => {
      const container = await render(`<button ngpButton [tabIndex]="-1"></button>`, {
        imports: [NgpButton],
      });

      const button = container.getByRole('button');
      expect(button).toHaveAttribute('tabindex', '-1');
    });
  });

  describe('anchor elements', () => {
    it('should add role="button" for anchor without href', async () => {
      const container = await render(`<a ngpButton></a>`, {
        imports: [NgpButton],
      });

      const button = container.getByRole('button');
      expect(button).toHaveAttribute('role', 'button');
    });

    it('should have tabindex 0 for anchor elements', async () => {
      const container = await render(`<a ngpButton></a>`, {
        imports: [NgpButton],
      });

      const button = container.getByRole('button');
      expect(button).toHaveAttribute('tabindex', '0');
    });

    it('should not add role="button" for valid links (anchor with href)', async () => {
      const container = await render(`<a ngpButton href="https://example.com"></a>`, {
        imports: [NgpButton],
      });

      // Valid links retain their native "link" role
      const link = container.getByRole('link');
      expect(link).not.toHaveAttribute('role');
    });

    it('should not add role="button" for anchor with routerLink', async () => {
      const container = await render(`<a ngpButton [routerLink]="['/test']"></a>`, {
        imports: [NgpButton, RouterLink],
      });

      // Valid links retain their native "link" role
      const link = container.getByRole('link');
      expect(link).not.toHaveAttribute('role');
      expect(link).toHaveAttribute('href', '/test');
    });

    it('should not trigger synthetic click on Enter for valid links (anchor with href)', async () => {
      const handleClick = jest.fn();
      const container = await render(
        `<a ngpButton href="https://example.com" (click)="onClick()"></a>`,
        {
          imports: [NgpButton],
          componentProperties: { onClick: handleClick },
        },
      );

      // Valid links retain their native "link" role and handle Enter natively
      const link = container.getByRole('link');
      fireEvent.keyDown(link, { key: 'Enter' });
      // Our keydown handler should NOT fire a synthetic click for valid links
      // because they handle Enter natively via the browser
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should trigger synthetic click on Enter for anchor without href', async () => {
      const handleClick = jest.fn();
      const container = await render(`<a ngpButton (click)="onClick()"></a>`, {
        imports: [NgpButton],
        componentProperties: { onClick: handleClick },
      });

      const button = container.getByRole('button');
      fireEvent.keyDown(button, { key: 'Enter' });
      // Anchors without href need synthetic click handling
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('click prevention when disabled', () => {
    it('should prevent click on disabled native button', async () => {
      const handleClick = jest.fn();
      const container = await render(
        `<button ngpButton [disabled]="true" (click)="onClick()"></button>`,
        {
          imports: [NgpButton],
          componentProperties: { onClick: handleClick },
        },
      );

      const button = container.getByRole('button');
      fireEvent.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should prevent click on disabled non-native button', async () => {
      const handleClick = jest.fn();
      const container = await render(
        `<span ngpButton [disabled]="true" (click)="onClick()"></span>`,
        {
          imports: [NgpButton],
          componentProperties: { onClick: handleClick },
        },
      );

      const button = container.getByRole('button');
      fireEvent.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('pointerdown prevention', () => {
    it('should prevent default on pointerdown when disabled', async () => {
      const container = await render(`<button ngpButton [disabled]="true"></button>`, {
        imports: [NgpButton],
      });

      const button = container.getByRole('button');
      const event = fireEvent.pointerDown(button);
      // The event should be prevented (defaultPrevented would be true)
      // fireEvent returns false when preventDefault was called
      expect(event).toBe(false);
    });

    it('should not prevent default on pointerdown when enabled', async () => {
      const container = await render(`<button ngpButton></button>`, {
        imports: [NgpButton],
      });

      const button = container.getByRole('button');
      const event = fireEvent.pointerDown(button);
      expect(event).toBe(true);
    });
  });

  describe('type attribute', () => {
    it('should default native buttons to type="button"', async () => {
      const container = await render(`<button ngpButton></button>`, {
        imports: [NgpButton],
      });

      const button = container.getByRole('button');
      expect(button).toHaveAttribute('type', 'button');
    });

    it('should preserve existing type="submit" on native buttons', async () => {
      const container = await render(`<button ngpButton type="submit"></button>`, {
        imports: [NgpButton],
      });

      const button = container.getByRole('button');
      expect(button).toHaveAttribute('type', 'submit');
    });

    it('should preserve existing type="reset" on native buttons', async () => {
      const container = await render(`<button ngpButton type="reset"></button>`, {
        imports: [NgpButton],
      });

      const button = container.getByRole('button');
      expect(button).toHaveAttribute('type', 'reset');
    });

    it('should not add type attribute to non-native elements', async () => {
      const container = await render(`<span ngpButton></span>`, {
        imports: [NgpButton],
      });

      const button = container.getByRole('button');
      expect(button).not.toHaveAttribute('type');
    });

    it('should not add type attribute to anchor elements', async () => {
      const container = await render(`<a ngpButton></a>`, {
        imports: [NgpButton],
      });

      const button = container.getByRole('button');
      expect(button).not.toHaveAttribute('type');
    });
  });

  describe('non-native button keyboard accessibility', () => {
    it('should trigger click on Enter key for non-native buttons', async () => {
      const handleClick = jest.fn();
      const container = await render(`<span ngpButton (click)="onClick()"></span>`, {
        imports: [NgpButton],
        componentProperties: { onClick: handleClick },
      });

      const button = container.getByRole('button');
      button.focus();
      fireEvent.keyDown(button, { key: 'Enter' });
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should trigger click on Space key for non-native buttons', async () => {
      const handleClick = jest.fn();
      const container = await render(`<span ngpButton (click)="onClick()"></span>`, {
        imports: [NgpButton],
        componentProperties: { onClick: handleClick },
      });

      const button = container.getByRole('button');
      button.focus();
      fireEvent.keyDown(button, { key: ' ' });
      fireEvent.keyUp(button, { key: ' ' });
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should not trigger click on Enter key when disabled', async () => {
      const handleClick = jest.fn();
      const container = await render(
        `<span ngpButton [disabled]="true" (click)="onClick()"></span>`,
        {
          imports: [NgpButton],
          componentProperties: { onClick: handleClick },
        },
      );

      const button = container.getByRole('button');
      fireEvent.keyDown(button, { key: 'Enter' });
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should not trigger click on Space key when disabled', async () => {
      const handleClick = jest.fn();
      const container = await render(
        `<span ngpButton [disabled]="true" (click)="onClick()"></span>`,
        {
          imports: [NgpButton],
          componentProperties: { onClick: handleClick },
        },
      );

      const button = container.getByRole('button');
      fireEvent.keyDown(button, { key: ' ' });
      fireEvent.keyUp(button, { key: ' ' });
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should have tabindex 0 for non-native buttons', async () => {
      const container = await render(`<span ngpButton></span>`, {
        imports: [NgpButton],
      });

      const button = container.getByRole('button');
      expect(button).toHaveAttribute('tabindex', '0');
    });

    it('should have tabindex -1 for disabled non-native buttons', async () => {
      const container = await render(`<span ngpButton [disabled]="true"></span>`, {
        imports: [NgpButton],
      });

      const button = container.getByRole('button');
      expect(button).toHaveAttribute('tabindex', '-1');
    });

    it('should NOT trigger click on Space keydown alone (only on keyup)', async () => {
      const handleClick = jest.fn();
      const container = await render(`<span ngpButton (click)="onClick()"></span>`, {
        imports: [NgpButton],
        componentProperties: { onClick: handleClick },
      });

      const button = container.getByRole('button');
      button.focus();
      // Only keyDown, no keyUp - should NOT trigger click
      // This allows users to cancel by tabbing away before releasing Space
      fireEvent.keyDown(button, { key: ' ' });
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should have tabindex 0 for disabled non-native buttons with focusableWhenDisabled', async () => {
      const container = await render(
        `<span ngpButton [disabled]="true" [focusableWhenDisabled]="true"></span>`,
        {
          imports: [NgpButton],
        },
      );

      const button = container.getByRole('button');
      expect(button).toHaveAttribute('tabindex', '0');
    });

    it('should prevent keyboard activation when disabled with focusableWhenDisabled on non-native', async () => {
      const handleClick = jest.fn();
      const container = await render(
        `<span ngpButton [disabled]="true" [focusableWhenDisabled]="true" (click)="onClick()"></span>`,
        {
          imports: [NgpButton],
          componentProperties: { onClick: handleClick },
        },
      );

      const button = container.getByRole('button');
      button.focus();
      fireEvent.keyDown(button, { key: 'Enter' });
      fireEvent.keyDown(button, { key: ' ' });
      fireEvent.keyUp(button, { key: ' ' });
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('anchor with empty href', () => {
    it('should treat anchor with empty href as a button (not a valid link)', async () => {
      const container = await render(`<a ngpButton href=""></a>`, {
        imports: [NgpButton],
      });

      // Empty href is not a valid link, so it should have role="button"
      const button = container.getByRole('button');
      expect(button).toHaveAttribute('role', 'button');
    });

    it('should trigger synthetic click on Enter for anchor with empty href', async () => {
      const handleClick = jest.fn();
      const container = await render(`<a ngpButton href="" (click)="onClick()"></a>`, {
        imports: [NgpButton],
        componentProperties: { onClick: handleClick },
      });

      const button = container.getByRole('button');
      fireEvent.keyDown(button, { key: 'Enter' });
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });
});
