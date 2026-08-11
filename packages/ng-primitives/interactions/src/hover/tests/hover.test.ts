import { TestBed } from '@angular/core/testing';
import { fireEvent, render } from '@testing-library/angular';
import { NgpHover, provideInteractionsConfig } from 'ng-primitives/interactions';
import { describe, expect, it, vi } from 'vitest';

describe('NgpHover', () => {
  function dispatchPointerEvent(
    target: Element | Document,
    type: string,
    pointerType: string,
  ): void {
    const event = new Event(type, {
      bubbles: type !== 'pointerenter' && type !== 'pointerleave',
    });
    (event as any).pointerType = pointerType;
    target.dispatchEvent(event);
  }

  beforeEach(() => {
    dispatchPointerEvent(document, 'pointermove', 'mouse');
  });

  it('should trigger hover start event when pointerstart occurs', async () => {
    const hoverStart = vi.fn();
    const container = await render(
      `<div data-testid="trigger" ngpHover (ngpHoverStart)="hoverStart()"></div>`,
      { imports: [NgpHover], componentProperties: { hoverStart } },
    );

    fireEvent.pointerEnter(container.getByTestId('trigger'));
    expect(hoverStart).toHaveBeenCalled();
  });

  it('should trigger hover end event when pointerend occurs', async () => {
    const hoverEnd = vi.fn();
    const container = await render(
      `<div data-testid="trigger" ngpHover (ngpHoverEnd)="hoverEnd()"></div>`,
      { imports: [NgpHover], componentProperties: { hoverEnd } },
    );

    const trigger = container.getByTestId('trigger');
    fireEvent.pointerEnter(trigger);
    fireEvent.pointerLeave(trigger);
    expect(hoverEnd).toHaveBeenCalled();
  });

  it('should trigger hover start event when mouseenter occurs', async () => {
    const hoverStart = vi.fn();
    const container = await render(
      `<div data-testid="trigger" ngpHover (ngpHoverStart)="hoverStart()"></div>`,
      { imports: [NgpHover], componentProperties: { hoverStart } },
    );

    fireEvent.mouseEnter(container.getByTestId('trigger'));
    expect(hoverStart).toHaveBeenCalled();
  });

  it('should trigger hover end event when mouseleave occurs', async () => {
    const hoverEnd = vi.fn();
    const container = await render(
      `<div data-testid="trigger" ngpHover (ngpHoverEnd)="hoverEnd()"></div>`,
      { imports: [NgpHover], componentProperties: { hoverEnd } },
    );

    const trigger = container.getByTestId('trigger');
    fireEvent.mouseEnter(trigger);
    fireEvent.mouseLeave(trigger);
    expect(hoverEnd).toHaveBeenCalled();
  });

  it('should trigger the hover change event when hovering state changes', async () => {
    const hoverChange = vi.fn();
    const container = await render(
      `<div data-testid="trigger" (ngpHover)="hoverChange($event)"></div>`,
      { imports: [NgpHover], componentProperties: { hoverChange } },
    );

    const trigger = container.getByTestId('trigger');
    fireEvent.mouseEnter(trigger);
    expect(hoverChange).toHaveBeenCalledWith(true);

    fireEvent.mouseLeave(trigger);
    expect(hoverChange).toHaveBeenCalledWith(false);
  });

  it('should not trigger hover events when the directive is disabled', async () => {
    const hoverStart = vi.fn();
    const hoverEnd = vi.fn();
    const container = await render(
      `<div data-testid="trigger" ngpHover (ngpHoverStart)="hoverStart()" (ngpHoverEnd)="hoverEnd()" [ngpHoverDisabled]="true"></div>`,
      { imports: [NgpHover], componentProperties: { hoverStart, hoverEnd } },
    );

    const trigger = container.getByTestId('trigger');
    fireEvent.mouseEnter(trigger);
    expect(hoverStart).not.toHaveBeenCalled();

    fireEvent.mouseLeave(trigger);
    expect(hoverEnd).not.toHaveBeenCalled();
  });

  it('should not trigger hover events when a touchstart event occurs', async () => {
    const hoverStart = vi.fn();
    const hoverEnd = vi.fn();
    const container = await render(
      `<div data-testid="trigger" ngpHover (ngpHoverStart)="hoverStart()" (ngpHoverEnd)="hoverEnd()"></div>`,
      { imports: [NgpHover], componentProperties: { hoverStart, hoverEnd } },
    );

    const trigger = container.getByTestId('trigger');
    fireEvent.touchStart(trigger);
    fireEvent.mouseEnter(trigger);
    expect(hoverStart).not.toHaveBeenCalled();

    fireEvent.mouseLeave(trigger);
    expect(hoverEnd).not.toHaveBeenCalled();
  });

  describe('iOS Safari touch emulation', () => {
    it('should not activate hover when emulated pointerenter(mouse) fires after touch', async () => {
      const hoverStart = vi.fn();
      const container = await render(
        `<div data-testid="trigger" ngpHover (ngpHoverStart)="hoverStart()"></div>`,
        { imports: [NgpHover], componentProperties: { hoverStart } },
      );

      const trigger = container.getByTestId('trigger');
      fireEvent.touchStart(trigger);
      dispatchPointerEvent(trigger, 'pointerenter', 'mouse');
      expect(hoverStart).not.toHaveBeenCalled();
    });

    it('should allow real mouse hover after touch once a real pointermove(mouse) occurs', async () => {
      const hoverStart = vi.fn();
      const container = await render(
        `<div data-testid="trigger" ngpHover (ngpHoverStart)="hoverStart()"></div>`,
        { imports: [NgpHover], componentProperties: { hoverStart } },
      );

      const trigger = container.getByTestId('trigger');
      fireEvent.touchStart(trigger);
      fireEvent.touchEnd(trigger);
      dispatchPointerEvent(trigger, 'pointerenter', 'mouse');
      fireEvent.mouseEnter(trigger);
      expect(hoverStart).not.toHaveBeenCalled();

      dispatchPointerEvent(trigger, 'pointerleave', 'mouse');
      fireEvent.mouseLeave(trigger);

      dispatchPointerEvent(document, 'pointermove', 'mouse');

      dispatchPointerEvent(trigger, 'pointerenter', 'mouse');
      expect(hoverStart).toHaveBeenCalled();
    });

    it('blocks emulated pointerenter(mouse) indefinitely until a real pointermove occurs', async () => {
      vi.useFakeTimers();
      const hoverStart = vi.fn();
      const container = await render(
        `<div data-testid="trigger" ngpHover (ngpHoverStart)="hoverStart()"></div>`,
        { imports: [NgpHover], componentProperties: { hoverStart } },
      );

      fireEvent.touchEnd(document.body);

      vi.advanceTimersByTime(10_000);

      const trigger = container.getByTestId('trigger');
      dispatchPointerEvent(trigger, 'pointerenter', 'mouse');
      expect(hoverStart).not.toHaveBeenCalled();

      vi.useRealTimers();
    });

    it('does not clear the touch flag on pointermove(touch)', async () => {
      const hoverStart = vi.fn();
      const container = await render(
        `<div data-testid="trigger" ngpHover (ngpHoverStart)="hoverStart()"></div>`,
        { imports: [NgpHover], componentProperties: { hoverStart } },
      );

      const trigger = container.getByTestId('trigger');
      fireEvent.touchStart(trigger);
      fireEvent.touchEnd(trigger);

      dispatchPointerEvent(document, 'pointermove', 'touch');

      dispatchPointerEvent(trigger, 'pointerenter', 'mouse');
      expect(hoverStart).not.toHaveBeenCalled();
    });

    it('blocks emulated hover on a freshly mounted directive after a prior touch', async () => {
      const firstHoverStart = vi.fn();
      const first = await render(
        `<div data-testid="trigger" ngpHover (ngpHoverStart)="hoverStart()"></div>`,
        { imports: [NgpHover], componentProperties: { hoverStart: firstHoverStart } },
      );
      fireEvent.touchStart(first.getByTestId('trigger'));
      fireEvent.touchEnd(first.getByTestId('trigger'));
      first.fixture.destroy();

      TestBed.resetTestingModule();

      const secondHoverStart = vi.fn();
      const second = await render(
        `<div data-testid="trigger" ngpHover (ngpHoverStart)="hoverStart()"></div>`,
        { imports: [NgpHover], componentProperties: { hoverStart: secondHoverStart } },
      );
      dispatchPointerEvent(second.getByTestId('trigger'), 'pointerenter', 'mouse');
      expect(secondHoverStart).not.toHaveBeenCalled();
    });

    it('should reset hover state when touch starts while hovered', async () => {
      const hoverEnd = vi.fn();
      const container = await render(
        `<div data-testid="trigger" ngpHover (ngpHoverEnd)="hoverEnd()"></div>`,
        { imports: [NgpHover], componentProperties: { hoverEnd } },
      );

      const trigger = container.getByTestId('trigger');
      dispatchPointerEvent(trigger, 'pointerenter', 'mouse');
      fireEvent.touchStart(trigger);
      expect(hoverEnd).toHaveBeenCalled();
    });

    it('should block both emulated pointerenter and mouseenter after touchstart', async () => {
      const hoverStart = vi.fn();
      const container = await render(
        `<div data-testid="trigger" ngpHover (ngpHoverStart)="hoverStart()"></div>`,
        { imports: [NgpHover], componentProperties: { hoverStart } },
      );

      const trigger = container.getByTestId('trigger');
      fireEvent.touchStart(trigger);
      dispatchPointerEvent(trigger, 'pointerenter', 'mouse');
      expect(hoverStart).not.toHaveBeenCalled();
      fireEvent.mouseEnter(trigger);
      expect(hoverStart).not.toHaveBeenCalled();
    });
  });

  describe('global configuration', () => {
    it('should not trigger hover events when all interactions are globally disabled', async () => {
      const hoverStart = vi.fn();
      const hoverEnd = vi.fn();
      const hoverChange = vi.fn();

      const container = await render(
        `<div data-testid="trigger" ngpHover (ngpHoverStart)="hoverStart()" (ngpHoverEnd)="hoverEnd()" (ngpHover)="hoverChange($event)"></div>`,
        {
          imports: [NgpHover],
          providers: [provideInteractionsConfig({ disabled: true })],
          componentProperties: { hoverStart, hoverEnd, hoverChange },
        },
      );

      const trigger = container.getByTestId('trigger');
      fireEvent.mouseEnter(trigger);
      expect(hoverStart).not.toHaveBeenCalled();
      expect(hoverChange).not.toHaveBeenCalled();

      fireEvent.mouseLeave(trigger);
      expect(hoverEnd).not.toHaveBeenCalled();
    });

    it('should not trigger hover events when hover interactions are specifically disabled', async () => {
      const hoverStart = vi.fn();
      const hoverEnd = vi.fn();
      const hoverChange = vi.fn();

      const container = await render(
        `<div data-testid="trigger" ngpHover (ngpHoverStart)="hoverStart()" (ngpHoverEnd)="hoverEnd()" (ngpHover)="hoverChange($event)"></div>`,
        {
          imports: [NgpHover],
          providers: [provideInteractionsConfig({ hover: false })],
          componentProperties: { hoverStart, hoverEnd, hoverChange },
        },
      );

      const trigger = container.getByTestId('trigger');
      fireEvent.mouseEnter(trigger);
      expect(hoverStart).not.toHaveBeenCalled();
      expect(hoverChange).not.toHaveBeenCalled();

      fireEvent.mouseLeave(trigger);
      expect(hoverEnd).not.toHaveBeenCalled();
    });

    it('should trigger hover events when hover interactions are enabled', async () => {
      const hoverStart = vi.fn();
      const hoverEnd = vi.fn();
      const hoverChange = vi.fn();

      const container = await render(
        `<div data-testid="trigger" ngpHover (ngpHoverStart)="hoverStart()" (ngpHoverEnd)="hoverEnd()" (ngpHover)="hoverChange($event)"></div>`,
        {
          imports: [NgpHover],
          providers: [provideInteractionsConfig({ hover: true })],
          componentProperties: { hoverStart, hoverEnd, hoverChange },
        },
      );

      const trigger = container.getByTestId('trigger');
      fireEvent.mouseEnter(trigger);
      expect(hoverStart).toHaveBeenCalled();
      expect(hoverChange).toHaveBeenCalledWith(true);

      fireEvent.mouseLeave(trigger);
      expect(hoverEnd).toHaveBeenCalled();
      expect(hoverChange).toHaveBeenCalledWith(false);
    });
  });
});
