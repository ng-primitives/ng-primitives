import { FocusMonitor } from '@angular/cdk/a11y';
import { TestBed } from '@angular/core/testing';
import { fireEvent, render } from '@testing-library/angular';
import { provideInteractionsConfig } from '../config/interactions-config';
import { NgpFocusVisible } from './focus-visible';

describe('NgpFocusVisible', () => {
  let focusChange: jest.Mock;

  beforeEach(() => {
    focusChange = jest.fn();
  });

  it('should not set data-focus-visible to true when mouse focused', async () => {
    const container = await render(
      `<button data-testid="trigger" (ngpFocusVisible)="focusChange($event)"></button>`,
      {
        imports: [NgpFocusVisible],
        componentProperties: {
          focusChange,
        },
      },
    );

    const focusMonitor = TestBed.inject(FocusMonitor);

    const trigger = container.getByTestId('trigger');
    expect(trigger).not.toHaveAttribute('data-focus-visible');

    focusMonitor.focusVia(trigger, 'mouse');
    container.detectChanges();

    expect(trigger).not.toHaveAttribute('data-focus-visible');
    expect(focusChange).not.toHaveBeenCalled();
  });

  it('should set data-focus-visible to true when keyboard focused', async () => {
    const container = await render(
      `<button data-testid="trigger" (ngpFocusVisible)="focusChange($event)"></button>`,
      {
        imports: [NgpFocusVisible],
        componentProperties: {
          focusChange,
        },
      },
    );

    const focusMonitor = TestBed.inject(FocusMonitor);

    const trigger = container.getByTestId('trigger');
    expect(trigger).not.toHaveAttribute('data-focus-visible');

    focusMonitor.focusVia(trigger, 'keyboard');
    container.detectChanges();

    expect(trigger).toHaveAttribute('data-focus-visible', 'keyboard');
    expect(focusChange).toHaveBeenCalledWith(true);
  });

  it('should not set data-focus-visible to true when focused programmatically', async () => {
    const container = await render(
      `<button data-testid="trigger" (ngpFocusVisible)="focusChange($event)"></button>`,
      {
        imports: [NgpFocusVisible],
        componentProperties: {
          focusChange,
        },
      },
    );

    const focusMonitor = TestBed.inject(FocusMonitor);

    const trigger = container.getByTestId('trigger');
    expect(trigger).not.toHaveAttribute('data-focus-visible');

    focusMonitor.focusVia(trigger, 'program');
    container.detectChanges();

    expect(trigger).not.toHaveAttribute('data-focus-visible');
    expect(focusChange).not.toHaveBeenCalled();
  });

  it('should always show focus on an input element when using the mouse', async () => {
    const container = await render(
      `<input data-testid="trigger" (ngpFocusVisible)="focusChange($event)" />`,
      {
        imports: [NgpFocusVisible],
        componentProperties: {
          focusChange,
        },
      },
    );

    const focusMonitor = TestBed.inject(FocusMonitor);

    const trigger = container.getByTestId('trigger');
    expect(trigger).not.toHaveAttribute('data-focus-visible');

    focusMonitor.focusVia(trigger, 'mouse');
    container.detectChanges();

    expect(trigger).toHaveAttribute('data-focus-visible');
    expect(focusChange).toHaveBeenCalledWith(true);
  });

  it('should always show focus on an input element when focused programmatically', async () => {
    const container = await render(
      `<input data-testid="trigger" (ngpFocusVisible)="focusChange($event)" />`,
      {
        imports: [NgpFocusVisible],
        componentProperties: {
          focusChange,
        },
      },
    );

    const focusMonitor = TestBed.inject(FocusMonitor);

    const trigger = container.getByTestId('trigger');
    expect(trigger).not.toHaveAttribute('data-focus-visible');

    focusMonitor.focusVia(trigger, 'program');
    container.detectChanges();

    expect(trigger).toHaveAttribute('data-focus-visible', 'program');
    expect(focusChange).toHaveBeenCalledWith(true);
  });

  it('should not set data-focus-visible to true when disabled', async () => {
    const container = await render(
      `<button data-testid="trigger" ngpFocusVisible [ngpFocusVisibleDisabled]="true" (ngpFocusVisibleChange)="focusChange($event)"></button>`,
      {
        imports: [NgpFocusVisible],
        componentProperties: {
          focusChange,
        },
      },
    );

    const focusMonitor = TestBed.inject(FocusMonitor);

    const trigger = container.getByTestId('trigger');
    expect(trigger).not.toHaveAttribute('data-focus-visible');

    focusMonitor.focusVia(trigger, 'keyboard');
    container.detectChanges();

    expect(trigger).not.toHaveAttribute('data-focus-visible');
    expect(focusChange).not.toHaveBeenCalled();
  });

  it('should not set data-focus-visible to true when already focused', async () => {
    const container = await render(
      `<button data-testid="trigger" (ngpFocusVisible)="focusChange($event)"></button>`,
      {
        imports: [NgpFocusVisible],
        componentProperties: {
          focusChange,
        },
      },
    );

    const focusMonitor = TestBed.inject(FocusMonitor);

    const trigger = container.getByTestId('trigger');
    expect(trigger).not.toHaveAttribute('data-focus-visible');

    focusMonitor.focusVia(trigger, 'keyboard');
    container.detectChanges();

    expect(trigger).toHaveAttribute('data-focus-visible');
    expect(focusChange).toHaveBeenCalledWith(true);

    focusMonitor.focusVia(trigger, 'keyboard');
    container.detectChanges();

    expect(trigger).toHaveAttribute('data-focus-visible');
    expect(focusChange).toHaveBeenCalledTimes(1);
  });

  it('should always show focus on an textarea element when using the mouse', async () => {
    const container = await render(
      `<textarea data-testid="trigger" (ngpFocusVisible)="focusChange($event)"></textarea>`,
      {
        imports: [NgpFocusVisible],
        componentProperties: {
          focusChange,
        },
      },
    );

    const focusMonitor = TestBed.inject(FocusMonitor);

    const trigger = container.getByTestId('trigger');
    expect(trigger).not.toHaveAttribute('data-focus-visible');

    focusMonitor.focusVia(trigger, 'mouse');
    container.detectChanges();

    expect(trigger).toHaveAttribute('data-focus-visible', 'mouse');
    expect(focusChange).toHaveBeenCalledWith(true);
  });

  it('should always show focus on an element with content editable when using the mouse', async () => {
    const container = await render(
      `<button data-testid="trigger" contenteditable="true" (ngpFocusVisible)="focusChange($event)"></button>`,
      {
        imports: [NgpFocusVisible],
        componentProperties: {
          focusChange,
        },
      },
    );

    const focusMonitor = TestBed.inject(FocusMonitor);

    const trigger = container.getByTestId('trigger');
    expect(trigger).not.toHaveAttribute('data-focus-visible');

    focusMonitor.focusVia(trigger, 'mouse');
    container.detectChanges();

    expect(trigger).toHaveAttribute('data-focus-visible');
    expect(focusChange).toHaveBeenCalledWith(true);
  });

  it('should not always show focus on an input element when the type is submit', async () => {
    const container = await render(
      `<input data-testid="trigger" type="submit" (ngpFocusVisible)="focusChange($event)" />`,
      {
        imports: [NgpFocusVisible],
        componentProperties: {
          focusChange,
        },
      },
    );

    const focusMonitor = TestBed.inject(FocusMonitor);

    const trigger = container.getByTestId('trigger');
    expect(trigger).not.toHaveAttribute('data-focus-visible');

    focusMonitor.focusVia(trigger, 'mouse');
    container.detectChanges();

    expect(trigger).not.toHaveAttribute('data-focus-visible');
    expect(focusChange).not.toHaveBeenCalled();
  });

  it('should update data-focus-visible to false when blurred', async () => {
    const container = await render(
      `<button data-testid="trigger" (ngpFocusVisible)="focusChange($event)"></button>`,
      {
        imports: [NgpFocusVisible],
        componentProperties: {
          focusChange,
        },
      },
    );

    const focusMonitor = TestBed.inject(FocusMonitor);

    const trigger = container.getByTestId('trigger');
    expect(trigger).not.toHaveAttribute('data-focus-visible');

    focusMonitor.focusVia(trigger, 'keyboard');

    expect(trigger).toHaveAttribute('data-focus-visible');
    expect(focusChange).toHaveBeenCalledWith(true);

    fireEvent.blur(trigger);
    container.detectChanges();

    expect(trigger).not.toHaveAttribute('data-focus-visible');
    expect(focusChange).toHaveBeenCalledWith(false);
  });

  it('should update data-focus-visible to false when disable becomes true', async () => {
    const container = await render(
      `<button data-testid="trigger" ngpFocusVisible [ngpFocusVisibleDisabled]="disabled" (ngpFocusVisibleChange)="focusChange($event)"></button>`,
      {
        imports: [NgpFocusVisible],
        componentProperties: {
          focusChange,
          disabled: false,
        },
      },
    );

    const focusMonitor = TestBed.inject(FocusMonitor);

    const trigger = container.getByTestId('trigger');
    expect(trigger).not.toHaveAttribute('data-focus-visible');

    focusMonitor.focusVia(trigger, 'keyboard');

    expect(trigger).toHaveAttribute('data-focus-visible');

    container.rerender({
      componentProperties: {
        focusChange,
        disabled: true,
      },
    });

    expect(trigger).not.toHaveAttribute('data-focus-visible');
  });

  describe('global configuration', () => {
    it('should not emit focus visible events when all interactions are globally disabled', async () => {
      const container = await render(
        `<button data-testid="trigger" (ngpFocusVisible)="focusChange($event)"></button>`,
        {
          imports: [NgpFocusVisible],
          providers: [provideInteractionsConfig({ disabled: true })],
          componentProperties: {
            focusChange,
          },
        },
      );

      const focusMonitor = TestBed.inject(FocusMonitor);
      const trigger = container.getByTestId('trigger');

      focusMonitor.focusVia(trigger, 'keyboard');
      container.detectChanges();

      expect(trigger).not.toHaveAttribute('data-focus-visible');
      expect(focusChange).not.toHaveBeenCalled();
    });

    it('should not emit focus visible events when focus visible interactions are specifically disabled', async () => {
      const container = await render(
        `<button data-testid="trigger" (ngpFocusVisible)="focusChange($event)"></button>`,
        {
          imports: [NgpFocusVisible],
          providers: [provideInteractionsConfig({ focusVisible: false })],
          componentProperties: {
            focusChange,
          },
        },
      );

      const focusMonitor = TestBed.inject(FocusMonitor);
      const trigger = container.getByTestId('trigger');

      focusMonitor.focusVia(trigger, 'keyboard');
      container.detectChanges();

      expect(trigger).not.toHaveAttribute('data-focus-visible');
      expect(focusChange).not.toHaveBeenCalled();
    });

    it('should emit focus visible events when focus visible interactions are enabled', async () => {
      const container = await render(
        `<button data-testid="trigger" (ngpFocusVisible)="focusChange($event)"></button>`,
        {
          imports: [NgpFocusVisible],
          providers: [provideInteractionsConfig({ focusVisible: true })],
          componentProperties: {
            focusChange,
          },
        },
      );

      const focusMonitor = TestBed.inject(FocusMonitor);
      const trigger = container.getByTestId('trigger');

      focusMonitor.focusVia(trigger, 'keyboard');
      container.detectChanges();

      expect(trigger).toHaveAttribute('data-focus-visible');
      expect(focusChange).toHaveBeenCalledWith(true);
    });
  });
});
