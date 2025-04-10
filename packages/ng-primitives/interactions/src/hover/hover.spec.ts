import { fireEvent, render } from '@testing-library/angular';
import { NgpHover } from './hover';

describe('NgpHover', () => {
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
});
