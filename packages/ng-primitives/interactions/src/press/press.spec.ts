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

  describe('keyboard interactions', () => {
    it('should emit press events on Enter key', async () => {
      const pressStart = jest.fn();
      const pressEnd = jest.fn();
      const pressChange = jest.fn();

      const container = await render(
        `<div data-testid="trigger" ngpPress (ngpPressStart)="pressStart()" (ngpPressEnd)="pressEnd()" (ngpPress)="pressChange($event)"></div>`,
        {
          imports: [NgpPress],
          componentProperties: { pressStart, pressEnd, pressChange },
        },
      );

      const trigger = container.getByTestId('trigger');
      fireEvent.keyDown(trigger, { key: 'Enter' });
      expect(pressStart).toHaveBeenCalled();
      expect(pressChange).toHaveBeenCalledWith(true);

      fireEvent.keyUp(trigger, { key: 'Enter' });
      expect(pressEnd).toHaveBeenCalled();
      expect(pressChange).toHaveBeenCalledWith(false);
    });

    it('should emit press events on Space key', async () => {
      const pressStart = jest.fn();
      const pressEnd = jest.fn();
      const pressChange = jest.fn();

      const container = await render(
        `<div data-testid="trigger" ngpPress (ngpPressStart)="pressStart()" (ngpPressEnd)="pressEnd()" (ngpPress)="pressChange($event)"></div>`,
        {
          imports: [NgpPress],
          componentProperties: { pressStart, pressEnd, pressChange },
        },
      );

      const trigger = container.getByTestId('trigger');
      fireEvent.keyDown(trigger, { key: ' ' });
      expect(pressStart).toHaveBeenCalled();
      expect(pressChange).toHaveBeenCalledWith(true);

      fireEvent.keyUp(trigger, { key: ' ' });
      expect(pressEnd).toHaveBeenCalled();
      expect(pressChange).toHaveBeenCalledWith(false);
    });

    it('should prevent default on Space keydown to avoid page scroll', async () => {
      const container = await render(`<div data-testid="trigger" ngpPress></div>`, {
        imports: [NgpPress],
      });

      const trigger = container.getByTestId('trigger');
      const event = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true });
      const preventDefaultSpy = jest.spyOn(event, 'preventDefault');
      trigger.dispatchEvent(event);
      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('should ignore repeated key events', async () => {
      const pressStart = jest.fn();

      const container = await render(
        `<div data-testid="trigger" ngpPress (ngpPressStart)="pressStart()"></div>`,
        {
          imports: [NgpPress],
          componentProperties: { pressStart },
        },
      );

      const trigger = container.getByTestId('trigger');
      fireEvent.keyDown(trigger, { key: 'Enter' });
      expect(pressStart).toHaveBeenCalledTimes(1);

      fireEvent.keyDown(trigger, { key: 'Enter', repeat: true });
      expect(pressStart).toHaveBeenCalledTimes(1);
    });

    it('should not emit press events when disabled', async () => {
      const pressStart = jest.fn();
      const pressChange = jest.fn();

      const container = await render(
        `<div data-testid="trigger" ngpPress [ngpPressDisabled]="true" (ngpPressStart)="pressStart()" (ngpPress)="pressChange($event)"></div>`,
        {
          imports: [NgpPress],
          componentProperties: { pressStart, pressChange },
        },
      );

      const trigger = container.getByTestId('trigger');
      fireEvent.keyDown(trigger, { key: 'Enter' });
      expect(pressStart).not.toHaveBeenCalled();
      expect(pressChange).not.toHaveBeenCalled();
    });

    it('should not end press on mismatched keyup', async () => {
      const pressEnd = jest.fn();
      const pressChange = jest.fn();

      const container = await render(
        `<div data-testid="trigger" ngpPress (ngpPressEnd)="pressEnd()" (ngpPress)="pressChange($event)"></div>`,
        {
          imports: [NgpPress],
          componentProperties: { pressEnd, pressChange },
        },
      );

      const trigger = container.getByTestId('trigger');
      fireEvent.keyDown(trigger, { key: 'Enter' });
      pressChange.mockClear();

      fireEvent.keyUp(trigger, { key: ' ' });
      expect(pressEnd).not.toHaveBeenCalled();
      expect(pressChange).not.toHaveBeenCalled();

      fireEvent.keyUp(trigger, { key: 'Enter' });
      expect(pressEnd).toHaveBeenCalled();
    });

    it('should ignore unrelated keys', async () => {
      const pressStart = jest.fn();
      const pressChange = jest.fn();

      const container = await render(
        `<div data-testid="trigger" ngpPress (ngpPressStart)="pressStart()" (ngpPress)="pressChange($event)"></div>`,
        {
          imports: [NgpPress],
          componentProperties: { pressStart, pressChange },
        },
      );

      const trigger = container.getByTestId('trigger');
      fireEvent.keyDown(trigger, { key: 'a' });
      fireEvent.keyDown(trigger, { key: 'Escape' });
      fireEvent.keyDown(trigger, { key: 'Tab' });
      expect(pressStart).not.toHaveBeenCalled();
      expect(pressChange).not.toHaveBeenCalled();
    });
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
