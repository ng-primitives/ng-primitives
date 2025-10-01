import { fireEvent, render } from '@testing-library/angular';
import { provideInteractionsConfig } from '../config/interactions-config';
import { NgpPress } from './press';

describe('NgpPress', () => {
  it('should initialise correctly', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const container = await render(`<div ngpPress></div>`, {
      imports: [NgpPress],
    });
  });

  it('should emit press events on mouse interaction', async () => {
    const pressStart = jest.fn();
    const pressEnd = jest.fn();
    const pressChange = jest.fn();

    const container = await render(
      `<div data-testid="trigger" ngpPress (ngpPressStart)="pressStart()" (ngpPressEnd)="pressEnd()" (ngpPress)="pressChange($event)"></div>`,
      {
        imports: [NgpPress],
        componentProperties: {
          pressStart,
          pressEnd,
          pressChange,
        },
      },
    );

    const trigger = container.getByTestId('trigger');
    fireEvent.pointerDown(trigger);
    expect(pressStart).toHaveBeenCalled();
    expect(pressChange).toHaveBeenCalledWith(true);

    fireEvent.pointerUp(trigger);
    expect(pressEnd).toHaveBeenCalled();
    expect(pressChange).toHaveBeenCalledWith(false);
  });

  it('should not emit press events when disabled', async () => {
    const pressStart = jest.fn();
    const pressEnd = jest.fn();
    const pressChange = jest.fn();

    const container = await render(
      `<div data-testid="trigger" ngpPress [ngpPressDisabled]="true" (ngpPressStart)="pressStart()" (ngpPressEnd)="pressEnd()" (ngpPress)="pressChange($event)"></div>`,
      {
        imports: [NgpPress],
        componentProperties: {
          pressStart,
          pressEnd,
          pressChange,
        },
      },
    );

    const trigger = container.getByTestId('trigger');
    fireEvent.pointerDown(trigger);
    expect(pressStart).not.toHaveBeenCalled();
    expect(pressChange).not.toHaveBeenCalled();
  });

  describe('global configuration', () => {
    it('should not emit press events when all interactions are globally disabled', async () => {
      const pressStart = jest.fn();
      const pressEnd = jest.fn();
      const pressChange = jest.fn();

      const container = await render(
        `<div data-testid="trigger" ngpPress (ngpPressStart)="pressStart()" (ngpPressEnd)="pressEnd()" (ngpPress)="pressChange($event)"></div>`,
        {
          imports: [NgpPress],
          providers: [provideInteractionsConfig({ disabled: true })],
          componentProperties: {
            pressStart,
            pressEnd,
            pressChange,
          },
        },
      );

      const trigger = container.getByTestId('trigger');
      fireEvent.pointerDown(trigger);
      expect(pressStart).not.toHaveBeenCalled();
      expect(pressChange).not.toHaveBeenCalled();
    });

    it('should not emit press events when press interactions are specifically disabled', async () => {
      const pressStart = jest.fn();
      const pressEnd = jest.fn();
      const pressChange = jest.fn();

      const container = await render(
        `<div data-testid="trigger" ngpPress (ngpPressStart)="pressStart()" (ngpPressEnd)="pressEnd()" (ngpPress)="pressChange($event)"></div>`,
        {
          imports: [NgpPress],
          providers: [provideInteractionsConfig({ press: false })],
          componentProperties: {
            pressStart,
            pressEnd,
            pressChange,
          },
        },
      );

      const trigger = container.getByTestId('trigger');
      fireEvent.pointerDown(trigger);
      expect(pressStart).not.toHaveBeenCalled();
      expect(pressChange).not.toHaveBeenCalled();
    });

    it('should emit press events when press interactions are enabled', async () => {
      const pressStart = jest.fn();
      const pressEnd = jest.fn();
      const pressChange = jest.fn();

      const container = await render(
        `<div data-testid="trigger" ngpPress (ngpPressStart)="pressStart()" (ngpPressEnd)="pressEnd()" (ngpPress)="pressChange($event)"></div>`,
        {
          imports: [NgpPress],
          providers: [provideInteractionsConfig({ press: true })],
          componentProperties: {
            pressStart,
            pressEnd,
            pressChange,
          },
        },
      );

      const trigger = container.getByTestId('trigger');
      fireEvent.pointerDown(trigger);
      expect(pressStart).toHaveBeenCalled();
      expect(pressChange).toHaveBeenCalledWith(true);

      fireEvent.pointerUp(trigger);
      expect(pressEnd).toHaveBeenCalled();
      expect(pressChange).toHaveBeenCalledWith(false);
    });
  });
});
