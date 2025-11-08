import { FocusMonitor } from '@angular/cdk/a11y';
import { TestBed } from '@angular/core/testing';
import { fireEvent, render, screen } from '@testing-library/angular';
import { NgpInputOtp } from './input-otp';
import { NgpInputOtpInput } from '../input-otp-input/input-otp-input';
import { NgpInputOtpSlot } from '../input-otp-slot/input-otp-slot';

describe('NgpInputOtp', () => {
  describe('Basic Rendering', () => {
    it('should render with minimal setup', async () => {
      await render(
        `
        <div ngpInputOtp data-testid="input-otp">
          <input ngpInputOtpInput data-testid="hidden-input" />
          <div ngpInputOtpSlot data-testid="slot-0"></div>
          <div ngpInputOtpSlot data-testid="slot-1"></div>
        </div>
      `,
        {
          imports: [NgpInputOtp, NgpInputOtpInput, NgpInputOtpSlot],
        },
      );

      expect(screen.getByTestId('input-otp')).toBeInTheDocument();
      expect(screen.getByTestId('hidden-input')).toBeInTheDocument();
      expect(screen.getByTestId('slot-0')).toBeInTheDocument();
      expect(screen.getByTestId('slot-1')).toBeInTheDocument();
    });

    it('should automatically derive maxLength from number of slots', async () => {
      await render(
        `
        <div ngpInputOtp>
          <input ngpInputOtpInput data-testid="hidden-input" />
          <div ngpInputOtpSlot></div>
          <div ngpInputOtpSlot></div>
          <div ngpInputOtpSlot></div>
          <div ngpInputOtpSlot></div>
        </div>
      `,
        {
          imports: [NgpInputOtp, NgpInputOtpInput, NgpInputOtpSlot],
        },
      );

      const hiddenInput = screen.getByTestId('hidden-input');
      expect(hiddenInput).toHaveAttribute('maxlength', '4');
    });

    it('should auto-assign slot indices in order', async () => {
      await render(
        `
        <div ngpInputOtp>
          <input ngpInputOtpInput />
          <div ngpInputOtpSlot data-testid="slot-0"></div>
          <div ngpInputOtpSlot data-testid="slot-1"></div>
          <div ngpInputOtpSlot data-testid="slot-2"></div>
        </div>
      `,
        {
          imports: [NgpInputOtp, NgpInputOtpInput, NgpInputOtpSlot],
        },
      );

      expect(screen.getByTestId('slot-0')).toHaveAttribute('data-slot-index', '0');
      expect(screen.getByTestId('slot-1')).toHaveAttribute('data-slot-index', '1');
      expect(screen.getByTestId('slot-2')).toHaveAttribute('data-slot-index', '2');
    });
  });

  describe('Input Properties', () => {
    it('should set initial value', async () => {
      await render(
        `
        <div ngpInputOtp [ngpInputOtpValue]="'123'">
          <input ngpInputOtpInput data-testid="hidden-input" />
          <div ngpInputOtpSlot data-testid="slot-0"></div>
          <div ngpInputOtpSlot data-testid="slot-1"></div>
          <div ngpInputOtpSlot data-testid="slot-2"></div>
        </div>
      `,
        {
          imports: [NgpInputOtp, NgpInputOtpInput, NgpInputOtpSlot],
        },
      );

      const hiddenInput = screen.getByTestId('hidden-input') as HTMLInputElement;
      expect(hiddenInput.value).toBe('123');

      expect(screen.getByTestId('slot-0')).toHaveTextContent('1');
      expect(screen.getByTestId('slot-1')).toHaveTextContent('2');
      expect(screen.getByTestId('slot-2')).toHaveTextContent('3');
    });

    it('should apply disabled state', async () => {
      await render(
        `
        <div ngpInputOtp [ngpInputOtpDisabled]="true">
          <input ngpInputOtpInput data-testid="hidden-input" />
          <div ngpInputOtpSlot></div>
        </div>
      `,
        {
          imports: [NgpInputOtp, NgpInputOtpInput, NgpInputOtpSlot],
        },
      );

      expect(screen.getByTestId('hidden-input')).toHaveAttribute('disabled');
    });

    it('should apply pattern attribute', async () => {
      await render(
        `
        <div ngpInputOtp [ngpInputOtpPattern]="'[A-Z]'">
          <input ngpInputOtpInput data-testid="hidden-input" />
          <div ngpInputOtpSlot></div>
        </div>
      `,
        {
          imports: [NgpInputOtp, NgpInputOtpInput, NgpInputOtpSlot],
        },
      );

      expect(screen.getByTestId('hidden-input')).toHaveAttribute('pattern', '[A-Z]');
    });

    it('should apply input mode', async () => {
      await render(
        `
        <div ngpInputOtp [ngpInputOtpInputMode]="'tel'">
          <input ngpInputOtpInput data-testid="hidden-input" />
          <div ngpInputOtpSlot></div>
        </div>
      `,
        {
          imports: [NgpInputOtp, NgpInputOtpInput, NgpInputOtpSlot],
        },
      );

      expect(screen.getByTestId('hidden-input')).toHaveAttribute('inputmode', 'tel');
    });

    it('should show placeholder in empty slots', async () => {
      await render(
        `
        <div ngpInputOtp [ngpInputOtpPlaceholder]="'•'">
          <input ngpInputOtpInput />
          <div ngpInputOtpSlot data-testid="slot-0"></div>
          <div ngpInputOtpSlot data-testid="slot-1"></div>
        </div>
      `,
        {
          imports: [NgpInputOtp, NgpInputOtpInput, NgpInputOtpSlot],
        },
      );

      expect(screen.getByTestId('slot-0')).toHaveTextContent('•');
      expect(screen.getByTestId('slot-0')).toHaveAttribute('data-placeholder');
      expect(screen.getByTestId('slot-1')).toHaveTextContent('•');
      expect(screen.getByTestId('slot-1')).toHaveAttribute('data-placeholder');
    });
  });

  describe('Basic User Input', () => {
    it('should handle basic numeric input', async () => {
      await render(
        `
        <div ngpInputOtp [(ngpInputOtpValue)]="value">
          <input ngpInputOtpInput data-testid="hidden-input" />
          <div ngpInputOtpSlot data-testid="slot-0"></div>
          <div ngpInputOtpSlot data-testid="slot-1"></div>
          <div ngpInputOtpSlot data-testid="slot-2"></div>
        </div>
      `,
        {
          imports: [NgpInputOtp, NgpInputOtpInput, NgpInputOtpSlot],
          componentProperties: { value: '' },
        },
      );

      const hiddenInput = screen.getByTestId('hidden-input') as HTMLInputElement;

      fireEvent.focus(hiddenInput);
      fireEvent.input(hiddenInput, { target: { value: '123' } });

      expect(screen.getByTestId('slot-0')).toHaveTextContent('1');
      expect(screen.getByTestId('slot-1')).toHaveTextContent('2');
      expect(screen.getByTestId('slot-2')).toHaveTextContent('3');
    });

    it('should show filled state for slots with characters', async () => {
      await render(
        `
        <div ngpInputOtp [(ngpInputOtpValue)]="value">
          <input ngpInputOtpInput data-testid="hidden-input" />
          <div ngpInputOtpSlot data-testid="slot-0"></div>
          <div ngpInputOtpSlot data-testid="slot-1"></div>
          <div ngpInputOtpSlot data-testid="slot-2"></div>
        </div>
      `,
        {
          imports: [NgpInputOtp, NgpInputOtpInput, NgpInputOtpSlot],
          componentProperties: { value: '' },
        },
      );

      const hiddenInput = screen.getByTestId('hidden-input') as HTMLInputElement;

      fireEvent.focus(hiddenInput);
      fireEvent.input(hiddenInput, { target: { value: '12' } });

      expect(screen.getByTestId('slot-0')).toHaveAttribute('data-filled');
      expect(screen.getByTestId('slot-1')).toHaveAttribute('data-filled');
      expect(screen.getByTestId('slot-2')).not.toHaveAttribute('data-filled');
    });
  });

  describe('Focus and Selection', () => {
    it('should show focus state on active slot', async () => {
      await render(
        `
        <div ngpInputOtp>
          <input ngpInputOtpInput data-testid="hidden-input" />
          <div ngpInputOtpSlot data-testid="slot-0"></div>
        </div>
      `,
        {
          imports: [NgpInputOtp, NgpInputOtpInput, NgpInputOtpSlot],
        },
      );

      const hiddenInput = screen.getByTestId('hidden-input');
      const slot0 = screen.getByTestId('slot-0');

      fireEvent.focus(hiddenInput);

      expect(slot0).toHaveAttribute('data-active');
    });

    it('should show caret in empty focused slot', async () => {
      await render(
        `
        <div ngpInputOtp>
          <input ngpInputOtpInput data-testid="hidden-input" />
          <div ngpInputOtpSlot data-testid="slot-0"></div>
        </div>
      `,
        {
          imports: [NgpInputOtp, NgpInputOtpInput, NgpInputOtpSlot],
        },
      );

      const hiddenInput = screen.getByTestId('hidden-input');
      const slot0 = screen.getByTestId('slot-0');

      fireEvent.focus(hiddenInput);

      expect(slot0).toHaveAttribute('data-caret');
    });

    it('should remove focus state on blur', async () => {
      await render(
        `
        <div ngpInputOtp>
          <input ngpInputOtpInput data-testid="hidden-input" />
          <div ngpInputOtpSlot data-testid="slot-0"></div>
        </div>
      `,
        {
          imports: [NgpInputOtp, NgpInputOtpInput, NgpInputOtpSlot],
        },
      );

      const hiddenInput = screen.getByTestId('hidden-input');
      const slot0 = screen.getByTestId('slot-0');

      fireEvent.focus(hiddenInput);
      expect(slot0).toHaveAttribute('data-active');

      fireEvent.blur(hiddenInput);
      expect(slot0).not.toHaveAttribute('data-active');
    });
  });

  describe('Slot Interactions', () => {
    it('should focus input when clicking on slot', async () => {
      await render(
        `
        <div ngpInputOtp>
          <input ngpInputOtpInput data-testid="hidden-input" />
          <div ngpInputOtpSlot data-testid="slot-0"></div>
        </div>
      `,
        {
          imports: [NgpInputOtp, NgpInputOtpInput, NgpInputOtpSlot],
        },
      );

      const slot0 = screen.getByTestId('slot-0');
      const hiddenInput = screen.getByTestId('hidden-input');

      fireEvent.click(slot0);

      expect(hiddenInput).toHaveFocus();
    });
  });

  describe('Two-way Binding', () => {
    it('should support ngModel', async () => {
      await render(
        `
        <div ngpInputOtp [(ngpInputOtpValue)]="value">
          <input ngpInputOtpInput data-testid="hidden-input" />
          <div ngpInputOtpSlot data-testid="slot-0"></div>
          <div ngpInputOtpSlot data-testid="slot-1"></div>
          <div ngpInputOtpSlot data-testid="slot-2"></div>
        </div>
      `,
        {
          imports: [NgpInputOtp, NgpInputOtpInput, NgpInputOtpSlot],
          componentProperties: { value: '12' },
        },
      );

      // Initial value should be set
      expect(screen.getByTestId('slot-0')).toHaveTextContent('1');
      expect(screen.getByTestId('slot-1')).toHaveTextContent('2');

      // Typing should update the bound value
      const hiddenInput = screen.getByTestId('hidden-input') as HTMLInputElement;
      fireEvent.focus(hiddenInput);
      fireEvent.input(hiddenInput, { target: { value: '123' } });

      expect(screen.getByTestId('slot-2')).toHaveTextContent('3');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty value correctly', async () => {
      await render(
        `
        <div ngpInputOtp [ngpInputOtpValue]="''">
          <input ngpInputOtpInput />
          <div ngpInputOtpSlot data-testid="slot-0"></div>
          <div ngpInputOtpSlot data-testid="slot-1"></div>
        </div>
      `,
        {
          imports: [NgpInputOtp, NgpInputOtpInput, NgpInputOtpSlot],
        },
      );

      expect(screen.getByTestId('slot-0')).toHaveTextContent('');
      expect(screen.getByTestId('slot-1')).toHaveTextContent('');
    });

    it('should handle value longer than slots', async () => {
      await render(
        `
        <div ngpInputOtp [ngpInputOtpValue]="'12345'">
          <input ngpInputOtpInput />
          <div ngpInputOtpSlot data-testid="slot-0"></div>
          <div ngpInputOtpSlot data-testid="slot-1"></div>
          <div ngpInputOtpSlot data-testid="slot-2"></div>
        </div>
      `,
        {
          imports: [NgpInputOtp, NgpInputOtpInput, NgpInputOtpSlot],
        },
      );

      // Should only show first 3 characters
      expect(screen.getByTestId('slot-0')).toHaveTextContent('1');
      expect(screen.getByTestId('slot-1')).toHaveTextContent('2');
      expect(screen.getByTestId('slot-2')).toHaveTextContent('3');
    });

    it('should derive maxLength from different slot counts', async () => {
      // Test with 3 slots
      await render(
        `
        <div ngpInputOtp>
          <input ngpInputOtpInput data-testid="hidden-input" />
          <div ngpInputOtpSlot></div>
          <div ngpInputOtpSlot></div>
          <div ngpInputOtpSlot></div>
        </div>
      `,
        {
          imports: [NgpInputOtp, NgpInputOtpInput, NgpInputOtpSlot],
        },
      );

      const hiddenInput = screen.getByTestId('hidden-input');
      expect(hiddenInput).toHaveAttribute('maxlength', '3');
    });
  });

  describe('Accessibility', () => {
    it('should have correct ARIA attributes on input', async () => {
      await render(
        `
        <div ngpInputOtp>
          <input ngpInputOtpInput data-testid="hidden-input" />
          <div ngpInputOtpSlot></div>
        </div>
      `,
        {
          imports: [NgpInputOtp, NgpInputOtpInput, NgpInputOtpSlot],
        },
      );

      const hiddenInput = screen.getByTestId('hidden-input');
      expect(hiddenInput).toHaveAttribute('autocomplete', 'one-time-code');
    });

    it('should have presentation role on slots', async () => {
      await render(
        `
        <div ngpInputOtp>
          <input ngpInputOtpInput />
          <div ngpInputOtpSlot data-testid="slot-0"></div>
        </div>
      `,
        {
          imports: [NgpInputOtp, NgpInputOtpInput, NgpInputOtpSlot],
        },
      );

      expect(screen.getByTestId('slot-0')).toHaveAttribute('role', 'presentation');
    });
  });

  describe('Interactions Data Attributes', () => {
    it('should add hover data attributes', async () => {
      await render(
        `
        <div ngpInputOtp data-testid="input-otp">
          <input ngpInputOtpInput />
          <div ngpInputOtpSlot></div>
        </div>
      `,
        {
          imports: [NgpInputOtp, NgpInputOtpInput, NgpInputOtpSlot],
        },
      );

      const inputOtp = screen.getByTestId('input-otp');

      fireEvent.mouseEnter(inputOtp);
      expect(inputOtp).toHaveAttribute('data-hover');

      fireEvent.mouseLeave(inputOtp);
      expect(inputOtp).not.toHaveAttribute('data-hover');
    });

    it('should add press data attributes', async () => {
      await render(
        `
        <div ngpInputOtp data-testid="input-otp">
          <input ngpInputOtpInput />
          <div ngpInputOtpSlot></div>
        </div>
      `,
        {
          imports: [NgpInputOtp, NgpInputOtpInput, NgpInputOtpSlot],
        },
      );

      const inputOtp = screen.getByTestId('input-otp');

      fireEvent.pointerDown(inputOtp);
      expect(inputOtp).toHaveAttribute('data-press');

      fireEvent.pointerUp(inputOtp);
      expect(inputOtp).not.toHaveAttribute('data-press');
    });

  });
});