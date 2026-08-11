import { fireEvent, render } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { InputOtpFixture } from './input-otp-forms.fixture';

describe('InputOtp (reusable component) — standalone', () => {
  it('renders the configured number of slots', async () => {
    const { getByTestId, queryByTestId } = await render(`<app-input-otp [length]="4" />`, {
      imports: [InputOtpFixture],
    });

    expect(getByTestId('slot-0')).toBeInTheDocument();
    expect(getByTestId('slot-3')).toBeInTheDocument();
    expect(queryByTestId('slot-4')).toBeNull();
  });

  it('forwards the aria-label onto the hidden input', async () => {
    const { getByTestId } = await render(`<app-input-otp ariaLabel="One-time password" />`, {
      imports: [InputOtpFixture],
    });

    expect(getByTestId('hidden-input')).toHaveAttribute('aria-label', 'One-time password');
  });

  it('derives maxlength from the length input', async () => {
    const { getByTestId } = await render(`<app-input-otp [length]="4" />`, {
      imports: [InputOtpFixture],
    });

    expect(getByTestId('hidden-input')).toHaveAttribute('maxlength', '4');
  });

  it('defaults inputmode to numeric', async () => {
    const { getByTestId } = await render(`<app-input-otp [length]="4" />`, {
      imports: [InputOtpFixture],
    });

    expect(getByTestId('hidden-input')).toHaveAttribute('inputmode', 'numeric');
  });

  it('spreads a typed value across the slots', async () => {
    const { getByTestId } = await render(`<app-input-otp [length]="4" />`, {
      imports: [InputOtpFixture],
    });

    const input = getByTestId('hidden-input');
    fireEvent.focus(input);
    fireEvent.input(input, { target: { value: '12' } });

    expect(getByTestId('slot-0')).toHaveTextContent('1');
    expect(getByTestId('slot-1')).toHaveTextContent('2');
    expect(getByTestId('slot-0')).toHaveAttribute('data-filled');
  });

  it('reflects the disabled input onto the hidden input', async () => {
    const { getByTestId } = await render(`<app-input-otp [length]="4" [disabled]="true" />`, {
      imports: [InputOtpFixture],
    });

    expect(getByTestId('hidden-input')).toHaveAttribute('disabled');
  });

  it('does not accept typing while disabled', async () => {
    const { getByTestId } = await render(`<app-input-otp [length]="4" [disabled]="true" />`, {
      imports: [InputOtpFixture],
    });

    const input = getByTestId('hidden-input');
    fireEvent.focus(input);
    fireEvent.input(input, { target: { value: '12' } });

    expect(getByTestId('slot-0')).toHaveTextContent('');
    expect(getByTestId('slot-0')).not.toHaveAttribute('data-filled');
  });

  it('shows a placeholder in empty slots', async () => {
    const { getByTestId } = await render(`<app-input-otp [length]="4" placeholder="•" />`, {
      imports: [InputOtpFixture],
    });

    expect(getByTestId('slot-0')).toHaveTextContent('•');
    expect(getByTestId('slot-0')).toHaveAttribute('data-placeholder');
  });
});
