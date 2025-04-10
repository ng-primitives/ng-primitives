import { fireEvent, render } from '@testing-library/angular';
import { NgpInput } from './input';

describe('NgpInput', () => {
  it('should add the data-hover attribute on hover', async () => {
    const { getByTestId } = await render(`<input ngpInput data-testid="input" />`, {
      imports: [NgpInput],
    });

    const input = getByTestId('input');
    fireEvent.mouseEnter(input);
    expect(input).toHaveAttribute('data-hover');
    fireEvent.mouseLeave(input);
    expect(input).not.toHaveAttribute('data-hover');
  });

  it('should add the data-pressed attribute on press', async () => {
    const { getByTestId } = await render(`<input ngpInput data-testid="input" />`, {
      imports: [NgpInput],
    });
    const input = getByTestId('input');
    fireEvent.pointerDown(input);
    expect(input).toHaveAttribute('data-press');
    fireEvent.pointerUp(input);
    expect(input).not.toHaveAttribute('data-press');
  });
});
