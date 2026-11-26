import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { fireEvent, render } from '@testing-library/angular';
import { NgpHover, provideInteractionsConfig } from 'ng-primitives/interactions';
import { describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';

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

  describe('when re-enabled', () => {
    // These use the real browser pointer: neither `pointerenter` nor `mouseenter` fires
    // again for a pointer that is already inside the element, so only `:hover` can tell.
    async function renderDisabled() {
      const disabled = signal(true);
      const hoverStart = vi.fn();
      const hoverEnd = vi.fn();
      const view = await render(
        `
          <span data-testid="elsewhere">Elsewhere</span>
          <div
            data-testid="trigger"
            ngpHover
            [ngpHoverDisabled]="disabled()"
            (ngpHoverStart)="hoverStart()"
            (ngpHoverEnd)="hoverEnd()"
          >
            Trigger
          </div>
        `,
        { imports: [NgpHover], componentProperties: { disabled, hoverStart, hoverEnd } },
      );
      const setDisabled = (value: boolean) => {
        disabled.set(value);
        view.fixture.detectChanges();
      };
      return {
        ...view,
        trigger: view.getByTestId('trigger'),
        elsewhere: view.getByTestId('elsewhere'),
        setDisabled,
        hoverStart,
        hoverEnd,
      };
    }

    it('should hover when the pointer already rests on the element', async () => {
      const { trigger, setDisabled, hoverStart } = await renderDisabled();
      await userEvent.hover(trigger);
      expect(trigger).not.toHaveAttribute('data-hover');

      setDisabled(false);

      expect(trigger).toHaveAttribute('data-hover', '');
      expect(hoverStart).toHaveBeenCalledTimes(1);
    });

    it('should hover again when the pointer rested on the element through a disabled period', async () => {
      const { trigger, setDisabled, hoverStart, hoverEnd } = await renderDisabled();
      setDisabled(false);
      await userEvent.hover(trigger);
      expect(trigger).toHaveAttribute('data-hover', '');

      setDisabled(true);
      expect(trigger).not.toHaveAttribute('data-hover');
      expect(hoverEnd).toHaveBeenCalledTimes(1);

      setDisabled(false);

      expect(trigger).toHaveAttribute('data-hover', '');
      expect(hoverStart).toHaveBeenCalledTimes(2);
    });

    it('should not hover when the pointer left the element while it was disabled', async () => {
      const { trigger, elsewhere, setDisabled, hoverStart } = await renderDisabled();
      await userEvent.hover(trigger);
      await userEvent.hover(elsewhere);

      setDisabled(false);

      expect(trigger).not.toHaveAttribute('data-hover');
      expect(hoverStart).not.toHaveBeenCalled();
    });

    it('should not hover when the pointer is not on the element', async () => {
      const { trigger, setDisabled, hoverStart } = await renderDisabled();

      setDisabled(false);

      expect(trigger).not.toHaveAttribute('data-hover');
      expect(hoverStart).not.toHaveBeenCalled();
    });

    it('should not hover after a touch', async () => {
      const { trigger, setDisabled, hoverStart } = await renderDisabled();
      await userEvent.hover(trigger);
      // Touch leaves `:hover` stuck on the last tapped element.
      dispatchPointerEvent(document, 'pointerup', 'touch');

      setDisabled(false);

      expect(trigger).not.toHaveAttribute('data-hover');
      expect(hoverStart).not.toHaveBeenCalled();
    });

    it('should end the hover when the pointer leaves after re-enabling', async () => {
      const { trigger, elsewhere, setDisabled, hoverEnd } = await renderDisabled();
      await userEvent.hover(trigger);
      setDisabled(false);
      expect(trigger).toHaveAttribute('data-hover', '');

      await userEvent.hover(elsewhere);

      expect(trigger).not.toHaveAttribute('data-hover');
      expect(hoverEnd).toHaveBeenCalledTimes(1);
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
