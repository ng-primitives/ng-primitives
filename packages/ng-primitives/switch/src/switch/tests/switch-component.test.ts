import { fireEvent, render } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { Switch } from './switch-forms.fixture';

describe('Switch (reusable component) — standalone', () => {
  it('renders with correct initial ARIA attributes', async () => {
    const { getByRole } = await render(`<app-switch></app-switch>`, { imports: [Switch] });
    const el = getByRole('switch');
    expect(el).toHaveAttribute('aria-checked', 'false');
    expect(el).toHaveAttribute('aria-disabled', 'false');
    expect(el).toHaveAttribute('tabindex', '0');
  });

  it('toggles aria-checked on click', async () => {
    const { getByRole } = await render(`<app-switch></app-switch>`, { imports: [Switch] });
    const el = getByRole('switch');
    fireEvent.click(el);
    expect(el).toHaveAttribute('aria-checked', 'true');
    fireEvent.click(el);
    expect(el).toHaveAttribute('aria-checked', 'false');
  });

  it('mirrors the checked state onto the thumb', async () => {
    const { getByRole, container } = await render(`<app-switch></app-switch>`, {
      imports: [Switch],
    });
    const thumb = container.querySelector('[ngpSwitchThumb]')!;
    expect(thumb).not.toHaveAttribute('data-checked');

    fireEvent.click(getByRole('switch'));
    expect(thumb).toHaveAttribute('data-checked', '');
  });

  it('does not toggle when disabled', async () => {
    const { getByRole } = await render(`<app-switch disabled="true"></app-switch>`, {
      imports: [Switch],
    });
    const el = getByRole('switch');
    fireEvent.click(el);
    expect(el).toHaveAttribute('aria-checked', 'false');
  });
});
