import { FormsModule } from '@angular/forms';
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

  it('should add data attributes for form control status when ngModel is used', async () => {
    const { getByTestId } = await render(
      `<input ngpInput data-testid="input" [(ngModel)]="value" />`,
      {
        imports: [NgpInput, FormsModule],
        componentProperties: { value: '' },
      },
    );

    const input = getByTestId('input');
    expect(input).toHaveAttribute('data-valid');
    expect(input).not.toHaveAttribute('data-invalid');
    expect(input).toHaveAttribute('data-pristine');
    expect(input).not.toHaveAttribute('data-dirty');
    expect(input).not.toHaveAttribute('data-touched');

    fireEvent.focus(input);
    fireEvent.input(input, { target: { value: '' } });
    fireEvent.blur(input);

    expect(input).not.toHaveAttribute('data-pristine');
    expect(input).toHaveAttribute('data-dirty');
  });
});
