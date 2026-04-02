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

  describe('defaultSelected (uncontrolled)', () => {
    it('should initialize as unselected when no defaultSelected is provided', async () => {
      await render(`<button ngpToggle>Toggle</button>`, {
        imports: [NgpToggle],
      });

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-pressed', 'false');
      expect(button).not.toHaveAttribute('data-selected');
    });

    it('should initialize as selected when defaultSelected is true', async () => {
      await render(`<button ngpToggle ngpToggleDefaultSelected>Toggle</button>`, {
        imports: [NgpToggle],
      });

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-pressed', 'true');
      expect(button).toHaveAttribute('data-selected', '');
    });

    it('should toggle from defaultSelected state on click', async () => {
      const spy = jest.fn();

      await render(
        `<button ngpToggle ngpToggleDefaultSelected (ngpToggleSelectedChange)="onChange($event)">Toggle</button>`,
        {
          imports: [NgpToggle],
          componentProperties: { onChange: spy },
        },
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-pressed', 'true');

      fireEvent.click(button);
      expect(spy).toHaveBeenCalledWith(false);
      expect(button).toHaveAttribute('aria-pressed', 'false');

      fireEvent.click(button);
      expect(spy).toHaveBeenCalledWith(true);
      expect(button).toHaveAttribute('aria-pressed', 'true');
    });

    it('should not reset internal state when parent re-renders with same defaultSelected', async () => {
      const spy = jest.fn();

      const { rerender } = await render(
        `<button ngpToggle [ngpToggleDefaultSelected]="defaultSelected" (ngpToggleSelectedChange)="onChange($event)">Toggle</button>`,
        {
          imports: [NgpToggle],
          componentProperties: { defaultSelected: true, onChange: spy },
        },
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-pressed', 'true');

      // User toggles off
      fireEvent.click(button);
      expect(button).toHaveAttribute('aria-pressed', 'false');

      // Parent re-renders with same defaultSelected — should NOT reset
      await rerender({
        componentProperties: { defaultSelected: true, onChange: spy },
      });
      expect(button).toHaveAttribute('aria-pressed', 'false');
    });

    it('should not reset internal state when defaultSelected changes after user interaction', async () => {
      const spy = jest.fn();

      const { rerender } = await render(
        `<button ngpToggle [ngpToggleDefaultSelected]="defaultSelected" (ngpToggleSelectedChange)="onChange($event)">Toggle</button>`,
        {
          imports: [NgpToggle],
          componentProperties: { defaultSelected: true, onChange: spy },
        },
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-pressed', 'true');

      // User toggles off
      fireEvent.click(button);
      expect(button).toHaveAttribute('aria-pressed', 'false');

      // Parent changes defaultSelected to false — should NOT reset user's state
      await rerender({
        componentProperties: { defaultSelected: false, onChange: spy },
      });
      expect(button).toHaveAttribute('aria-pressed', 'false');

      // User toggles on
      fireEvent.click(button);
      expect(button).toHaveAttribute('aria-pressed', 'true');

      // Parent changes defaultSelected back to true — should NOT reset
      await rerender({
        componentProperties: { defaultSelected: true, onChange: spy },
      });
      expect(button).toHaveAttribute('aria-pressed', 'true');
    });

    it('should not toggle when disabled in uncontrolled mode', async () => {
      const spy = jest.fn();

      await render(
        `<button ngpToggle ngpToggleDefaultSelected [ngpToggleDisabled]="true" (ngpToggleSelectedChange)="onChange($event)">Toggle</button>`,
        {
          imports: [NgpToggle],
          componentProperties: { onChange: spy },
        },
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-pressed', 'true');

      fireEvent.click(button);
      expect(spy).not.toHaveBeenCalled();
      expect(button).toHaveAttribute('aria-pressed', 'true');
    });

    it('should use controlled selected over defaultSelected when both provided', async () => {
      await render(
        `<button ngpToggle [ngpToggleSelected]="false" ngpToggleDefaultSelected>Toggle</button>`,
        {
          imports: [NgpToggle],
        },
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-pressed', 'false');
    });
  });
});
