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

  it('should end press on document pointerup when pointerdown started on the element', async () => {
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
    fireEvent.pointerDown(trigger);
    expect(pressChange).toHaveBeenCalledWith(true);

    fireEvent.pointerUp(document);
    expect(pressEnd).toHaveBeenCalled();
    expect(pressChange).toHaveBeenCalledWith(false);
  });

  it('should end press when pointer moves outside the element', async () => {
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
    const outside = document.createElement('div');
    document.body.appendChild(outside);

    try {
      fireEvent.pointerDown(trigger);
      expect(pressChange).toHaveBeenCalledWith(true);

      fireEvent.pointerMove(document, { target: outside });
      expect(pressEnd).toHaveBeenCalled();
      expect(pressChange).toHaveBeenCalledWith(false);
    } finally {
      outside.remove();
    }
  });

  it('should end press on pointer cancel', async () => {
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
    fireEvent.pointerDown(trigger);
    expect(pressChange).toHaveBeenCalledWith(true);

    fireEvent.pointerCancel(document);
    expect(pressEnd).toHaveBeenCalled();
    expect(pressChange).toHaveBeenCalledWith(false);
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

    it('should not prevent default on Space keydown', async () => {
      const container = await render(`<div data-testid="trigger" ngpPress></div>`, {
        imports: [NgpPress],
      });

      const trigger = container.getByTestId('trigger');
      const event = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true });
      const preventDefaultSpy = jest.spyOn(event, 'preventDefault');
      trigger.dispatchEvent(event);
      expect(preventDefaultSpy).not.toHaveBeenCalled();
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

    it('should end press on document keyup when keydown started on the element', async () => {
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
      expect(pressChange).toHaveBeenCalledWith(true);

      fireEvent.keyUp(document, { key: 'Enter' });

      expect(pressEnd).toHaveBeenCalled();
      expect(pressChange).toHaveBeenCalledWith(false);
    });

    it('should end keyboard press on blur', async () => {
      const pressEnd = jest.fn();
      const pressChange = jest.fn();

      const container = await render(
        `<button data-testid="trigger" ngpPress (ngpPressEnd)="pressEnd()" (ngpPress)="pressChange($event)"></button>`,
        {
          imports: [NgpPress],
          componentProperties: { pressEnd, pressChange },
        },
      );

      const trigger = container.getByTestId('trigger');
      fireEvent.keyDown(trigger, { key: 'Enter' });
      expect(pressChange).toHaveBeenCalledWith(true);

      fireEvent.blur(trigger);
      expect(pressEnd).toHaveBeenCalled();
      expect(pressChange).toHaveBeenCalledWith(false);
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

    it('should ignore keyboard press events on text inputs', async () => {
      const pressStart = jest.fn();
      const pressChange = jest.fn();

      const container = await render(
        `<input data-testid="trigger" ngpPress (ngpPressStart)="pressStart()" (ngpPress)="pressChange($event)" />`,
        {
          imports: [NgpPress],
          componentProperties: { pressStart, pressChange },
        },
      );

      const trigger = container.getByTestId('trigger');
      fireEvent.keyDown(trigger, { key: 'Enter' });
      fireEvent.keyDown(trigger, { key: ' ' });

      expect(pressStart).not.toHaveBeenCalled();
      expect(pressChange).not.toHaveBeenCalled();
    });

    it('should ignore keyboard press events on textarea', async () => {
      const pressStart = jest.fn();
      const pressChange = jest.fn();

      const container = await render(
        `<textarea data-testid="trigger" ngpPress (ngpPressStart)="pressStart()" (ngpPress)="pressChange($event)"></textarea>`,
        {
          imports: [NgpPress],
          componentProperties: { pressStart, pressChange },
        },
      );

      const trigger = container.getByTestId('trigger');
      fireEvent.keyDown(trigger, { key: 'Enter' });
      fireEvent.keyDown(trigger, { key: ' ' });

      expect(pressStart).not.toHaveBeenCalled();
      expect(pressChange).not.toHaveBeenCalled();
    });

    it('should ignore keyboard press events on contenteditable elements', async () => {
      const pressStart = jest.fn();
      const pressChange = jest.fn();

      const container = await render(
        `<div data-testid="trigger" ngpPress contenteditable="true" (ngpPressStart)="pressStart()" (ngpPress)="pressChange($event)"></div>`,
        {
          imports: [NgpPress],
          componentProperties: { pressStart, pressChange },
        },
      );

      const trigger = container.getByTestId('trigger');
      Object.defineProperty(trigger, 'isContentEditable', {
        value: true,
        configurable: true,
      });
      fireEvent.keyDown(trigger, { key: 'Enter' });
      fireEvent.keyDown(trigger, { key: ' ' });

      expect(pressStart).not.toHaveBeenCalled();
      expect(pressChange).not.toHaveBeenCalled();
    });

    it('should handle keyboard press events on non-text input types', async () => {
      const pressStart = jest.fn();
      const pressEnd = jest.fn();
      const pressChange = jest.fn();

      const container = await render(
        `<input data-testid="trigger" type="checkbox" ngpPress (ngpPressStart)="pressStart()" (ngpPressEnd)="pressEnd()" (ngpPress)="pressChange($event)" />`,
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
