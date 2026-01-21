import { fireEvent, render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { NgpSoftDisabled } from './soft-disabled';

describe('NgpSoftDisabled', () => {
  it('should have proper default values on native button when no softDisabled', async () => {
    await render(`<button ngpSoftDisabled>Click me</button>`, {
      imports: [NgpSoftDisabled],
    });

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('tabindex', '0');
    expect(button).not.toHaveAttribute('aria-disabled');
    expect(button).not.toHaveAttribute('data-soft-disabled');
    expect(button).toHaveAttribute('data-soft-disabled-focusable', '');
  });

  it('should have proper default values on non-native element when no softDisabled', async () => {
    await render(`<div ngpSoftDisabled role="button">Click me</div>`, {
      imports: [NgpSoftDisabled],
    });

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('tabindex', '-1');
    expect(button).not.toHaveAttribute('aria-disabled');
    expect(button).not.toHaveAttribute('data-soft-disabled');
    expect(button).toHaveAttribute('data-soft-disabled-focusable', '');
  });

  it('should have proper default values on native button when softDisabled true', async () => {
    await render(`<button ngpSoftDisabled softDisabled>Click me</button>`, {
      imports: [NgpSoftDisabled],
    });

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('tabindex', '0');
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).toHaveAttribute('data-soft-disabled', '');
    expect(button).toHaveAttribute('data-soft-disabled-focusable', '');
  });

  it('should have proper default values on non-native element when softDisabled true', async () => {
    await render(`<div ngpSoftDisabled softDisabled role="button">Click me</div>`, {
      imports: [NgpSoftDisabled],
    });

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('tabindex', '0');
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).toHaveAttribute('data-soft-disabled', '');
    expect(button).toHaveAttribute('data-soft-disabled-focusable', '');
  });

  describe('data attributes', () => {
    it('should set data-soft-disabled when soft disabled is true', async () => {
      await render(`<button ngpSoftDisabled softDisabled>Click me</button>`, {
        imports: [NgpSoftDisabled],
      });

      expect(screen.getByRole('button')).toHaveAttribute('data-soft-disabled', '');
    });

    it('should not set data-soft-disabled when soft disabled is false', async () => {
      await render(`<button ngpSoftDisabled softDisabled="false">Click me</button>`, {
        imports: [NgpSoftDisabled],
      });

      expect(screen.getByRole('button')).not.toHaveAttribute('data-soft-disabled');
    });

    it('should set data-soft-disabled-focusable when focusable is true', async () => {
      await render(`<button ngpSoftDisabled softDisabled>Click me</button>`, {
        imports: [NgpSoftDisabled],
      });

      expect(screen.getByRole('button')).toHaveAttribute('data-soft-disabled-focusable', '');
    });

    it('should not set data-soft-disabled-focusable when focusable is false', async () => {
      await render(
        `<button ngpSoftDisabled softDisabled softDisabledFocusable="false">Click me</button>`,
        { imports: [NgpSoftDisabled] },
      );

      expect(screen.getByRole('button')).not.toHaveAttribute('data-soft-disabled-focusable');
    });

    it('should update data-soft-disabled when soft disabled changes', async () => {
      const { rerender, fixture } = await render(
        `<button ngpSoftDisabled [softDisabled]="softDisabled">Click me</button>`,
        {
          imports: [NgpSoftDisabled],
          componentProperties: { softDisabled: true },
        },
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('data-soft-disabled', '');

      await rerender({ componentProperties: { softDisabled: false } });
      fixture.detectChanges();
      expect(button).not.toHaveAttribute('data-soft-disabled');
    });

    it('should update data-soft-disabled-focusable when focusable changes', async () => {
      const { rerender, fixture } = await render(
        `<button ngpSoftDisabled softDisabled [softDisabledFocusable]="focusable">Click me</button>`,
        {
          imports: [NgpSoftDisabled],
          componentProperties: { focusable: true },
        },
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('data-soft-disabled-focusable', '');

      await rerender({ componentProperties: { focusable: false } });
      fixture.detectChanges();
      expect(button).not.toHaveAttribute('data-soft-disabled-focusable');
    });
  });

  describe('aria-disabled', () => {
    describe('native button', () => {
      it('should set aria-disabled="true" when soft disabled and focusable', async () => {
        await render(`<button ngpSoftDisabled softDisabled>Click me</button>`, {
          imports: [NgpSoftDisabled],
        });

        const button = screen.getByRole('button');
        expect(button).toHaveAttribute('aria-disabled', 'true');
        expect(button).toHaveProperty('ariaDisabled', 'true');
      });

      it('should not set aria-disabled when not soft disabled', async () => {
        await render(`<button ngpSoftDisabled softDisabled="false">Click me</button>`, {
          imports: [NgpSoftDisabled],
        });

        const button = screen.getByRole('button');
        expect(button).not.toHaveAttribute('aria-disabled');
      });

      it('should not set aria-disabled when natively disabled (hard disabled)', async () => {
        await render(`<button ngpSoftDisabled softDisabled disabled>Click me</button>`, {
          imports: [NgpSoftDisabled],
        });

        const button = screen.getByRole('button');
        expect(button).toHaveAttribute('disabled');
        expect(button).not.toHaveAttribute('aria-disabled');
      });

      it('should set aria-disabled when property bound', async () => {
        await render(
          `<button ngpSoftDisabled softDisabled="false" [ariaDisabled]="true">Click me</button>`,
          { imports: [NgpSoftDisabled] },
        );

        const button = screen.getByRole('button');
        expect(button).toHaveAttribute('aria-disabled', 'true');
      });

      it('should not set aria-disabled when attribute is "false" and not soft disabled', async () => {
        // ARIA best practice: aria-disabled="false" is redundant, so we remove the attribute
        await render(
          `<button ngpSoftDisabled softDisabled="false" aria-disabled="false">Click me</button>`,
          { imports: [NgpSoftDisabled] },
        );

        const button = screen.getByRole('button');
        // aria-disabled="false" is not set; absence of attribute implies not disabled
        expect(button).not.toHaveAttribute('aria-disabled');
      });

      it('should remove aria-disabled when soft disabled is toggled off (initial "true" attribute)', async () => {
        const { rerender, fixture } = await render(
          `<button ngpSoftDisabled [softDisabled]="softDisabled" aria-disabled="true">Click me</button>`,
          {
            imports: [NgpSoftDisabled],
            componentProperties: { softDisabled: true },
          },
        );

        const button = screen.getByRole('button');
        expect(button).toHaveAttribute('aria-disabled', 'true');
        await rerender({ componentProperties: { softDisabled: false } });
        fixture.detectChanges();
        // When not soft disabled and ariaDisabled is true (from initial attribute),
        // we preserve the "true" value
        expect(button).toHaveAttribute('aria-disabled', 'true');
      });

      // Note: aria-disabled follows ARIA best practices:
      // - When true: set aria-disabled="true"
      // - When false: remove the attribute (absence implies not disabled)
    });

    describe('non-native element', () => {
      it('should set aria-disabled="true" when soft disabled', async () => {
        await render(`<div ngpSoftDisabled softDisabled role="button">Click me</div>`, {
          imports: [NgpSoftDisabled],
        });

        expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true');
      });

      it('should not set aria-disabled when not soft disabled', async () => {
        await render(`<div ngpSoftDisabled softDisabled="false" role="button">Click me</div>`, {
          imports: [NgpSoftDisabled],
        });

        expect(screen.getByRole('button')).not.toHaveAttribute('aria-disabled');
      });
    });
  });

  describe('tabIndex management', () => {
    describe('native button', () => {
      it('should set tabIndex to the provided value', async () => {
        const { rerender, fixture } = await render(
          `<button ngpSoftDisabled [softDisabled]="softDisabled" [tabIndex]="-2">Click me</button>`,
          {
            imports: [NgpSoftDisabled],
            componentProperties: { softDisabled: false },
          },
        );

        const button = screen.getByRole('button');
        expect(button).toHaveAttribute('tabindex', '-2');
        await rerender({ componentProperties: { softDisabled: true } });
        fixture.detectChanges();
        expect(button).toHaveAttribute('tabindex', '0');
        await rerender({ componentProperties: { softDisabled: false } });
        fixture.detectChanges();
        expect(button).toHaveAttribute('tabindex', '-2');
      });

      it('should default tabIndex to 0', async () => {
        await render(`<button ngpSoftDisabled softDisabled>Click me</button>`, {
          imports: [NgpSoftDisabled],
        });

        expect(screen.getByRole('button')).toHaveAttribute('tabindex', '0');
      });

      it('should set tabindex when attribute bound', async () => {
        const { rerender, fixture } = await render(
          `<button ngpSoftDisabled [softDisabled]="softDisabled" tabindex="-5">Click me</button>`,
          {
            imports: [NgpSoftDisabled],
            componentProperties: { softDisabled: false },
          },
        );

        const button = screen.getByRole('button');
        expect(button).toHaveAttribute('tabindex', '-5');
        await rerender({ componentProperties: { softDisabled: true } });
        fixture.detectChanges();
        expect(button).toHaveAttribute('tabindex', '0');
        await rerender({ componentProperties: { softDisabled: false } });
        fixture.detectChanges();
        expect(button).toHaveAttribute('tabindex', '-5');
      });
    });

    describe('non-native element', () => {
      it('should set tabIndex to 0 when soft disabled and focusable', async () => {
        await render(`<div ngpSoftDisabled softDisabled role="button">Click me</div>`, {
          imports: [NgpSoftDisabled],
        });

        expect(screen.getByRole('button')).toHaveAttribute('tabindex', '0');
      });

      it('should set tabIndex to -1 when soft disabled and not focusable', async () => {
        await render(
          `<div ngpSoftDisabled softDisabled softDisabledFocusable="false" role="button">Click me</div>`,
          { imports: [NgpSoftDisabled] },
        );

        expect(screen.getByRole('button')).toHaveAttribute('tabindex', '-1');
      });

      it('should use custom tabIndex when soft disabled and focusable', async () => {
        await render(
          `<div ngpSoftDisabled softDisabled [tabIndex]="3" role="button">Click me</div>`,
          { imports: [NgpSoftDisabled] },
        );

        expect(screen.getByRole('button')).toHaveAttribute('tabindex', '3');
      });

      it('should adjust negative tabIndex to 0 when soft disabled and focusable', async () => {
        await render(
          `<div ngpSoftDisabled softDisabled [tabIndex]="-1" role="button">Click me</div>`,
          { imports: [NgpSoftDisabled] },
        );

        // When soft disabled and focusable, negative tabIndex should be adjusted to 0
        expect(screen.getByRole('button')).toHaveAttribute('tabindex', '0');
      });

      it('should use provided negative tabIndex when not focusable', async () => {
        await render(
          `<div ngpSoftDisabled softDisabled softDisabledFocusable="false" [tabIndex]="-5" role="button">Click me</div>`,
          { imports: [NgpSoftDisabled] },
        );

        expect(screen.getByRole('button')).toHaveAttribute('tabindex', '-5');
      });

      it('should not modify tabIndex when not soft disabled', async () => {
        await render(
          `<div ngpSoftDisabled softDisabled="false" [tabIndex]="2" role="button">Click me</div>`,
          { imports: [NgpSoftDisabled] },
        );

        expect(screen.getByRole('button')).toHaveAttribute('tabindex', '2');
      });
    });
  });

  describe('focus behavior', () => {
    it('should allow focusing when soft disabled and focusable', async () => {
      await render(`<button ngpSoftDisabled softDisabled>Click me</button>`, {
        imports: [NgpSoftDisabled],
      });

      const button = screen.getByRole('button');
      button.focus();
      expect(button).toHaveFocus();
    });

    it('should not be in tab order when soft disabled and not focusable (non-native)', async () => {
      await render(
        `
        <div ngpSoftDisabled softDisabled softDisabledFocusable="false" role="button">First</div>
        <button>Second</button>
      `,
        { imports: [NgpSoftDisabled] },
      );

      const user = userEvent.setup();
      const secondButton = screen.getByRole('button', { name: 'Second' });

      // Tab should skip the non-focusable soft disabled element
      await user.tab();
      expect(secondButton).toHaveFocus();
    });

    it('should allow tabbing away from soft disabled focusable element', async () => {
      await render(
        `
        <button ngpSoftDisabled softDisabled>First</button>
        <button>Second</button>
      `,
        { imports: [NgpSoftDisabled] },
      );

      const user = userEvent.setup();
      const firstButton = screen.getByRole('button', { name: 'First' });
      const secondButton = screen.getByRole('button', { name: 'Second' });

      firstButton.focus();
      expect(firstButton).toHaveFocus();

      await user.tab();
      expect(secondButton).toHaveFocus();
    });
  });

  describe('click event blocking', () => {
    it('should prevent click when soft disabled', async () => {
      const handleClick = jest.fn();
      await render(`<button ngpSoftDisabled softDisabled (click)="onClick()">Click me</button>`, {
        imports: [NgpSoftDisabled],
        componentProperties: { onClick: handleClick },
      });

      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should allow click when not soft disabled', async () => {
      const handleClick = jest.fn();
      await render(
        `<button ngpSoftDisabled softDisabled="false" (click)="onClick()">Click me</button>`,
        {
          imports: [NgpSoftDisabled],
          componentProperties: { onClick: handleClick },
        },
      );

      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalled();
    });

    it('should stop click event propagation when soft disabled', async () => {
      await render(`<button ngpSoftDisabled softDisabled>Click me</button>`, {
        imports: [NgpSoftDisabled],
      });

      const button = screen.getByRole('button');
      const clickEvent = new MouseEvent('click', { bubbles: true });
      const stopImmediatePropagationSpy = jest.spyOn(clickEvent, 'stopImmediatePropagation');

      button.dispatchEvent(clickEvent);
      expect(stopImmediatePropagationSpy).toHaveBeenCalled();
    });
  });

  describe('keydown event blocking', () => {
    it('should prevent keydown events (except Tab) when soft disabled', async () => {
      await render(`<button ngpSoftDisabled softDisabled>Click me</button>`, {
        imports: [NgpSoftDisabled],
      });

      const button = screen.getByRole('button');

      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
      const enterPreventSpy = jest.spyOn(enterEvent, 'preventDefault');
      button.dispatchEvent(enterEvent);
      expect(enterPreventSpy).toHaveBeenCalled();

      const spaceEvent = new KeyboardEvent('keydown', { key: ' ', bubbles: true });
      const spacePreventSpy = jest.spyOn(spaceEvent, 'preventDefault');
      button.dispatchEvent(spaceEvent);
      expect(spacePreventSpy).toHaveBeenCalled();

      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
      const escapePreventSpy = jest.spyOn(escapeEvent, 'preventDefault');
      button.dispatchEvent(escapeEvent);
      expect(escapePreventSpy).toHaveBeenCalled();
    });

    it('should allow Tab key when soft disabled and focusable', async () => {
      await render(`<button ngpSoftDisabled softDisabled>Click me</button>`, {
        imports: [NgpSoftDisabled],
      });

      const button = screen.getByRole('button');
      const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true });
      const preventSpy = jest.spyOn(tabEvent, 'preventDefault');

      button.dispatchEvent(tabEvent);
      expect(preventSpy).not.toHaveBeenCalled();
    });

    it('should block Tab key when soft disabled and not focusable', async () => {
      await render(
        `<button ngpSoftDisabled softDisabled softDisabledFocusable="false">Click me</button>`,
        { imports: [NgpSoftDisabled] },
      );

      const button = screen.getByRole('button');
      const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true });
      const preventSpy = jest.spyOn(tabEvent, 'preventDefault');

      button.dispatchEvent(tabEvent);
      expect(preventSpy).toHaveBeenCalled();
    });

    it('should not block keydown events when not soft disabled', async () => {
      await render(`<button ngpSoftDisabled softDisabled="false">Click me</button>`, {
        imports: [NgpSoftDisabled],
      });

      const button = screen.getByRole('button');
      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
      const preventSpy = jest.spyOn(enterEvent, 'preventDefault');

      button.dispatchEvent(enterEvent);
      expect(preventSpy).not.toHaveBeenCalled();
    });

    it('should stop keydown event propagation when soft disabled', async () => {
      await render(`<button ngpSoftDisabled softDisabled>Click me</button>`, {
        imports: [NgpSoftDisabled],
      });

      const button = screen.getByRole('button');
      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
      const stopSpy = jest.spyOn(enterEvent, 'stopImmediatePropagation');

      button.dispatchEvent(enterEvent);
      expect(stopSpy).toHaveBeenCalled();
    });
  });

  describe('pointerdown event blocking', () => {
    it('should prevent pointerdown when soft disabled', async () => {
      const handlePointerDown = jest.fn();
      await render(
        `<div (pointerdown)="onPointerDown($event)"><button ngpSoftDisabled softDisabled>Click me</button></div>`,
        {
          imports: [NgpSoftDisabled],
          componentProperties: { onPointerDown: handlePointerDown },
        },
      );

      const button = screen.getByRole('button');
      fireEvent.pointerDown(button);

      // Event should be blocked from reaching parent
      expect(handlePointerDown).not.toHaveBeenCalled();
    });

    it('should not prevent pointerdown when not soft disabled', async () => {
      const handlePointerDown = jest.fn();
      await render(
        `<div (pointerdown)="onPointerDown($event)"><button ngpSoftDisabled softDisabled="false">Click me</button></div>`,
        {
          imports: [NgpSoftDisabled],
          componentProperties: { onPointerDown: handlePointerDown },
        },
      );

      const button = screen.getByRole('button');
      fireEvent.pointerDown(button);

      expect(handlePointerDown).toHaveBeenCalled();
    });
  });

  describe('mousedown event blocking', () => {
    it('should prevent mousedown when soft disabled', async () => {
      await render(`<button ngpSoftDisabled softDisabled>Click me</button>`, {
        imports: [NgpSoftDisabled],
      });

      const button = screen.getByRole('button');
      const mouseEvent = new MouseEvent('mousedown', { bubbles: true });
      const preventSpy = jest.spyOn(mouseEvent, 'preventDefault');
      const stopSpy = jest.spyOn(mouseEvent, 'stopImmediatePropagation');

      button.dispatchEvent(mouseEvent);
      expect(preventSpy).toHaveBeenCalled();
      expect(stopSpy).toHaveBeenCalled();
    });

    it('should not prevent mousedown when not soft disabled', async () => {
      await render(`<button ngpSoftDisabled softDisabled="false">Click me</button>`, {
        imports: [NgpSoftDisabled],
      });

      const button = screen.getByRole('button');
      const mouseEvent = new MouseEvent('mousedown', { bubbles: true });
      const preventSpy = jest.spyOn(mouseEvent, 'preventDefault');

      button.dispatchEvent(mouseEvent);
      expect(preventSpy).not.toHaveBeenCalled();
    });
  });

  describe('programmatic state changes', () => {
    it('should support programmatic soft disabled changes via setSoftDisabled', async () => {
      const { fixture } = await render(
        `<button ngpSoftDisabled softDisabled #ref="ngpSoftDisabled">Click me</button>`,
        {
          imports: [NgpSoftDisabled],
        },
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('data-soft-disabled', '');

      const directive = fixture.debugElement.children[0].references['ref'] as NgpSoftDisabled;
      directive.setSoftDisabled(false);
      fixture.detectChanges();

      expect(button).not.toHaveAttribute('data-soft-disabled');
    });

    it('should support programmatic focusable changes via setFocusable', async () => {
      const { fixture } = await render(
        `<button ngpSoftDisabled softDisabled #ref="ngpSoftDisabled">Click me</button>`,
        {
          imports: [NgpSoftDisabled],
        },
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('data-soft-disabled-focusable', '');

      const directive = fixture.debugElement.children[0].references['ref'] as NgpSoftDisabled;
      directive.setFocusable(false);
      fixture.detectChanges();

      expect(button).not.toHaveAttribute('data-soft-disabled-focusable');
    });

    it('should support programmatic tabIndex changes via setTabIndex', async () => {
      const { fixture } = await render(
        `<div ngpSoftDisabled softDisabled role="button" #ref="ngpSoftDisabled">Click me</div>`,
        { imports: [NgpSoftDisabled] },
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('tabindex', '0');

      const directive = fixture.debugElement.children[0].references['ref'] as NgpSoftDisabled;
      directive.setTabIndex(5);
      fixture.detectChanges();

      expect(button).toHaveAttribute('tabindex', '5');
    });
  });

  describe('with different element types', () => {
    it('should work with anchor elements', async () => {
      await render(`<a ngpSoftDisabled softDisabled href="#" role="button">Link</a>`, {
        imports: [NgpSoftDisabled],
      });

      const link = screen.getByRole('button');
      expect(link).toHaveAttribute('data-soft-disabled', '');
      expect(link).toHaveAttribute('aria-disabled', 'true');
    });

    it('should work with div elements', async () => {
      await render(`<div ngpSoftDisabled softDisabled role="button">Custom Button</div>`, {
        imports: [NgpSoftDisabled],
      });

      const div = screen.getByRole('button');
      expect(div).toHaveAttribute('data-soft-disabled', '');
      expect(div).toHaveAttribute('aria-disabled', 'true');
      expect(div).toHaveAttribute('tabindex', '0');
    });

    it('should work with input elements', async () => {
      await render(`<input ngpSoftDisabled softDisabled type="submit" value="Submit" />`, {
        imports: [NgpSoftDisabled],
      });

      const input = screen.getByRole('button');
      expect(input).toHaveAttribute('data-soft-disabled', '');
      expect(input).toHaveAttribute('aria-disabled', 'true');
    });
  });

  describe('event capture phase', () => {
    it('should block events in capture phase preventing other handlers', async () => {
      const parentClickHandler = jest.fn();
      await render(
        `<div (click)="onParentClick()"><button ngpSoftDisabled softDisabled>Click me</button></div>`,
        {
          imports: [NgpSoftDisabled],
          componentProperties: { onParentClick: parentClickHandler },
        },
      );

      fireEvent.click(screen.getByRole('button'));
      expect(parentClickHandler).not.toHaveBeenCalled();
    });
  });

  describe('initial attribute values (HostAttributeToken)', () => {
    describe('tabindex attribute initialization', () => {
      it('should use tabindex="0" from static attribute', async () => {
        await render(
          `<button ngpSoftDisabled softDisabled="false" tabindex="0">Click me</button>`,
          { imports: [NgpSoftDisabled] },
        );

        expect(screen.getByRole('button')).toHaveAttribute('tabindex', '0');
      });

      it('should use positive tabindex from static attribute', async () => {
        await render(
          `<button ngpSoftDisabled softDisabled="false" tabindex="5">Click me</button>`,
          { imports: [NgpSoftDisabled] },
        );

        expect(screen.getByRole('button')).toHaveAttribute('tabindex', '5');
      });

      it('should use negative tabindex from static attribute when not soft disabled', async () => {
        await render(
          `<button ngpSoftDisabled softDisabled="false" tabindex="-1">Click me</button>`,
          { imports: [NgpSoftDisabled] },
        );

        expect(screen.getByRole('button')).toHaveAttribute('tabindex', '-1');
      });

      it('should adjust negative tabindex to 0 when soft disabled and focusable', async () => {
        await render(`<button ngpSoftDisabled softDisabled tabindex="-1">Click me</button>`, {
          imports: [NgpSoftDisabled],
        });

        // When soft disabled and focusable, negative tabindex should be adjusted to 0
        expect(screen.getByRole('button')).toHaveAttribute('tabindex', '0');
      });

      it('should preserve positive tabindex when soft disabled and focusable', async () => {
        await render(`<button ngpSoftDisabled softDisabled tabindex="3">Click me</button>`, {
          imports: [NgpSoftDisabled],
        });

        expect(screen.getByRole('button')).toHaveAttribute('tabindex', '3');
      });

      it('should use negative tabindex when soft disabled and not focusable', async () => {
        await render(
          `<button ngpSoftDisabled softDisabled softDisabledFocusable="false" tabindex="-2">Click me</button>`,
          { imports: [NgpSoftDisabled] },
        );

        expect(screen.getByRole('button')).toHaveAttribute('tabindex', '-2');
      });

      it('should revert to initial tabindex attribute when soft disabled is toggled off', async () => {
        const { rerender, fixture } = await render(
          `<button ngpSoftDisabled [softDisabled]="softDisabled" tabindex="-3">Click me</button>`,
          {
            imports: [NgpSoftDisabled],
            componentProperties: { softDisabled: true },
          },
        );

        const button = screen.getByRole('button');
        // When soft disabled + focusable, negative tabindex adjusted to 0
        expect(button).toHaveAttribute('tabindex', '0');

        await rerender({ componentProperties: { softDisabled: false } });
        fixture.detectChanges();
        // Should revert to initial attribute value
        expect(button).toHaveAttribute('tabindex', '-3');

        await rerender({ componentProperties: { softDisabled: true } });
        fixture.detectChanges();
        // Back to adjusted value
        expect(button).toHaveAttribute('tabindex', '0');
      });

      it('should handle tabindex state transitions: disabled→enabled→disabled', async () => {
        const { rerender, fixture } = await render(
          `<button ngpSoftDisabled [softDisabled]="softDisabled" tabindex="2">Click me</button>`,
          {
            imports: [NgpSoftDisabled],
            componentProperties: { softDisabled: false },
          },
        );

        const button = screen.getByRole('button');
        expect(button).toHaveAttribute('tabindex', '2');

        await rerender({ componentProperties: { softDisabled: true } });
        fixture.detectChanges();
        expect(button).toHaveAttribute('tabindex', '2');

        await rerender({ componentProperties: { softDisabled: false } });
        fixture.detectChanges();
        expect(button).toHaveAttribute('tabindex', '2');
      });

      it('should prefer property binding over static attribute for tabindex', async () => {
        await render(
          `<button ngpSoftDisabled softDisabled tabindex="5" [tabIndex]="10">Click me</button>`,
          { imports: [NgpSoftDisabled] },
        );

        expect(screen.getByRole('button')).toHaveAttribute('tabindex', '10');
      });

      it('should default to 0 when no tabindex attribute is provided', async () => {
        await render(`<button ngpSoftDisabled softDisabled>Click me</button>`, {
          imports: [NgpSoftDisabled],
        });

        expect(screen.getByRole('button')).toHaveAttribute('tabindex', '0');
      });
    });

    describe('aria-disabled attribute initialization', () => {
      it('should use aria-disabled="true" from static attribute when not soft disabled', async () => {
        await render(
          `<button ngpSoftDisabled softDisabled="false" aria-disabled="true">Click me</button>`,
          { imports: [NgpSoftDisabled] },
        );

        expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true');
      });

      it('should not set aria-disabled when static attribute is "false" and not soft disabled', async () => {
        // ARIA best practice: aria-disabled="false" is redundant, so we don't set the attribute
        await render(
          `<button ngpSoftDisabled softDisabled="false" aria-disabled="false">Click me</button>`,
          { imports: [NgpSoftDisabled] },
        );

        // Absence of attribute implies not disabled
        expect(screen.getByRole('button')).not.toHaveAttribute('aria-disabled');
      });

      it('should override static aria-disabled with soft disabled state', async () => {
        await render(
          `<button ngpSoftDisabled softDisabled aria-disabled="false">Click me</button>`,
          { imports: [NgpSoftDisabled] },
        );

        // Soft disabled=true forces aria-disabled to "true"
        expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true');
      });

      it('should revert to initial aria-disabled attribute when soft disabled is toggled off', async () => {
        const { rerender, fixture } = await render(
          `<button ngpSoftDisabled [softDisabled]="softDisabled" aria-disabled="true">Click me</button>`,
          {
            imports: [NgpSoftDisabled],
            componentProperties: { softDisabled: false },
          },
        );

        const button = screen.getByRole('button');
        // Initial state: not soft disabled, uses attribute value
        expect(button).toHaveAttribute('aria-disabled', 'true');

        await rerender({ componentProperties: { softDisabled: true } });
        fixture.detectChanges();
        // Soft disabled forces aria-disabled="true"
        expect(button).toHaveAttribute('aria-disabled', 'true');

        await rerender({ componentProperties: { softDisabled: false } });
        fixture.detectChanges();
        // Should revert to initial attribute value
        expect(button).toHaveAttribute('aria-disabled', 'true');
      });

      it('should handle aria-disabled state transitions with initial false value', async () => {
        const { rerender, fixture } = await render(
          `<button ngpSoftDisabled [softDisabled]="softDisabled" aria-disabled="false">Click me</button>`,
          {
            imports: [NgpSoftDisabled],
            componentProperties: { softDisabled: false },
          },
        );

        const button = screen.getByRole('button');
        // aria-disabled="false" is not set; absence of attribute implies not disabled
        expect(button).not.toHaveAttribute('aria-disabled');

        await rerender({ componentProperties: { softDisabled: true } });
        fixture.detectChanges();
        expect(button).toHaveAttribute('aria-disabled', 'true');

        await rerender({ componentProperties: { softDisabled: false } });
        fixture.detectChanges();
        // Should revert to no attribute (false value = no attribute)
        expect(button).not.toHaveAttribute('aria-disabled');
      });

      it('should not set aria-disabled when no attribute provided and not soft disabled', async () => {
        await render(`<button ngpSoftDisabled softDisabled="false">Click me</button>`, {
          imports: [NgpSoftDisabled],
        });

        expect(screen.getByRole('button')).not.toHaveAttribute('aria-disabled');
      });

      it('should prefer property binding over static attribute for aria-disabled', async () => {
        await render(
          `<button ngpSoftDisabled softDisabled="false" aria-disabled="true" [ariaDisabled]="false">Click me</button>`,
          { imports: [NgpSoftDisabled] },
        );

        // Property binding [ariaDisabled]="false" takes precedence over aria-disabled="true"
        // false value = no attribute (ARIA best practice)
        expect(screen.getByRole('button')).not.toHaveAttribute('aria-disabled');
      });
    });

    describe('combined tabindex and aria-disabled initialization', () => {
      it('should initialize both from static attributes', async () => {
        await render(
          `<button ngpSoftDisabled softDisabled="false" tabindex="3" aria-disabled="true">Click me</button>`,
          { imports: [NgpSoftDisabled] },
        );

        const button = screen.getByRole('button');
        expect(button).toHaveAttribute('tabindex', '3');
        expect(button).toHaveAttribute('aria-disabled', 'true');
      });

      it('should handle state transitions preserving both initial values', async () => {
        const { rerender, fixture } = await render(
          `<button ngpSoftDisabled [softDisabled]="softDisabled" tabindex="-1" aria-disabled="true">Click me</button>`,
          {
            imports: [NgpSoftDisabled],
            componentProperties: { softDisabled: false },
          },
        );

        const button = screen.getByRole('button');
        expect(button).toHaveAttribute('tabindex', '-1');
        expect(button).toHaveAttribute('aria-disabled', 'true');

        await rerender({ componentProperties: { softDisabled: true } });
        fixture.detectChanges();
        // Adjusted for soft disabled state
        expect(button).toHaveAttribute('tabindex', '0');
        expect(button).toHaveAttribute('aria-disabled', 'true');

        await rerender({ componentProperties: { softDisabled: false } });
        fixture.detectChanges();
        // Reverted to initial values
        expect(button).toHaveAttribute('tabindex', '-1');
        expect(button).toHaveAttribute('aria-disabled', 'true');
      });

      it('should handle focusable toggle with preserved tabindex', async () => {
        const { rerender, fixture } = await render(
          `<button ngpSoftDisabled softDisabled [softDisabledFocusable]="focusable" tabindex="-2">Click me</button>`,
          {
            imports: [NgpSoftDisabled],
            componentProperties: { focusable: true },
          },
        );

        const button = screen.getByRole('button');
        // Focusable: negative adjusted to 0
        expect(button).toHaveAttribute('tabindex', '0');

        await rerender({ componentProperties: { focusable: false } });
        fixture.detectChanges();
        // Not focusable: uses min(-1, -2) = -2
        expect(button).toHaveAttribute('tabindex', '-2');

        await rerender({ componentProperties: { focusable: true } });
        fixture.detectChanges();
        // Back to focusable: adjusted to 0
        expect(button).toHaveAttribute('tabindex', '0');
      });
    });

    describe('non-native element attribute initialization', () => {
      it('should initialize tabindex from static attribute on div', async () => {
        await render(
          `<div ngpSoftDisabled softDisabled="false" tabindex="2" role="button">Click me</div>`,
          { imports: [NgpSoftDisabled] },
        );

        expect(screen.getByRole('button')).toHaveAttribute('tabindex', '2');
      });

      it('should initialize aria-disabled from static attribute on div', async () => {
        await render(
          `<div ngpSoftDisabled softDisabled="false" aria-disabled="true" role="button">Click me</div>`,
          { imports: [NgpSoftDisabled] },
        );

        expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true');
      });

      it('should handle state transitions on non-native elements', async () => {
        const { rerender, fixture } = await render(
          `<div ngpSoftDisabled [softDisabled]="softDisabled" tabindex="-1" aria-disabled="true" role="button">Click me</div>`,
          {
            imports: [NgpSoftDisabled],
            componentProperties: { softDisabled: false },
          },
        );

        const div = screen.getByRole('button');
        expect(div).toHaveAttribute('tabindex', '-1');
        expect(div).toHaveAttribute('aria-disabled', 'true');

        await rerender({ componentProperties: { softDisabled: true } });
        fixture.detectChanges();
        expect(div).toHaveAttribute('tabindex', '0');
        expect(div).toHaveAttribute('aria-disabled', 'true');

        await rerender({ componentProperties: { softDisabled: false } });
        fixture.detectChanges();
        expect(div).toHaveAttribute('tabindex', '-1');
        expect(div).toHaveAttribute('aria-disabled', 'true');
      });
    });

    describe('programmatic changes with initial attributes', () => {
      it('should allow setTabIndex to override initial attribute', async () => {
        const { fixture } = await render(
          `<button ngpSoftDisabled softDisabled="false" tabindex="5" #ref="ngpSoftDisabled">Click me</button>`,
          { imports: [NgpSoftDisabled] },
        );

        const button = screen.getByRole('button');
        expect(button).toHaveAttribute('tabindex', '5');

        const directive = fixture.debugElement.children[0].references['ref'] as NgpSoftDisabled;
        directive.setTabIndex(10);
        fixture.detectChanges();

        expect(button).toHaveAttribute('tabindex', '10');
      });

      it('should allow setAriaDisabled to override with programmatic value', async () => {
        const { fixture } = await render(
          `<button ngpSoftDisabled softDisabled="false" #ref="ngpSoftDisabled">Click me</button>`,
          { imports: [NgpSoftDisabled] },
        );

        const button = screen.getByRole('button');
        // Initially no attribute (not soft disabled, ariaDisabled defaults to false)
        expect(button).not.toHaveAttribute('aria-disabled');

        const directive = fixture.debugElement.children[0].references['ref'] as NgpSoftDisabled;
        directive.setAriaDisabled(true);
        fixture.detectChanges();

        expect(button).toHaveAttribute('aria-disabled', 'true');

        directive.setAriaDisabled(false);
        fixture.detectChanges();

        // false value removes attribute
        expect(button).not.toHaveAttribute('aria-disabled');
      });

      it('should maintain programmatic tabIndex through soft disabled state changes', async () => {
        const { fixture, rerender } = await render(
          `<button ngpSoftDisabled [softDisabled]="softDisabled" tabindex="1" #ref="ngpSoftDisabled">Click me</button>`,
          {
            imports: [NgpSoftDisabled],
            componentProperties: { softDisabled: false },
          },
        );

        const button = screen.getByRole('button');
        const directive = fixture.debugElement.children[0].references['ref'] as NgpSoftDisabled;

        // Set programmatic value
        directive.setTabIndex(7);
        fixture.detectChanges();
        expect(button).toHaveAttribute('tabindex', '7');

        // Toggle soft disabled
        await rerender({ componentProperties: { softDisabled: true } });
        fixture.detectChanges();
        // Should still use programmatic value (7 is positive, so no adjustment needed)
        expect(button).toHaveAttribute('tabindex', '7');

        await rerender({ componentProperties: { softDisabled: false } });
        fixture.detectChanges();
        expect(button).toHaveAttribute('tabindex', '7');
      });
    });
  });
});
