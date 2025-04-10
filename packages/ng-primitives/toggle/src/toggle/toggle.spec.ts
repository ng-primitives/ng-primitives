import { fireEvent, render, screen } from '@testing-library/angular';
import { NgpToggle } from './toggle';

describe('NgpToggle', () => {
  it('should initialize with default values', async () => {
    await render(`<button ngpToggle [ngpToggleSelected]="false">Toggle</button>`, {
      imports: [NgpToggle],
    });

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveAttribute('aria-pressed', 'false');
    expect(button).not.toHaveAttribute('data-selected');
    expect(button).not.toHaveAttribute('data-disabled');
  });

  it('should apply the correct aria-pressed attribute', async () => {
    await render(`<button ngpToggle [ngpToggleSelected]="true">Toggle</button>`, {
      imports: [NgpToggle],
    });

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-pressed', 'true');
  });

  it('should apply the correct data-selected attribute', async () => {
    await render(`<button ngpToggle [ngpToggleSelected]="true">Toggle</button>`, {
      imports: [NgpToggle],
    });
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('data-selected', '');
  });

  it('should apply the correct data-disabled attribute', async () => {
    await render(`<button ngpToggle [ngpToggleDisabled]="true">Toggle</button>`, {
      imports: [NgpToggle],
    });

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('data-disabled', '');
  });

  it('should toggle the pressed state on click', async () => {
    const spy = jest.fn();

    await render(
      `<button ngpToggle [(ngpToggleSelected)]="selected" (ngpToggleSelectedChange)="onChange($event)">Toggle</button>`,
      {
        imports: [NgpToggle],
        componentProperties: {
          selected: false,
          onChange: spy,
        },
      },
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(spy).toHaveBeenCalledWith(true);
    fireEvent.click(button);
    expect(spy).toHaveBeenCalledWith(false);
  });

  it('should not toggle the pressed state when disabled', async () => {
    const spy = jest.fn();

    await render(
      `<button ngpToggle [(ngpToggleSelected)]="selected" [ngpToggleDisabled]="true" (ngpToggleSelectedChange)="onChange($event)">Toggle</button>`,
      {
        imports: [NgpToggle],
        componentProperties: {
          selected: false,
          onChange: spy,
        },
      },
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(spy).not.toHaveBeenCalled();
    expect(button).toHaveAttribute('aria-pressed', 'false');
    expect(button).not.toHaveAttribute('data-selected');
    expect(button).toHaveAttribute('data-disabled', '');
  });
});
