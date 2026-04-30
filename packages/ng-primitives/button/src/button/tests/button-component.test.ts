import { fireEvent, render } from '@testing-library/angular';
import { ButtonFixture } from './button-forms.fixture';

describe('Button (reusable component) — standalone', () => {
  it('adds data-hover on pointer enter and removes it on pointer leave', async () => {
    const { getByRole } = await render(`<button app-button>Click me</button>`, {
      imports: [ButtonFixture],
    });
    const button = getByRole('button');
    expect(button).not.toHaveAttribute('data-hover');
    fireEvent.pointerEnter(button);
    expect(button).toHaveAttribute('data-hover');
    fireEvent.pointerLeave(button);
    expect(button).not.toHaveAttribute('data-hover');
  });

  it('adds data-press on pointer down and removes it on pointer up', async () => {
    const { getByRole } = await render(`<button app-button>Click me</button>`, {
      imports: [ButtonFixture],
    });
    const button = getByRole('button');
    expect(button).not.toHaveAttribute('data-press');
    fireEvent.pointerDown(button);
    expect(button).toHaveAttribute('data-press');
    fireEvent.pointerUp(button);
    expect(button).not.toHaveAttribute('data-press');
  });

  it('does not add data-hover when disabled', async () => {
    const { getByRole } = await render(`<button app-button disabled>Click me</button>`, {
      imports: [ButtonFixture],
    });
    const button = getByRole('button');
    fireEvent.pointerEnter(button);
    expect(button).not.toHaveAttribute('data-hover');
  });

  it('does not add data-press when disabled', async () => {
    const { getByRole } = await render(`<button app-button disabled>Click me</button>`, {
      imports: [ButtonFixture],
    });
    const button = getByRole('button');
    fireEvent.pointerDown(button);
    expect(button).not.toHaveAttribute('data-press');
  });
});
