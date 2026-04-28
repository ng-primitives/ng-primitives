import { fireEvent, render } from '@testing-library/angular';
import { CheckboxFixture } from './checkbox-forms.fixture';

describe('Checkbox (reusable component) — standalone', () => {
  it('renders with correct initial ARIA attributes', async () => {
    const { getByRole } = await render(`<app-checkbox></app-checkbox>`, {
      imports: [CheckboxFixture],
    });
    const checkbox = getByRole('checkbox');
    expect(checkbox).toHaveAttribute('aria-checked', 'false');
    expect(checkbox).toHaveAttribute('aria-disabled', 'false');
  });

  it('is focusable via Tab', async () => {
    const { getByRole } = await render(`<app-checkbox></app-checkbox>`, {
      imports: [CheckboxFixture],
    });
    expect(getByRole('checkbox')).toHaveAttribute('tabindex', '0');
  });

  it('toggles aria-checked on click', async () => {
    const { getByRole } = await render(`<app-checkbox></app-checkbox>`, {
      imports: [CheckboxFixture],
    });
    const checkbox = getByRole('checkbox');
    fireEvent.click(checkbox);
    expect(checkbox).toHaveAttribute('aria-checked', 'true');
    fireEvent.click(checkbox);
    expect(checkbox).toHaveAttribute('aria-checked', 'false');
  });

  it('toggles aria-checked on Space keypress', async () => {
    const { getByRole } = await render(`<app-checkbox></app-checkbox>`, {
      imports: [CheckboxFixture],
    });
    const checkbox = getByRole('checkbox');
    fireEvent.keyDown(checkbox, { key: ' ' });
    expect(checkbox).toHaveAttribute('aria-checked', 'true');
    fireEvent.keyDown(checkbox, { key: ' ' });
    expect(checkbox).toHaveAttribute('aria-checked', 'false');
  });

  it('does not toggle when disabled', async () => {
    const { getByRole } = await render(`<app-checkbox disabled="true"></app-checkbox>`, {
      imports: [CheckboxFixture],
    });
    const checkbox = getByRole('checkbox');
    fireEvent.click(checkbox);
    expect(checkbox).toHaveAttribute('aria-checked', 'false');
  });
});
