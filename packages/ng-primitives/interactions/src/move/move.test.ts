import { Component } from '@angular/core';
import { fireEvent, render, screen } from '@testing-library/angular';
import { describe, expect, it, vi } from 'vitest';
import { NgpMove } from './move';

describe('NgpMove', () => {
  it('should initialise correctly', async () => {
    await render(`<div ngpMove data-testid="target"></div>`, {
      imports: [NgpMove],
    });

    expect(screen.getByTestId('target')).toBeInTheDocument();
  });

  describe('keyboard navigation', () => {
    it('should emit start, move, and end events on ArrowRight', async () => {
      const startSpy = vi.fn();
      const moveSpy = vi.fn();
      const endSpy = vi.fn();

      @Component({
        template: `
          <div
            (ngpMoveStart)="onStart($event)"
            (ngpMove)="onMove($event)"
            (ngpMoveEnd)="onEnd($event)"
            data-testid="target"
            ngpMove
          ></div>
        `,
        imports: [NgpMove],
      })
      class TestComponent {
        onStart = startSpy;
        onMove = moveSpy;
        onEnd = endSpy;
      }

      await render(TestComponent);
      const target = screen.getByTestId('target');

      fireEvent.keyDown(target, { key: 'ArrowRight' });

      expect(startSpy).toHaveBeenCalledWith(expect.objectContaining({ pointerType: 'keyboard' }));
      expect(moveSpy).toHaveBeenCalledWith(
        expect.objectContaining({ deltaX: 1, deltaY: 0, pointerType: 'keyboard' }),
      );
      expect(endSpy).toHaveBeenCalledWith(expect.objectContaining({ pointerType: 'keyboard' }));
    });

    it('should emit deltaX: -1 on ArrowLeft', async () => {
      const moveSpy = vi.fn();

      @Component({
        template: `
          <div (ngpMove)="onMove($event)" data-testid="target" ngpMove></div>
        `,
        imports: [NgpMove],
      })
      class TestComponent {
        onMove = moveSpy;
      }

      await render(TestComponent);
      const target = screen.getByTestId('target');

      fireEvent.keyDown(target, { key: 'ArrowLeft' });
      expect(moveSpy).toHaveBeenCalledWith(expect.objectContaining({ deltaX: -1, deltaY: 0 }));
    });

    it('should emit deltaY: -1 on ArrowUp', async () => {
      const moveSpy = vi.fn();

      @Component({
        template: `
          <div (ngpMove)="onMove($event)" data-testid="target" ngpMove></div>
        `,
        imports: [NgpMove],
      })
      class TestComponent {
        onMove = moveSpy;
      }

      await render(TestComponent);
      const target = screen.getByTestId('target');

      fireEvent.keyDown(target, { key: 'ArrowUp' });
      expect(moveSpy).toHaveBeenCalledWith(expect.objectContaining({ deltaX: 0, deltaY: -1 }));
    });

    it('should emit deltaY: 1 on ArrowDown', async () => {
      const moveSpy = vi.fn();

      @Component({
        template: `
          <div (ngpMove)="onMove($event)" data-testid="target" ngpMove></div>
        `,
        imports: [NgpMove],
      })
      class TestComponent {
        onMove = moveSpy;
      }

      await render(TestComponent);
      const target = screen.getByTestId('target');

      fireEvent.keyDown(target, { key: 'ArrowDown' });
      expect(moveSpy).toHaveBeenCalledWith(expect.objectContaining({ deltaX: 0, deltaY: 1 }));
    });
  });

  describe('disabled state', () => {
    it('should not emit keyboard events when disabled', async () => {
      const moveSpy = vi.fn();

      @Component({
        template: `
          <div
            [ngpMoveDisabled]="true"
            (ngpMove)="onMove($event)"
            data-testid="target"
            ngpMove
          ></div>
        `,
        imports: [NgpMove],
      })
      class TestComponent {
        onMove = moveSpy;
      }

      await render(TestComponent);
      const target = screen.getByTestId('target');

      fireEvent.keyDown(target, { key: 'ArrowRight' });
      expect(moveSpy).not.toHaveBeenCalled();
    });
  });

  describe('pointer interaction', () => {
    it('should ignore right-click', async () => {
      const startSpy = vi.fn();

      @Component({
        template: `
          <div (ngpMoveStart)="onStart($event)" data-testid="target" ngpMove></div>
        `,
        imports: [NgpMove],
      })
      class TestComponent {
        onStart = startSpy;
      }

      await render(TestComponent);
      const target = screen.getByTestId('target');

      fireEvent.pointerDown(target, { button: 2, pointerId: 1 });
      expect(startSpy).not.toHaveBeenCalled();
    });
  });

  describe('data-move attribute', () => {
    it('should not have data-move initially', async () => {
      await render(`<div ngpMove data-testid="target"></div>`, {
        imports: [NgpMove],
      });

      expect(screen.getByTestId('target').getAttribute('data-move')).toBeNull();
    });
  });
});
