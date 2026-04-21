import { TestBed } from '@angular/core/testing';
import { fireEvent, render } from '@testing-library/angular';
import { provideInteractionsConfig } from '../config/interactions-config';
import { NgpHover } from './hover';

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

  // The hover primitive tracks a module-level `hadRecentTouch` flag so that
  // iOS emulated mouse events stay blocked across navigations. A real
  // pointermove(mouse) clears it, so we dispatch one before each test to
  // avoid leaked state between tests.
  beforeEach(() => {
    dispatchPointerEvent(document, 'pointermove', 'mouse');
  });

  it('should trigger hover start event when pointerstart occurs', async () => {
    const hoverStart = jest.fn();
    const container = await render(
      `<div data-testid="trigger" ngpHover (ngpHoverStart)="hoverStart()"></div>`,
      {
        imports: [NgpHover],
        componentProperties: {
          hoverStart,
        },
      },
    );

    const trigger = container.getByTestId('trigger');
    fireEvent.pointerEnter(trigger);
    expect(hoverStart).toHaveBeenCalled();
  });

  it('should trigger hover end event when pointerend occurs', async () => {
    const hoverEnd = jest.fn();
    const container = await render(
      `<div data-testid="trigger" ngpHover (ngpHoverEnd)="hoverEnd()"></div>`,
      {
        imports: [NgpHover],
        componentProperties: {
          hoverEnd,
        },
      },
    );

    const trigger = container.getByTestId('trigger');
    fireEvent.pointerEnter(trigger);
    fireEvent.pointerLeave(trigger);
    expect(hoverEnd).toHaveBeenCalled();
  });

  it('should trigger hover start event when mouseenter occurs', async () => {
    const hoverStart = jest.fn();
    const container = await render(
      `<div data-testid="trigger" ngpHover (ngpHoverStart)="hoverStart()"></div>`,
      {
        imports: [NgpHover],
        componentProperties: {
          hoverStart,
        },
      },
    );

    const trigger = container.getByTestId('trigger');
    fireEvent.mouseEnter(trigger);
    expect(hoverStart).toHaveBeenCalled();
  });

  it('should trigger hover end event when mouseleave occurs', async () => {
    const hoverEnd = jest.fn();
    const container = await render(
      `<div data-testid="trigger" ngpHover (ngpHoverEnd)="hoverEnd()"></div>`,
      {
        imports: [NgpHover],
        componentProperties: {
          hoverEnd,
        },
      },
    );

    const trigger = container.getByTestId('trigger');
    fireEvent.mouseEnter(trigger);
    fireEvent.mouseLeave(trigger);
    expect(hoverEnd).toHaveBeenCalled();
  });

  it('should trigger the hover change event when hovering state changes', async () => {
    const hoverChange = jest.fn();
    const container = await render(
      `<div data-testid="trigger" (ngpHover)="hoverChange($event)"></div>`,
      {
        imports: [NgpHover],
        componentProperties: {
          hoverChange,
        },
      },
    );

    const trigger = container.getByTestId('trigger');
    fireEvent.mouseEnter(trigger);
    expect(hoverChange).toHaveBeenCalledWith(true);

    fireEvent.mouseLeave(trigger);
    expect(hoverChange).toHaveBeenCalledWith(false);
  });

  it('should not trigger hover events when the directive is disabled', async () => {
    const hoverStart = jest.fn();
    const hoverEnd = jest.fn();
    const container = await render(
      `<div data-testid="trigger" ngpHover (ngpHoverStart)="hoverStart()" (ngpHoverEnd)="hoverEnd()" [ngpHoverDisabled]="true"></div>`,
      {
        imports: [NgpHover],
        componentProperties: {
          hoverStart,
          hoverEnd,
        },
      },
    );

    const trigger = container.getByTestId('trigger');
    fireEvent.mouseEnter(trigger);
    expect(hoverStart).not.toHaveBeenCalled();

    fireEvent.mouseLeave(trigger);
    expect(hoverEnd).not.toHaveBeenCalled();
  });

  it('should not trigger hover events when a touchstart event occurs', async () => {
    const hoverStart = jest.fn();
    const hoverEnd = jest.fn();
    const container = await render(
      `<div data-testid="trigger" ngpHover (ngpHoverStart)="hoverStart()" (ngpHoverEnd)="hoverEnd()"></div>`,
      {
        imports: [NgpHover],
        componentProperties: {
          hoverStart,
          hoverEnd,
        },
      },
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
      const hoverStart = jest.fn();
      const container = await render(
        `<div data-testid="trigger" ngpHover (ngpHoverStart)="hoverStart()"></div>`,
        {
          imports: [NgpHover],
          componentProperties: {
            hoverStart,
          },
        },
      );

      const trigger = container.getByTestId('trigger');
      fireEvent.touchStart(trigger);
      dispatchPointerEvent(trigger, 'pointerenter', 'mouse');
      expect(hoverStart).not.toHaveBeenCalled();
    });

    it('should allow real mouse hover after touch once a real pointermove(mouse) occurs', async () => {
      const hoverStart = jest.fn();
      const container = await render(
        `<div data-testid="trigger" ngpHover (ngpHoverStart)="hoverStart()"></div>`,
        {
          imports: [NgpHover],
          componentProperties: {
            hoverStart,
          },
        },
      );

      const trigger = container.getByTestId('trigger');
      // Simulate a full touch + emulated event sequence
      fireEvent.touchStart(trigger);
      fireEvent.touchEnd(trigger);
      dispatchPointerEvent(trigger, 'pointerenter', 'mouse'); // emulated, should be blocked
      fireEvent.mouseEnter(trigger); // emulated, clears local flag
      expect(hoverStart).not.toHaveBeenCalled();

      // Leave the element
      dispatchPointerEvent(trigger, 'pointerleave', 'mouse');
      fireEvent.mouseLeave(trigger);

      // A real mouse produces a pointermove; iOS emulation never does.
      dispatchPointerEvent(document, 'pointermove', 'mouse');

      // Now a real mouse hover should work
      dispatchPointerEvent(trigger, 'pointerenter', 'mouse');
      expect(hoverStart).toHaveBeenCalled();
    });

    it('blocks emulated pointerenter(mouse) indefinitely until a real pointermove occurs', async () => {
      jest.useFakeTimers();
      const hoverStart = jest.fn();
      const container = await render(
        `<div data-testid="trigger" ngpHover (ngpHoverStart)="hoverStart()"></div>`,
        {
          imports: [NgpHover],
          componentProperties: {
            hoverStart,
          },
        },
      );

      // Fire the touch on the document (not the trigger) so only the
      // module-level flag is set — the per-element local flag stays false.
      // Simulates a touch on some other part of the page before hovering
      // this element with an emulated mouse event.
      fireEvent.touchEnd(document.body);

      // Well past any plausible timeout window — the flag must persist.
      jest.advanceTimersByTime(10_000);

      const trigger = container.getByTestId('trigger');
      dispatchPointerEvent(trigger, 'pointerenter', 'mouse');
      expect(hoverStart).not.toHaveBeenCalled();

      jest.useRealTimers();
    });

    it('does not clear the touch flag on pointermove(touch)', async () => {
      const hoverStart = jest.fn();
      const container = await render(
        `<div data-testid="trigger" ngpHover (ngpHoverStart)="hoverStart()"></div>`,
        {
          imports: [NgpHover],
          componentProperties: {
            hoverStart,
          },
        },
      );

      const trigger = container.getByTestId('trigger');
      fireEvent.touchStart(trigger);
      fireEvent.touchEnd(trigger);

      // A touch pointermove must not be treated as a real mouse signal.
      dispatchPointerEvent(document, 'pointermove', 'touch');

      dispatchPointerEvent(trigger, 'pointerenter', 'mouse');
      expect(hoverStart).not.toHaveBeenCalled();
    });

    it('blocks emulated hover on a freshly mounted directive after a prior touch', async () => {
      // First directive lifecycle: user touches, then navigates away.
      const firstHoverStart = jest.fn();
      const first = await render(
        `<div data-testid="trigger" ngpHover (ngpHoverStart)="hoverStart()"></div>`,
        {
          imports: [NgpHover],
          componentProperties: { hoverStart: firstHoverStart },
        },
      );
      fireEvent.touchStart(first.getByTestId('trigger'));
      fireEvent.touchEnd(first.getByTestId('trigger'));
      first.fixture.destroy();

      // Reset the testing module so the second render can reconfigure
      // TestBed — this also re-creates any `providedIn: 'root'` services,
      // which is exactly the scenario we want to prove resilient.
      TestBed.resetTestingModule();

      // Second directive lifecycle: simulates a fresh mount after navigation.
      // Any emulated pointerenter iOS fires must still be blocked, even though
      // Angular may have recreated its services in between.
      const secondHoverStart = jest.fn();
      const second = await render(
        `<div data-testid="trigger" ngpHover (ngpHoverStart)="hoverStart()"></div>`,
        {
          imports: [NgpHover],
          componentProperties: { hoverStart: secondHoverStart },
        },
      );
      dispatchPointerEvent(second.getByTestId('trigger'), 'pointerenter', 'mouse');
      expect(secondHoverStart).not.toHaveBeenCalled();
    });

    it('should reset hover state when touch starts while hovered', async () => {
      const hoverEnd = jest.fn();
      const container = await render(
        `<div data-testid="trigger" ngpHover (ngpHoverEnd)="hoverEnd()"></div>`,
        {
          imports: [NgpHover],
          componentProperties: {
            hoverEnd,
          },
        },
      );

      const trigger = container.getByTestId('trigger');
      // Activate hover via pointerenter
      dispatchPointerEvent(trigger, 'pointerenter', 'mouse');
      // Touch starts while hovered - should reset
      fireEvent.touchStart(trigger);
      expect(hoverEnd).toHaveBeenCalled();
    });

    it('should block both emulated pointerenter and mouseenter after touchstart', async () => {
      const hoverStart = jest.fn();
      const container = await render(
        `<div data-testid="trigger" ngpHover (ngpHoverStart)="hoverStart()"></div>`,
        {
          imports: [NgpHover],
          componentProperties: {
            hoverStart,
          },
        },
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
      const hoverStart = jest.fn();
      const hoverEnd = jest.fn();
      const hoverChange = jest.fn();

      const container = await render(
        `<div data-testid="trigger" ngpHover (ngpHoverStart)="hoverStart()" (ngpHoverEnd)="hoverEnd()" (ngpHover)="hoverChange($event)"></div>`,
        {
          imports: [NgpHover],
          providers: [provideInteractionsConfig({ disabled: true })],
          componentProperties: {
            hoverStart,
            hoverEnd,
            hoverChange,
          },
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
      const hoverStart = jest.fn();
      const hoverEnd = jest.fn();
      const hoverChange = jest.fn();

      const container = await render(
        `<div data-testid="trigger" ngpHover (ngpHoverStart)="hoverStart()" (ngpHoverEnd)="hoverEnd()" (ngpHover)="hoverChange($event)"></div>`,
        {
          imports: [NgpHover],
          providers: [provideInteractionsConfig({ hover: false })],
          componentProperties: {
            hoverStart,
            hoverEnd,
            hoverChange,
          },
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
      const hoverStart = jest.fn();
      const hoverEnd = jest.fn();
      const hoverChange = jest.fn();

      const container = await render(
        `<div data-testid="trigger" ngpHover (ngpHoverStart)="hoverStart()" (ngpHoverEnd)="hoverEnd()" (ngpHover)="hoverChange($event)"></div>`,
        {
          imports: [NgpHover],
          providers: [provideInteractionsConfig({ hover: true })],
          componentProperties: {
            hoverStart,
            hoverEnd,
            hoverChange,
          },
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
