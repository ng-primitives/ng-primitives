import { FocusMonitor } from '@angular/cdk/a11y';
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { fireEvent, render } from '@testing-library/angular';
import { NgpFocusVisible, provideInteractionsConfig } from 'ng-primitives/interactions';
import { describe, expect, it, vi } from 'vitest';
import { collectUncaughtErrors } from '../../tests/uncaught-errors';

describe('NgpFocusVisible', () => {
  it('should not set data-focus-visible to true when mouse focused', async () => {
    const focusChange = vi.fn();
    const container = await render(
      `<button data-testid="trigger" (ngpFocusVisible)="focusChange($event)"></button>`,
      { imports: [NgpFocusVisible], componentProperties: { focusChange } },
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
    const focusChange = vi.fn();
    const container = await render(
      `<button data-testid="trigger" (ngpFocusVisible)="focusChange($event)"></button>`,
      { imports: [NgpFocusVisible], componentProperties: { focusChange } },
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
    const focusChange = vi.fn();
    const container = await render(
      `<button data-testid="trigger" (ngpFocusVisible)="focusChange($event)"></button>`,
      { imports: [NgpFocusVisible], componentProperties: { focusChange } },
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
    const focusChange = vi.fn();
    const container = await render(
      `<input data-testid="trigger" (ngpFocusVisible)="focusChange($event)" />`,
      { imports: [NgpFocusVisible], componentProperties: { focusChange } },
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
    const focusChange = vi.fn();
    const container = await render(
      `<input data-testid="trigger" (ngpFocusVisible)="focusChange($event)" />`,
      { imports: [NgpFocusVisible], componentProperties: { focusChange } },
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
    const focusChange = vi.fn();
    const container = await render(
      `<button data-testid="trigger" ngpFocusVisible [ngpFocusVisibleDisabled]="true" (ngpFocusVisibleChange)="focusChange($event)"></button>`,
      { imports: [NgpFocusVisible], componentProperties: { focusChange } },
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
    const focusChange = vi.fn();
    const container = await render(
      `<button data-testid="trigger" (ngpFocusVisible)="focusChange($event)"></button>`,
      { imports: [NgpFocusVisible], componentProperties: { focusChange } },
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

  it('should always show focus on a textarea element when using the mouse', async () => {
    const focusChange = vi.fn();
    const container = await render(
      `<textarea data-testid="trigger" (ngpFocusVisible)="focusChange($event)"></textarea>`,
      { imports: [NgpFocusVisible], componentProperties: { focusChange } },
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
    const focusChange = vi.fn();
    const container = await render(
      `<button data-testid="trigger" contenteditable="true" (ngpFocusVisible)="focusChange($event)"></button>`,
      { imports: [NgpFocusVisible], componentProperties: { focusChange } },
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
    const focusChange = vi.fn();
    const container = await render(
      `<input data-testid="trigger" type="submit" (ngpFocusVisible)="focusChange($event)" />`,
      { imports: [NgpFocusVisible], componentProperties: { focusChange } },
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
    const focusChange = vi.fn();
    const container = await render(
      `<button data-testid="trigger" (ngpFocusVisible)="focusChange($event)"></button>`,
      { imports: [NgpFocusVisible], componentProperties: { focusChange } },
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

  it('should update data-focus-visible to false when disabled becomes true', async () => {
    const focusChange = vi.fn();
    const container = await render(
      `<button data-testid="trigger" ngpFocusVisible [ngpFocusVisibleDisabled]="disabled" (ngpFocusVisibleChange)="focusChange($event)"></button>`,
      { imports: [NgpFocusVisible], componentProperties: { focusChange, disabled: false } },
    );

    const focusMonitor = TestBed.inject(FocusMonitor);
    const trigger = container.getByTestId('trigger');
    expect(trigger).not.toHaveAttribute('data-focus-visible');

    focusMonitor.focusVia(trigger, 'keyboard');
    expect(trigger).toHaveAttribute('data-focus-visible');

    await container.rerender({ componentProperties: { focusChange, disabled: true } });
    expect(trigger).not.toHaveAttribute('data-focus-visible');
  });

  it('should report the blur when a binding disables the focused element', async () => {
    // A binding that disables a focused element blurs it synchronously, mid-render.
    @Component({
      selector: 'ngp-test',
      imports: [NgpFocusVisible],
      template: `
        <input
          [disabled]="disabled()"
          (ngpFocusVisible)="focusChange($event)"
          data-testid="trigger"
          ngpFocusVisible
        />
      `,
    })
    class NgpTest {
      readonly disabled = signal(false);
      readonly focusChange = vi.fn();
    }

    const container = await render(NgpTest);
    const trigger = container.getByTestId('trigger') as HTMLInputElement;
    const { disabled, focusChange } = container.fixture.componentInstance;

    TestBed.inject(FocusMonitor).focusVia(trigger, 'keyboard');
    container.detectChanges();
    expect(focusChange).toHaveBeenLastCalledWith(true);
    expect(trigger).toHaveAttribute('data-focus-visible');

    const uncaught = await collectUncaughtErrors(() => {
      disabled.set(true);
      container.detectChanges();
    });

    expect(uncaught).toBe('');
    expect(trigger.disabled).toBe(true);
    expect(document.activeElement).not.toBe(trigger);
    expect(focusChange).toHaveBeenLastCalledWith(false);
    expect(trigger).not.toHaveAttribute('data-focus-visible');
  });

  describe('global configuration', () => {
    it('should not emit focus visible events when all interactions are globally disabled', async () => {
      const focusChange = vi.fn();
      const container = await render(
        `<button data-testid="trigger" (ngpFocusVisible)="focusChange($event)"></button>`,
        {
          imports: [NgpFocusVisible],
          providers: [provideInteractionsConfig({ disabled: true })],
          componentProperties: { focusChange },
        },
      );

      const focusMonitor = TestBed.inject(FocusMonitor);
      focusMonitor.focusVia(container.getByTestId('trigger'), 'keyboard');
      container.detectChanges();

      expect(container.getByTestId('trigger')).not.toHaveAttribute('data-focus-visible');
      expect(focusChange).not.toHaveBeenCalled();
    });

    it('should not emit focus visible events when focus visible interactions are specifically disabled', async () => {
      const focusChange = vi.fn();
      const container = await render(
        `<button data-testid="trigger" (ngpFocusVisible)="focusChange($event)"></button>`,
        {
          imports: [NgpFocusVisible],
          providers: [provideInteractionsConfig({ focusVisible: false })],
          componentProperties: { focusChange },
        },
      );

      const focusMonitor = TestBed.inject(FocusMonitor);
      focusMonitor.focusVia(container.getByTestId('trigger'), 'keyboard');
      container.detectChanges();

      expect(container.getByTestId('trigger')).not.toHaveAttribute('data-focus-visible');
      expect(focusChange).not.toHaveBeenCalled();
    });

    it('should emit focus visible events when focus visible interactions are enabled', async () => {
      const focusChange = vi.fn();
      const container = await render(
        `<button data-testid="trigger" (ngpFocusVisible)="focusChange($event)"></button>`,
        {
          imports: [NgpFocusVisible],
          providers: [provideInteractionsConfig({ focusVisible: true })],
          componentProperties: { focusChange },
        },
      );

      const focusMonitor = TestBed.inject(FocusMonitor);
      focusMonitor.focusVia(container.getByTestId('trigger'), 'keyboard');
      container.detectChanges();

      expect(container.getByTestId('trigger')).toHaveAttribute('data-focus-visible');
      expect(focusChange).toHaveBeenCalledWith(true);
    });
  });
});
