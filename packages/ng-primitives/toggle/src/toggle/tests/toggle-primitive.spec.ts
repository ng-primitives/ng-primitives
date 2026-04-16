import { fireEvent, render, screen } from '@testing-library/angular';
import { NgpToggle } from '../toggle';

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

    it('should toggle on click with no defaultSelected and no selected binding', async () => {
      const spy = jest.fn();

      await render(
        `<button ngpToggle (ngpToggleSelectedChange)="onChange($event)">Toggle</button>`,
        {
          imports: [NgpToggle],
          componentProperties: { onChange: spy },
        },
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-pressed', 'false');

      fireEvent.click(button);
      expect(spy).toHaveBeenCalledWith(true);
      expect(button).toHaveAttribute('aria-pressed', 'true');

      fireEvent.click(button);
      expect(spy).toHaveBeenCalledWith(false);
      expect(button).toHaveAttribute('aria-pressed', 'false');
    });
  });

  describe('accessibility', () => {
    it('should set aria-disabled when disabled', async () => {
      await render(`<button ngpToggle [ngpToggleDisabled]="true">Toggle</button>`, {
        imports: [NgpToggle],
      });

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });

    it('should not set aria-disabled when enabled', async () => {
      await render(`<button ngpToggle>Toggle</button>`, {
        imports: [NgpToggle],
      });

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-disabled', 'false');
    });

    it('should have tabindex 0 when enabled', async () => {
      await render(`<button ngpToggle>Toggle</button>`, {
        imports: [NgpToggle],
      });

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('tabindex', '0');
    });

    it('should have tabindex -1 when disabled', async () => {
      await render(`<button ngpToggle [ngpToggleDisabled]="true">Toggle</button>`, {
        imports: [NgpToggle],
      });

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('tabindex', '-1');
    });
  });

  describe('controlled mode', () => {
    it('should update the DOM when controlled value changes via two-way binding on click', async () => {
      await render(`<button ngpToggle [(ngpToggleSelected)]="selected">Toggle</button>`, {
        imports: [NgpToggle],
        componentProperties: { selected: false },
      });

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-pressed', 'false');

      fireEvent.click(button);
      expect(button).toHaveAttribute('aria-pressed', 'true');
      expect(button).toHaveAttribute('data-selected', '');

      fireEvent.click(button);
      expect(button).toHaveAttribute('aria-pressed', 'false');
      expect(button).not.toHaveAttribute('data-selected');
    });

    it('should emit selectedChange on click but not update DOM without parent updating binding', async () => {
      const spy = jest.fn();

      await render(
        `<button ngpToggle [ngpToggleSelected]="false" (ngpToggleSelectedChange)="onChange($event)">Toggle</button>`,
        {
          imports: [NgpToggle],
          componentProperties: { onChange: spy },
        },
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      // onChange fires so the parent can respond
      expect(spy).toHaveBeenCalledWith(true);
      // But DOM stays as the controlled value since parent hasn't updated
      expect(button).toHaveAttribute('aria-pressed', 'false');
    });
  });

  describe('non-button element', () => {
    it('should not set type="button" on a non-button element', async () => {
      await render(`<div ngpToggle role="button">Toggle</div>`, {
        imports: [NgpToggle],
      });

      const toggle = screen.getByRole('button');
      expect(toggle).not.toHaveAttribute('type');
    });

    it('should toggle on click for a non-button element', async () => {
      const spy = jest.fn();

      await render(
        `<div ngpToggle role="button" (ngpToggleSelectedChange)="onChange($event)">Toggle</div>`,
        {
          imports: [NgpToggle],
          componentProperties: { onChange: spy },
        },
      );

      const toggle = screen.getByRole('button');
      fireEvent.click(toggle);
      expect(spy).toHaveBeenCalledWith(true);
    });

    it('should toggle on Space keydown for a non-button element', async () => {
      const spy = jest.fn();

      await render(
        `<div ngpToggle role="button" (ngpToggleSelectedChange)="onChange($event)">Toggle</div>`,
        {
          imports: [NgpToggle],
          componentProperties: { onChange: spy },
        },
      );

      const toggle = screen.getByRole('button');
      fireEvent.keyDown(toggle, { key: ' ' });
      expect(spy).toHaveBeenCalledWith(true);
    });

    it('should not toggle on Space keydown when disabled on a non-button element', async () => {
      const spy = jest.fn();

      await render(
        `<div ngpToggle role="button" [ngpToggleDisabled]="true" (ngpToggleSelectedChange)="onChange($event)">Toggle</div>`,
        {
          imports: [NgpToggle],
          componentProperties: { onChange: spy },
        },
      );

      const toggle = screen.getByRole('button');
      fireEvent.keyDown(toggle, { key: ' ' });
      expect(spy).not.toHaveBeenCalled();
    });
  });
});
