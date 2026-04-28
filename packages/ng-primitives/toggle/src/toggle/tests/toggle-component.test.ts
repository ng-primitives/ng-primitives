import { fireEvent, render } from '@testing-library/angular';
import { Toggle } from './toggle-forms.fixture';

describe('Toggle (reusable component) — standalone', () => {
  it('renders with initial unselected state', async () => {
    const { getByRole } = await render(`<button app-toggle>Toggle</button>`, {
      imports: [Toggle],
    });
    const button = getByRole('button');
    expect(button).toHaveAttribute('aria-pressed', 'false');
    expect(button).not.toHaveAttribute('data-selected');
  });

  it('toggles aria-pressed on click', async () => {
    const { getByRole } = await render(`<button app-toggle>Toggle</button>`, {
      imports: [Toggle],
    });
    const button = getByRole('button');
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-pressed', 'true');
    expect(button).toHaveAttribute('data-selected', '');
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-pressed', 'false');
    expect(button).not.toHaveAttribute('data-selected');
  });

  it('does not toggle when disabled', async () => {
    const { getByRole } = await render(`<button app-toggle disabled>Toggle</button>`, {
      imports: [Toggle],
    });
    const button = getByRole('button');
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-pressed', 'false');
  });
});
