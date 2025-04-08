import { fireEvent, render, screen } from '@testing-library/angular';
import { NgpToggle } from './toggle';

describe('NgpToggle', () => {
  it('should initialize with default values', async () => {
    await render(
      `<button ngpToggle [ngpToggleSelected]="false" [ngpToggleDisabled]="false">Toggle</button>`,
      {
        imports: [NgpToggle],
      },
    );

    const button = screen.getByRole('button');
    expect(button.getAttribute('aria-pressed')).toBe('false');
    expect(button.getAttribute('data-selected')).toBe('false');
    expect(button.getAttribute('data-disabled')).toBe('false');
  });

  it('should apply the correct aria-pressed attribute', async () => {
    await render(
      `<button ngpToggle [ngpToggleSelected]="selected" (ngpToggleSelectedChange)="selected = $event">Toggle</button>`,
      {
        imports: [NgpToggle],
        componentProperties: {
          selected: false,
        },
      },
    );

    const button = screen.getByRole('button');
    expect(button.getAttribute('aria-pressed')).toBe('false');
  });

  it('should apply the correct data-selected attribute', async () => {
    await render(
      `<button ngpToggle [ngpToggleSelected]="selected" (ngpToggleSelectedChange)="selected = $event">Toggle</button>`,
      {
        imports: [NgpToggle],
        componentProperties: {
          selected: false,
        },
      },
    );

    const button = screen.getByRole('button');
    expect(button.getAttribute('data-selected')).toBe('false');
  });

  it('should apply the correct data-disabled attribute', async () => {
    await render(
      `<button ngpToggle [ngpToggleDisabled]="disabled" [ngpToggleSelected]="false">Toggle</button>`,
      {
        imports: [NgpToggle],
        componentProperties: {
          disabled: false,
        },
      },
    );

    const button = screen.getByRole('button');
    expect(button.getAttribute('data-disabled')).toBe('false');
  });

  it('should toggle the pressed state on click', async () => {
    let selected = false;

    await render(
      `<button ngpToggle [ngpToggleSelected]="selected" (ngpToggleSelectedChange)="selected = $event">Toggle</button>`,
      {
        imports: [NgpToggle],
        componentProperties: {
          get selected() {
            return selected;
          },
          set selected(val: boolean) {
            selected = val;
          },
        },
      },
    );

    const button = screen.getByRole('button');
    expect(selected).toBe(false);

    fireEvent.click(button);
    expect(selected).toBe(true);

    fireEvent.click(button);
    expect(selected).toBe(false);
  });

  it('should not toggle the pressed state when disabled', async () => {
    let selected = false;

    await render(
      `<button ngpToggle [ngpToggleSelected]="selected" [ngpToggleDisabled]="true" (ngpToggleSelectedChange)="selected = $event">Toggle</button>`,
      {
        imports: [NgpToggle],
        componentProperties: {
          get selected() {
            return selected;
          },
          set selected(val: boolean) {
            selected = val;
          },
        },
      },
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(selected).toBe(false);
  });

  it('should emit the pressed state change event on toggle', async () => {
    const spy = jest.fn();

    await render(
      `<button ngpToggle [ngpToggleSelected]="false" (ngpToggleSelectedChange)="onToggle($event)">Toggle</button>`,
      {
        imports: [NgpToggle],
        componentProperties: {
          onToggle: spy,
        },
      },
    );

    const button = screen.getByRole('button');

    fireEvent.click(button);
    expect(spy).toHaveBeenCalledWith(true);

    fireEvent.click(button);
    expect(spy).toHaveBeenCalledWith(false);
  });
});
