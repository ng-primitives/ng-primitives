import { By } from '@angular/platform-browser';
import { fireEvent, render, screen } from '@testing-library/angular';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { NgpInputOtpInput } from '../../input-otp-input/input-otp-input';
import { NgpInputOtpSlot } from '../../input-otp-slot/input-otp-slot';
import { NgpInputOtp } from '../input-otp';
import { NgpInputOtpStateToken } from '../input-otp-state';

const imports = [NgpInputOtp, NgpInputOtpInput, NgpInputOtpSlot];

/** Render the raw primitive with a configurable number of slots. */
async function renderOtp(
  slotCount: number,
  attrs = '',
  componentProperties: Record<string, unknown> = {},
) {
  const slots = Array.from(
    { length: slotCount },
    (_, i) => `<div ngpInputOtpSlot data-testid="slot-${i}"></div>`,
  ).join('\n');

  return render(
    `
    <div ngpInputOtp ${attrs} data-testid="input-otp">
      <input ngpInputOtpInput data-testid="hidden-input" />
      ${slots}
    </div>
  `,
    { imports, componentProperties },
  );
}

function getInput(): HTMLInputElement {
  return screen.getByTestId('hidden-input') as HTMLInputElement;
}

describe('NgpInputOtp', () => {
  describe('roles & attributes', () => {
    it('renders the container, hidden input, and slots', async () => {
      await renderOtp(2);
      expect(screen.getByTestId('input-otp')).toBeInTheDocument();
      expect(screen.getByTestId('hidden-input')).toBeInTheDocument();
      expect(screen.getByTestId('slot-0')).toBeInTheDocument();
      expect(screen.getByTestId('slot-1')).toBeInTheDocument();
    });

    it('exposes autocomplete="one-time-code" on the hidden input', async () => {
      await renderOtp(1);
      expect(getInput()).toHaveAttribute('autocomplete', 'one-time-code');
    });

    it('gives every slot role="presentation"', async () => {
      await renderOtp(2);
      expect(screen.getByTestId('slot-0')).toHaveAttribute('role', 'presentation');
      expect(screen.getByTestId('slot-1')).toHaveAttribute('role', 'presentation');
    });

    it('auto-assigns slot indices in registration order', async () => {
      await renderOtp(3);
      expect(screen.getByTestId('slot-0')).toHaveAttribute('data-slot-index', '0');
      expect(screen.getByTestId('slot-1')).toHaveAttribute('data-slot-index', '1');
      expect(screen.getByTestId('slot-2')).toHaveAttribute('data-slot-index', '2');
    });

    it('derives maxlength from the number of slots', async () => {
      await renderOtp(4);
      expect(getInput()).toHaveAttribute('maxlength', '4');
    });

    it('derives a different maxlength for a different slot count', async () => {
      await renderOtp(3);
      expect(getInput()).toHaveAttribute('maxlength', '3');
    });

    it('reflects the pattern attribute onto the input', async () => {
      await renderOtp(1, `[ngpInputOtpPattern]="'[A-Z]'"`);
      expect(getInput()).toHaveAttribute('pattern', '[A-Z]');
    });

    it('reflects the input mode onto the input', async () => {
      await renderOtp(1, `[ngpInputOtpInputMode]="'tel'"`);
      expect(getInput()).toHaveAttribute('inputmode', 'tel');
    });

    it('defaults the input mode to text', async () => {
      await renderOtp(1);
      expect(getInput()).toHaveAttribute('inputmode', 'text');
    });
  });

  describe('initial value', () => {
    it('spreads the initial value across the slots', async () => {
      await renderOtp(3, `[ngpInputOtpValue]="'123'"`);

      expect(getInput().value).toBe('123');
      expect(screen.getByTestId('slot-0')).toHaveTextContent('1');
      expect(screen.getByTestId('slot-1')).toHaveTextContent('2');
      expect(screen.getByTestId('slot-2')).toHaveTextContent('3');
    });

    it('renders empty slots for an empty value', async () => {
      await renderOtp(2, `[ngpInputOtpValue]="''"`);
      expect(screen.getByTestId('slot-0')).toHaveTextContent('');
      expect(screen.getByTestId('slot-1')).toHaveTextContent('');
    });

    it('only displays as many characters as there are slots', async () => {
      await renderOtp(3, `[ngpInputOtpValue]="'12345'"`);
      expect(screen.getByTestId('slot-0')).toHaveTextContent('1');
      expect(screen.getByTestId('slot-1')).toHaveTextContent('2');
      expect(screen.getByTestId('slot-2')).toHaveTextContent('3');
    });

    it('marks filled slots with data-filled', async () => {
      await renderOtp(3, `[ngpInputOtpValue]="'12'"`);
      expect(screen.getByTestId('slot-0')).toHaveAttribute('data-filled');
      expect(screen.getByTestId('slot-1')).toHaveAttribute('data-filled');
      expect(screen.getByTestId('slot-2')).not.toHaveAttribute('data-filled');
    });
  });

  describe('typing / entry', () => {
    it('distributes typed characters across the slots', async () => {
      await renderOtp(3);
      const input = getInput();

      fireEvent.focus(input);
      fireEvent.input(input, { target: { value: '123' } });

      expect(screen.getByTestId('slot-0')).toHaveTextContent('1');
      expect(screen.getByTestId('slot-1')).toHaveTextContent('2');
      expect(screen.getByTestId('slot-2')).toHaveTextContent('3');
    });

    it('marks slots as filled as characters are entered', async () => {
      await renderOtp(3);
      const input = getInput();

      fireEvent.focus(input);
      fireEvent.input(input, { target: { value: '12' } });

      expect(screen.getByTestId('slot-0')).toHaveAttribute('data-filled');
      expect(screen.getByTestId('slot-1')).toHaveAttribute('data-filled');
      expect(screen.getByTestId('slot-2')).not.toHaveAttribute('data-filled');
    });

    it('rejects characters that do not match the pattern', async () => {
      await renderOtp(4);
      const input = getInput();

      fireEvent.focus(input);
      fireEvent.input(input, { target: { value: '1a2b' } });

      // default pattern is [0-9]; letters are stripped
      expect(input.value).toBe('12');
      expect(screen.getByTestId('slot-0')).toHaveTextContent('1');
      expect(screen.getByTestId('slot-1')).toHaveTextContent('2');
      expect(screen.getByTestId('slot-2')).toHaveTextContent('');
    });

    it('caps typed input at the number of slots', async () => {
      await renderOtp(3);
      const input = getInput();

      fireEvent.focus(input);
      fireEvent.input(input, { target: { value: '123456' } });

      expect(input.value).toBe('123');
      expect(screen.getByTestId('slot-0')).toHaveTextContent('1');
      expect(screen.getByTestId('slot-1')).toHaveTextContent('2');
      expect(screen.getByTestId('slot-2')).toHaveTextContent('3');
    });

    it('types through the real input via the keyboard', async () => {
      await renderOtp(4);
      const input = getInput();

      await userEvent.click(input);
      await userEvent.keyboard('42');

      expect(input.value).toBe('42');
      expect(screen.getByTestId('slot-0')).toHaveTextContent('4');
      expect(screen.getByTestId('slot-1')).toHaveTextContent('2');
    });
  });

  describe('paste', () => {
    function paste(input: HTMLElement, text: string): void {
      const clipboardData = new DataTransfer();
      clipboardData.setData('text', text);
      // fireEvent dispatches the event AND flushes Angular change detection, unlike a
      // raw dispatchEvent; ClipboardEvent carries clipboardData that fireEvent.paste drops.
      fireEvent(
        input,
        new ClipboardEvent('paste', { clipboardData, bubbles: true, cancelable: true }),
      );
    }

    it('fills every slot from a full pasted code', async () => {
      await renderOtp(4);
      const input = getInput();

      fireEvent.focus(input);
      paste(input, '1234');

      expect(input.value).toBe('1234');
      expect(screen.getByTestId('slot-0')).toHaveTextContent('1');
      expect(screen.getByTestId('slot-3')).toHaveTextContent('4');
    });

    it('accepts a partial pasted code', async () => {
      await renderOtp(4);
      const input = getInput();

      fireEvent.focus(input);
      paste(input, '12');

      expect(input.value).toBe('12');
      expect(screen.getByTestId('slot-0')).toHaveTextContent('1');
      expect(screen.getByTestId('slot-1')).toHaveTextContent('2');
      expect(screen.getByTestId('slot-2')).toHaveTextContent('');
    });

    it('strips pattern-violating characters from the paste', async () => {
      await renderOtp(4);
      const input = getInput();

      fireEvent.focus(input);
      paste(input, '1-2-3-4');

      expect(input.value).toBe('1234');
    });

    it('caps a pasted code longer than the slots', async () => {
      await renderOtp(4);
      const input = getInput();

      fireEvent.focus(input);
      paste(input, '1234567890');

      expect(input.value).toBe('1234');
    });

    it('applies a custom paste transformer before validation', async () => {
      await renderOtp(4, `[ngpInputOtpPasteTransformer]="transformer"`, {
        transformer: (text: string) => text.replace(/\D/g, ''),
      });
      const input = getInput();

      fireEvent.focus(input);
      paste(input, 'code: 9 8 7 6');

      expect(input.value).toBe('9876');
    });
  });

  describe('backspace / delete', () => {
    it('shortens the value and moves the active slot backwards', async () => {
      await renderOtp(5);
      const input = getInput();

      fireEvent.focus(input);
      fireEvent.input(input, { target: { value: '123' } });
      // caret sits in the next empty slot
      expect(screen.getByTestId('slot-3')).toHaveAttribute('data-caret');

      // deleting a character is an input event with a shorter value
      fireEvent.input(input, { target: { value: '12' } });
      expect(input.value).toBe('12');
      expect(screen.getByTestId('slot-2')).toHaveAttribute('data-caret');
      expect(screen.getByTestId('slot-2')).not.toHaveAttribute('data-filled');
    });

    it('clears back to empty', async () => {
      await renderOtp(3);
      const input = getInput();

      fireEvent.focus(input);
      fireEvent.input(input, { target: { value: '12' } });
      fireEvent.input(input, { target: { value: '' } });

      expect(input.value).toBe('');
      expect(screen.getByTestId('slot-0')).toHaveTextContent('');
      expect(screen.getByTestId('slot-0')).not.toHaveAttribute('data-filled');
    });
  });

  describe('focus, selection & navigation', () => {
    it('activates the first slot on focus', async () => {
      await renderOtp(2);
      const input = getInput();

      fireEvent.focus(input);
      expect(screen.getByTestId('slot-0')).toHaveAttribute('data-active');
    });

    it('shows a caret in the empty focused slot', async () => {
      await renderOtp(2);
      const input = getInput();

      fireEvent.focus(input);
      expect(screen.getByTestId('slot-0')).toHaveAttribute('data-caret');
    });

    it('advances the active/caret slot as characters are entered', async () => {
      await renderOtp(4);
      const input = getInput();

      fireEvent.focus(input);
      fireEvent.input(input, { target: { value: '12' } });

      // caret is on the next empty slot
      expect(screen.getByTestId('slot-2')).toHaveAttribute('data-caret');
      expect(screen.getByTestId('slot-2')).toHaveAttribute('data-active');
      expect(screen.getByTestId('slot-0')).not.toHaveAttribute('data-caret');
    });

    it('keeps the last slot active (no caret) once the code is complete', async () => {
      await renderOtp(3);
      const input = getInput();

      fireEvent.focus(input);
      fireEvent.input(input, { target: { value: '123' } });

      const last = screen.getByTestId('slot-2');
      expect(last).toHaveAttribute('data-active');
      // no caret once every slot is filled
      expect(last).not.toHaveAttribute('data-caret');
    });

    it('removes the active state on blur', async () => {
      await renderOtp(2);
      const input = getInput();

      fireEvent.focus(input);
      expect(screen.getByTestId('slot-0')).toHaveAttribute('data-active');

      fireEvent.blur(input);
      expect(screen.getByTestId('slot-0')).not.toHaveAttribute('data-active');
    });

    it('focuses the input when a slot is clicked', async () => {
      await renderOtp(2);
      const input = getInput();

      fireEvent.click(screen.getByTestId('slot-1'));
      expect(input).toHaveFocus();
    });
  });

  describe('placeholder', () => {
    it('shows the placeholder in empty slots and flags them', async () => {
      await renderOtp(2, `[ngpInputOtpPlaceholder]="'•'"`);

      expect(screen.getByTestId('slot-0')).toHaveTextContent('•');
      expect(screen.getByTestId('slot-0')).toHaveAttribute('data-placeholder');
      expect(screen.getByTestId('slot-1')).toHaveTextContent('•');
      expect(screen.getByTestId('slot-1')).toHaveAttribute('data-placeholder');
    });

    it('does not show the placeholder in filled slots', async () => {
      await renderOtp(2, `[ngpInputOtpValue]="'1'" [ngpInputOtpPlaceholder]="'•'"`);

      expect(screen.getByTestId('slot-0')).toHaveTextContent('1');
      expect(screen.getByTestId('slot-0')).not.toHaveAttribute('data-placeholder');
      expect(screen.getByTestId('slot-1')).toHaveTextContent('•');
      expect(screen.getByTestId('slot-1')).toHaveAttribute('data-placeholder');
    });
  });

  describe('disabled', () => {
    it('reflects the disabled attribute onto the input', async () => {
      await renderOtp(1, `[ngpInputOtpDisabled]="true"`);
      expect(getInput()).toHaveAttribute('disabled');
    });

    it('ignores typing while disabled', async () => {
      await renderOtp(3, `[ngpInputOtpDisabled]="true"`);
      const input = getInput();

      fireEvent.focus(input);
      fireEvent.input(input, { target: { value: '123' } });

      expect(screen.getByTestId('slot-0')).toHaveTextContent('');
      expect(screen.getByTestId('slot-0')).not.toHaveAttribute('data-filled');
    });

    it('ignores paste while disabled', async () => {
      await renderOtp(3, `[ngpInputOtpDisabled]="true"`);
      const input = getInput();

      const clipboardData = new DataTransfer();
      clipboardData.setData('text', '123');
      fireEvent(
        input,
        new ClipboardEvent('paste', { clipboardData, bubbles: true, cancelable: true }),
      );

      expect(screen.getByTestId('slot-0')).toHaveTextContent('');
    });

    it('does not focus the input when a slot is clicked while disabled', async () => {
      await renderOtp(2, `[ngpInputOtpDisabled]="true"`);
      const input = getInput();

      fireEvent.click(screen.getByTestId('slot-1'));
      expect(input).not.toHaveFocus();
    });
  });

  describe('directive API', () => {
    it('focuses the hidden input via the input directive focus()', async () => {
      const { fixture } = await renderOtp(3);
      const inputDirective = fixture.debugElement
        .query(By.directive(NgpInputOtpInput))
        .injector.get(NgpInputOtpInput);

      inputDirective.focus();

      expect(document.activeElement).toBe(getInput());
    });

    it('emits valueChange as the value changes', async () => {
      const valueChange = vi.fn();
      await render(
        `
        <div ngpInputOtp (ngpInputOtpValueChange)="valueChange($event)">
          <input ngpInputOtpInput data-testid="hidden-input" />
          <div ngpInputOtpSlot></div>
          <div ngpInputOtpSlot></div>
          <div ngpInputOtpSlot></div>
        </div>
        `,
        { imports, componentProperties: { valueChange } },
      );

      const input = getInput();
      fireEvent.focus(input);
      fireEvent.input(input, { target: { value: '12' } });

      expect(valueChange).toHaveBeenCalledWith('12');
    });

    it('emits complete only once the OTP is fully entered', async () => {
      const complete = vi.fn();
      await render(
        `
        <div ngpInputOtp (ngpInputOtpComplete)="complete($event)">
          <input ngpInputOtpInput data-testid="hidden-input" />
          <div ngpInputOtpSlot></div>
          <div ngpInputOtpSlot></div>
          <div ngpInputOtpSlot></div>
        </div>
        `,
        { imports, componentProperties: { complete } },
      );

      const input = getInput();
      fireEvent.focus(input);

      fireEvent.input(input, { target: { value: '12' } });
      expect(complete).not.toHaveBeenCalled();

      fireEvent.input(input, { target: { value: '123' } });
      expect(complete).toHaveBeenCalledWith('123');
      expect(complete).toHaveBeenCalledTimes(1);
    });

    it('does not re-emit valueChange when the value is unchanged', async () => {
      const valueChange = vi.fn();
      await render(
        `
        <div ngpInputOtp [ngpInputOtpValue]="'12'" (ngpInputOtpValueChange)="valueChange($event)">
          <input ngpInputOtpInput data-testid="hidden-input" />
          <div ngpInputOtpSlot></div>
          <div ngpInputOtpSlot></div>
        </div>
        `,
        { imports, componentProperties: { valueChange } },
      );

      const input = getInput();
      fireEvent.focus(input);
      fireEvent.input(input, { target: { value: '12' } });

      expect(valueChange).not.toHaveBeenCalled();
    });
  });

  describe('state observables', () => {
    async function renderWithState(slotCount: number, attrs = '') {
      const { fixture } = await renderOtp(slotCount, attrs);
      const state = fixture.debugElement
        .query(By.directive(NgpInputOtp))
        .injector.get(NgpInputOtpStateToken)();

      const valueChange = vi.fn();
      const complete = vi.fn();
      state.valueChange.subscribe(valueChange);
      state.complete.subscribe(complete);

      return { valueChange, complete };
    }

    it('emits state.valueChange as the value changes', async () => {
      const { valueChange } = await renderWithState(3);
      const input = getInput();

      fireEvent.focus(input);
      fireEvent.input(input, { target: { value: '1' } });
      fireEvent.input(input, { target: { value: '12' } });

      expect(valueChange).toHaveBeenNthCalledWith(1, '1');
      expect(valueChange).toHaveBeenNthCalledWith(2, '12');
    });

    it('does not emit state.valueChange when the value is unchanged', async () => {
      const { valueChange } = await renderWithState(2, `[ngpInputOtpValue]="'12'"`);
      const input = getInput();

      fireEvent.focus(input);
      fireEvent.input(input, { target: { value: '12' } });

      expect(valueChange).not.toHaveBeenCalled();
    });

    it('emits state.complete only once the OTP reaches maxLength', async () => {
      const { complete } = await renderWithState(3);
      const input = getInput();

      fireEvent.focus(input);
      fireEvent.input(input, { target: { value: '12' } });
      expect(complete).not.toHaveBeenCalled();

      fireEvent.input(input, { target: { value: '123' } });
      expect(complete).toHaveBeenCalledWith('123');
      expect(complete).toHaveBeenCalledTimes(1);
    });

    it('does not emit state.complete when a complete value is shortened', async () => {
      const { complete } = await renderWithState(3);
      const input = getInput();

      fireEvent.focus(input);
      fireEvent.input(input, { target: { value: '123' } });
      fireEvent.input(input, { target: { value: '12' } });

      expect(complete).toHaveBeenCalledTimes(1);
    });
  });

  describe('programmatic value updates', () => {
    it('updates the slots when the bound value changes', async () => {
      const { rerender, fixture } = await render(
        `
        <div ngpInputOtp [ngpInputOtpValue]="value">
          <input ngpInputOtpInput data-testid="hidden-input" />
          <div ngpInputOtpSlot data-testid="slot-0"></div>
          <div ngpInputOtpSlot data-testid="slot-1"></div>
        </div>
        `,
        { imports, componentProperties: { value: '12' } },
      );

      expect(screen.getByTestId('slot-0')).toHaveTextContent('1');

      await rerender({ componentProperties: { value: '34' } });
      await fixture.whenStable();

      expect(screen.getByTestId('slot-0')).toHaveTextContent('3');
      expect(screen.getByTestId('slot-1')).toHaveTextContent('4');
    });

    it('keeps the hidden input value in sync after a programmatic change', async () => {
      const { rerender, fixture } = await render(
        `
        <div ngpInputOtp [ngpInputOtpValue]="value">
          <input ngpInputOtpInput data-testid="hidden-input" />
          <div ngpInputOtpSlot data-testid="slot-0"></div>
          <div ngpInputOtpSlot data-testid="slot-1"></div>
        </div>
        `,
        { imports, componentProperties: { value: '12' } },
      );

      const input = getInput();
      expect(input.value).toBe('12');

      await rerender({ componentProperties: { value: '34' } });
      await fixture.whenStable();

      // a programmatic value change must keep the hidden input in sync, otherwise
      // the next keystroke appends to a stale value
      expect(input.value).toBe('34');
    });
  });

  describe('interaction data attributes', () => {
    it('toggles data-hover on mouse enter/leave', async () => {
      await renderOtp(1);
      const container = screen.getByTestId('input-otp');

      fireEvent.mouseEnter(container);
      expect(container).toHaveAttribute('data-hover');

      fireEvent.mouseLeave(container);
      expect(container).not.toHaveAttribute('data-hover');
    });

    it('toggles data-press on pointer down/up', async () => {
      await renderOtp(1);
      const container = screen.getByTestId('input-otp');

      fireEvent.pointerDown(container);
      expect(container).toHaveAttribute('data-press');

      fireEvent.pointerUp(container);
      expect(container).not.toHaveAttribute('data-press');
    });
  });

  describe('slot registration lifecycle', () => {
    it('updates maxlength and re-indexes when a slot is removed', async () => {
      const { rerender, fixture } = await render(
        `
        <div ngpInputOtp data-testid="input-otp">
          <input ngpInputOtpInput data-testid="hidden-input" />
          <div ngpInputOtpSlot data-testid="slot-0"></div>
          <div ngpInputOtpSlot data-testid="slot-1"></div>
          @if (showLast) {
            <div ngpInputOtpSlot data-testid="slot-2"></div>
          }
        </div>
        `,
        { imports, componentProperties: { showLast: true } },
      );

      expect(getInput()).toHaveAttribute('maxlength', '3');
      expect(screen.getByTestId('slot-2')).toHaveAttribute('data-slot-index', '2');

      // Removing a slot must deregister it (onDestroy → unregisterSlot), so maxlength
      // shrinks and the remaining slots keep contiguous indices.
      await rerender({ componentProperties: { showLast: false } });
      await fixture.whenStable();

      expect(screen.queryByTestId('slot-2')).not.toBeInTheDocument();
      expect(getInput()).toHaveAttribute('maxlength', '2');
      expect(screen.getByTestId('slot-0')).toHaveAttribute('data-slot-index', '0');
      expect(screen.getByTestId('slot-1')).toHaveAttribute('data-slot-index', '1');
    });
  });
});
