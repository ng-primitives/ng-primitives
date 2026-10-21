import { render, screen } from '@testing-library/angular';
import { NgpMove } from 'ng-primitives/interactions';
import { describe, expect, it, vi } from 'vitest';

function pointer(type: string, x: number, y: number): PointerEvent {
  return new PointerEvent(type, {
    bubbles: true,
    button: 0,
    pointerId: 1,
    pointerType: 'mouse',
    clientX: x,
    clientY: y,
  });
}

async function renderMove() {
  const start = vi.fn();
  const move = vi.fn();
  const end = vi.fn();

  await render(
    `<div data-testid="target" ngpMove (ngpMoveStart)="start()" (ngpMove)="move($event)" (ngpMoveEnd)="end()"></div>`,
    { imports: [NgpMove], componentProperties: { start, move, end } },
  );

  return { start, move, end, target: screen.getByTestId('target') };
}

describe('NgpMove pointer interaction', () => {
  it('should emit start, the pointer deltas and end while dragging', async () => {
    const { start, move, end, target } = await renderMove();

    target.dispatchEvent(pointer('pointerdown', 10, 10));
    window.dispatchEvent(pointer('pointermove', 15, 7));
    window.dispatchEvent(pointer('pointermove', 20, 7));
    window.dispatchEvent(pointer('pointerup', 20, 7));

    expect(start).toHaveBeenCalledTimes(1);
    expect(move.mock.calls.map(([event]) => [event.deltaX, event.deltaY])).toEqual([
      [5, -3],
      [5, 0],
    ]);
    expect(end).toHaveBeenCalledTimes(1);
  });

  it('should emit start and end without a move for a press that does not move', async () => {
    const { start, move, end, target } = await renderMove();

    target.dispatchEvent(pointer('pointerdown', 10, 10));
    window.dispatchEvent(pointer('pointerup', 10, 10));

    expect(start).toHaveBeenCalledTimes(1);
    expect(move).not.toHaveBeenCalled();
    expect(end).toHaveBeenCalledTimes(1);
  });
});
