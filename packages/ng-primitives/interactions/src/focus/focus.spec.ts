import { fireEvent, render } from '@testing-library/angular';
import { NgpFocus } from './focus';

describe('NgpFocus', () => {
  it('should apply the data-focus attribute', async () => {
    const container = await render(`<div data-testid="trigger" ngpFocus></div>`, {
      imports: [NgpFocus],
    });
    const trigger = container.getByTestId('trigger');
    expect(trigger).not.toHaveAttribute('data-focus');

    // we must spoof the activeElement to test focus
    Object.defineProperty(document, 'activeElement', { value: trigger, writable: true });

    fireEvent.focus(trigger);
    expect(trigger).toHaveAttribute('data-focus');
  });

  it('should emit the ngpFocus output', async () => {
    const stateChange = jest.fn();

    const container = await render(
      `<div data-testid="trigger" (ngpFocus)="stateChange($event)"></div>`,
      {
        imports: [NgpFocus],
        componentProperties: {
          stateChange,
        },
      },
    );
    const trigger = container.getByTestId('trigger');

    // we must spoof the activeElement to test focus
    Object.defineProperty(document, 'activeElement', { value: trigger, writable: true });

    fireEvent.focus(trigger);
    expect(stateChange).toHaveBeenCalledWith(true);

    fireEvent.blur(trigger);
    expect(stateChange).toHaveBeenCalledWith(false);
  });

  it('should not emit the ngpFocus output when disabled', async () => {
    const stateChange = jest.fn();

    const container = await render(
      `<div data-testid="trigger" [ngpFocusDisabled]="true" (ngpFocus)="stateChange($event)"></div>`,
      {
        imports: [NgpFocus],
        componentProperties: {
          stateChange,
        },
      },
    );
    const trigger = container.getByTestId('trigger');

    // we must spoof the activeElement to test focus
    Object.defineProperty(document, 'activeElement', { value: trigger, writable: true });

    fireEvent.focus(trigger);
    expect(stateChange).not.toHaveBeenCalled();
  });
});
