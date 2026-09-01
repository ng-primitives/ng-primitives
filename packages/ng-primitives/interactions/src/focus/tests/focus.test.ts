import { Component, signal } from '@angular/core';
import { fireEvent, render } from '@testing-library/angular';
import { NgpFocus, provideInteractionsConfig } from 'ng-primitives/interactions';
import { describe, expect, it, vi } from 'vitest';
import { collectUncaughtErrors } from '../../tests/uncaught-errors';

describe('NgpFocus', () => {
  it('should apply the data-focus attribute', async () => {
    const container = await render(`<div data-testid="trigger" ngpFocus></div>`, {
      imports: [NgpFocus],
    });
    const trigger = container.getByTestId('trigger');
    expect(trigger).not.toHaveAttribute('data-focus');

    fireEvent.focus(trigger);
    expect(trigger).toHaveAttribute('data-focus');
  });

  it('should emit the ngpFocus output', async () => {
    const stateChange = vi.fn();

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

    fireEvent.focus(trigger);
    expect(stateChange).toHaveBeenCalledWith(true);

    fireEvent.blur(trigger);
    expect(stateChange).toHaveBeenCalledWith(false);
  });

  it('should not emit the ngpFocus output when disabled', async () => {
    const stateChange = vi.fn();

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

    fireEvent.focus(trigger);
    expect(stateChange).not.toHaveBeenCalled();
  });

  // A binding that disables a focused element blurs it synchronously, mid-render.
  it('should report the blur when a binding disables the focused element', async () => {
    @Component({
      selector: 'ngp-test',
      imports: [NgpFocus],
      template: `
        <input
          [disabled]="disabled()"
          (ngpFocus)="stateChange($event)"
          data-testid="trigger"
          ngpFocus
        />
      `,
    })
    class NgpTest {
      readonly disabled = signal(false);
      readonly stateChange = vi.fn();
    }

    const container = await render(NgpTest);
    const trigger = container.getByTestId('trigger') as HTMLInputElement;
    const { disabled, stateChange } = container.fixture.componentInstance;

    trigger.focus();
    expect(document.activeElement).toBe(trigger);
    expect(stateChange).toHaveBeenLastCalledWith(true);
    expect(trigger).toHaveAttribute('data-focus');

    const uncaught = await collectUncaughtErrors(() => {
      disabled.set(true);
      container.detectChanges();
    });

    expect(uncaught).toBe('');
    expect(trigger.disabled).toBe(true);
    expect(document.activeElement).not.toBe(trigger);
    expect(stateChange).toHaveBeenLastCalledWith(false);
    expect(trigger).not.toHaveAttribute('data-focus');
  });

  describe('global configuration', () => {
    it('should not emit focus events when all interactions are globally disabled', async () => {
      const stateChange = vi.fn();

      const container = await render(
        `<div data-testid="trigger" (ngpFocus)="stateChange($event)"></div>`,
        {
          imports: [NgpFocus],
          providers: [provideInteractionsConfig({ disabled: true })],
          componentProperties: {
            stateChange,
          },
        },
      );
      const trigger = container.getByTestId('trigger');

      fireEvent.focus(trigger);
      expect(stateChange).not.toHaveBeenCalled();
      expect(trigger).not.toHaveAttribute('data-focus');
    });

    it('should not emit focus events when focus interactions are specifically disabled', async () => {
      const stateChange = vi.fn();

      const container = await render(
        `<div data-testid="trigger" (ngpFocus)="stateChange($event)"></div>`,
        {
          imports: [NgpFocus],
          providers: [provideInteractionsConfig({ focus: false })],
          componentProperties: {
            stateChange,
          },
        },
      );
      const trigger = container.getByTestId('trigger');

      fireEvent.focus(trigger);
      expect(stateChange).not.toHaveBeenCalled();
      expect(trigger).not.toHaveAttribute('data-focus');
    });

    it('should emit focus events when focus interactions are enabled', async () => {
      const stateChange = vi.fn();

      const container = await render(
        `<div data-testid="trigger" (ngpFocus)="stateChange($event)"></div>`,
        {
          imports: [NgpFocus],
          providers: [provideInteractionsConfig({ focus: true })],
          componentProperties: {
            stateChange,
          },
        },
      );
      const trigger = container.getByTestId('trigger');

      fireEvent.focus(trigger);
      expect(stateChange).toHaveBeenCalledWith(true);
      expect(trigger).toHaveAttribute('data-focus');
    });
  });
});
