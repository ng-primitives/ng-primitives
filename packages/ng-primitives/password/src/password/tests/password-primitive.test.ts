import { LiveAnnouncer } from '@angular/cdk/a11y';
import { By } from '@angular/platform-browser';
import { fireEvent, render } from '@testing-library/angular';
import { NgpFormField, NgpLabel } from 'ng-primitives/form-field';
import { NgpPassword, NgpPasswordInput, NgpPasswordToggle } from 'ng-primitives/password';
import { describe, expect, it, vi } from 'vitest';

const imports = [NgpPassword, NgpPasswordInput, NgpPasswordToggle];

describe('NgpPassword', () => {
  describe('input type toggling', () => {
    it('should render the input as a password field by default', async () => {
      const { getByTestId } = await render(
        `
        <div ngpPassword>
          <input data-testid="input" ngpPasswordInput />
        </div>
        `,
        { imports },
      );

      expect(getByTestId('input')).toHaveAttribute('type', 'password');
    });

    it('should switch the input to a text field when visible', async () => {
      const { getByTestId, fixture } = await render(
        `
        <div ngpPassword>
          <input data-testid="input" ngpPasswordInput />
          <button data-testid="toggle" ngpPasswordToggle></button>
        </div>
        `,
        { imports },
      );

      fireEvent.click(getByTestId('toggle'));
      await fixture.whenStable();

      expect(getByTestId('input')).toHaveAttribute('type', 'text');

      fireEvent.click(getByTestId('toggle'));
      await fixture.whenStable();

      expect(getByTestId('input')).toHaveAttribute('type', 'password');
    });

    it('should honour ngpPasswordDefaultVisible for uncontrolled usage', async () => {
      const { getByTestId } = await render(
        `
        <div ngpPassword ngpPasswordDefaultVisible>
          <input data-testid="input" ngpPasswordInput />
        </div>
        `,
        { imports },
      );

      expect(getByTestId('input')).toHaveAttribute('type', 'text');
    });
  });

  describe('data-visible attribute', () => {
    it('should reflect visibility on the container, input and toggle', async () => {
      const { getByTestId, fixture } = await render(
        `
        <div data-testid="container" ngpPassword>
          <input data-testid="input" ngpPasswordInput />
          <button data-testid="toggle" ngpPasswordToggle></button>
        </div>
        `,
        { imports },
      );

      for (const id of ['container', 'input', 'toggle']) {
        expect(getByTestId(id)).not.toHaveAttribute('data-visible');
      }

      fireEvent.click(getByTestId('toggle'));
      await fixture.whenStable();

      for (const id of ['container', 'input', 'toggle']) {
        expect(getByTestId(id)).toHaveAttribute('data-visible', '');
      }
    });
  });

  describe('toggle button accessibility', () => {
    it('should force type="button" so it never submits a form', async () => {
      const { getByTestId } = await render(
        `
        <div ngpPassword>
          <input ngpPasswordInput />
          <button data-testid="toggle" ngpPasswordToggle></button>
        </div>
        `,
        { imports },
      );

      expect(getByTestId('toggle')).toHaveAttribute('type', 'button');
    });

    it('should point aria-controls at the input id', async () => {
      const { getByTestId } = await render(
        `
        <div ngpPassword>
          <input data-testid="input" ngpPasswordInput />
          <button data-testid="toggle" ngpPasswordToggle></button>
        </div>
        `,
        { imports },
      );

      const inputId = getByTestId('input').getAttribute('id');
      expect(inputId).toBeTruthy();
      expect(getByTestId('toggle')).toHaveAttribute('aria-controls', inputId!);
    });

    it('should swap the aria-label between show and hide', async () => {
      const { getByTestId, fixture } = await render(
        `
        <div ngpPassword>
          <input ngpPasswordInput />
          <button data-testid="toggle" ngpPasswordToggle></button>
        </div>
        `,
        { imports },
      );

      const toggle = getByTestId('toggle');
      expect(toggle).toHaveAttribute('aria-label', 'Show password');

      fireEvent.click(toggle);
      await fixture.whenStable();

      expect(toggle).toHaveAttribute('aria-label', 'Hide password');
    });

    it('should not set an aria-label when the button has visible text', async () => {
      const { getByTestId } = await render(
        `
        <div ngpPassword>
          <input ngpPasswordInput />
          <button data-testid="toggle" ngpPasswordToggle>Show</button>
        </div>
        `,
        { imports },
      );

      expect(getByTestId('toggle')).not.toHaveAttribute('aria-label');
    });

    it('should allow overriding the labels', async () => {
      const { getByTestId } = await render(
        `
        <div ngpPassword>
          <input ngpPasswordInput />
          <button
            data-testid="toggle"
            ngpPasswordToggle
            ngpPasswordToggleShowLabel="Reveal"
            ngpPasswordToggleHideLabel="Conceal"
          ></button>
        </div>
        `,
        { imports },
      );

      expect(getByTestId('toggle')).toHaveAttribute('aria-label', 'Reveal');
    });
  });

  describe('announcements', () => {
    it('should announce the visibility change politely', async () => {
      const announce = vi.fn();
      const { getByTestId, fixture } = await render(
        `
        <div ngpPassword>
          <input ngpPasswordInput />
          <button data-testid="toggle" ngpPasswordToggle></button>
        </div>
        `,
        { imports, providers: [{ provide: LiveAnnouncer, useValue: { announce } }] },
      );

      fireEvent.click(getByTestId('toggle'));
      await fixture.whenStable();
      expect(announce).toHaveBeenLastCalledWith('Your password is shown');

      fireEvent.click(getByTestId('toggle'));
      await fixture.whenStable();
      expect(announce).toHaveBeenLastCalledWith('Your password is hidden');
    });
  });

  describe('two-way binding', () => {
    it('should emit ngpPasswordVisibleChange when toggled', async () => {
      const onChange = vi.fn();
      const { getByTestId, fixture } = await render(
        `
        <div ngpPassword (ngpPasswordVisibleChange)="onChange($event)">
          <input ngpPasswordInput />
          <button data-testid="toggle" ngpPasswordToggle></button>
        </div>
        `,
        { imports, componentProperties: { onChange } },
      );

      fireEvent.click(getByTestId('toggle'));
      await fixture.whenStable();

      expect(onChange).toHaveBeenCalledWith(true);
    });

    it('should stay controlled when ngpPasswordVisible is bound', async () => {
      const { getByTestId, fixture } = await render(
        `
        <div ngpPassword [ngpPasswordVisible]="visible">
          <input data-testid="input" ngpPasswordInput />
          <button data-testid="toggle" ngpPasswordToggle></button>
        </div>
        `,
        { imports, componentProperties: { visible: false } },
      );

      // clicking must not change the input type because the parent controls it
      fireEvent.click(getByTestId('toggle'));
      await fixture.whenStable();

      expect(getByTestId('input')).toHaveAttribute('type', 'password');
    });
  });

  describe('reset on form submit', () => {
    it('should hide a revealed password when the form is submitted', async () => {
      const { getByTestId, fixture } = await render(
        `
        <form>
          <div ngpPassword ngpPasswordDefaultVisible>
            <input data-testid="input" ngpPasswordInput />
            <button data-testid="toggle" ngpPasswordToggle></button>
          </div>
        </form>
        `,
        { imports },
      );

      const input = getByTestId('input');
      expect(input).toHaveAttribute('type', 'text');

      fireEvent.submit(input.closest('form')!);
      await fixture.whenStable();

      expect(input).toHaveAttribute('type', 'password');
    });
  });

  describe('ignore password managers', () => {
    it('should not set the opt-out attributes by default', async () => {
      const { getByTestId } = await render(
        `
        <div ngpPassword>
          <input data-testid="input" ngpPasswordInput />
        </div>
        `,
        { imports },
      );

      const input = getByTestId('input');
      expect(input).not.toHaveAttribute('data-1p-ignore');
      expect(input).not.toHaveAttribute('data-lpignore');
      expect(input).not.toHaveAttribute('data-bwignore');
    });

    it('should set the opt-out attributes when enabled', async () => {
      const { getByTestId } = await render(
        `
        <div ngpPassword>
          <input data-testid="input" ngpPasswordInput ngpPasswordInputIgnorePasswordManagers />
        </div>
        `,
        { imports },
      );

      const input = getByTestId('input');
      expect(input).toHaveAttribute('data-1p-ignore');
      expect(input).toHaveAttribute('data-lpignore', 'true');
      expect(input).toHaveAttribute('data-bwignore');
    });
  });

  describe('focus modality', () => {
    it('should return focus to the input after a pointer toggle', async () => {
      const { getByTestId, fixture } = await render(
        `
        <div ngpPassword>
          <input data-testid="input" ngpPasswordInput />
          <button data-testid="toggle" ngpPasswordToggle></button>
        </div>
        `,
        { imports },
      );

      const toggle = getByTestId('toggle');
      fireEvent.pointerDown(toggle);
      fireEvent.click(toggle);
      await fixture.whenStable();

      expect(document.activeElement).toBe(getByTestId('input'));
    });

    it('should keep focus on the button after a keyboard toggle', async () => {
      const { getByTestId, fixture } = await render(
        `
        <div ngpPassword>
          <input data-testid="input" ngpPasswordInput />
          <button data-testid="toggle" ngpPasswordToggle></button>
        </div>
        `,
        { imports },
      );

      const toggle = getByTestId('toggle') as HTMLButtonElement;
      toggle.focus();
      // a keyboard activation dispatches click with no preceding pointerdown
      fireEvent.click(toggle);
      await fixture.whenStable();

      expect(document.activeElement).toBe(toggle);
    });
  });

  describe('input composition (inherits ngpInput features)', () => {
    it('should reflect the disabled state on the input', async () => {
      const { getByTestId } = await render(
        `
        <div ngpPassword>
          <input data-testid="input" ngpPasswordInput disabled />
        </div>
        `,
        { imports },
      );

      expect(getByTestId('input')).toHaveAttribute('disabled');
    });

    it('should wire up form-field label association for free', async () => {
      const { getByTestId } = await render(
        `
        <div ngpFormField>
          <label data-testid="label" ngpLabel>Password</label>
          <div ngpPassword>
            <input data-testid="input" ngpPasswordInput />
          </div>
        </div>
        `,
        { imports: [...imports, NgpFormField, NgpLabel] },
      );

      const inputId = getByTestId('input').getAttribute('id');
      expect(inputId).toBeTruthy();
      expect(getByTestId('label')).toHaveAttribute('for', inputId!);
    });
  });

  describe('directive API', () => {
    it('should expose an imperative toggle()', async () => {
      const { fixture, getByTestId } = await render(
        `
        <div ngpPassword>
          <input data-testid="input" ngpPasswordInput />
        </div>
        `,
        { imports },
      );

      const password = fixture.debugElement
        .query(By.directive(NgpPassword))
        .injector.get(NgpPassword);

      expect(getByTestId('input')).toHaveAttribute('type', 'password');
      expect(password.isVisible()).toBe(false);

      password.toggle();
      fixture.detectChanges();
      await fixture.whenStable();

      expect(getByTestId('input')).toHaveAttribute('type', 'text');
      expect(password.isVisible()).toBe(true);
    });
  });
});
