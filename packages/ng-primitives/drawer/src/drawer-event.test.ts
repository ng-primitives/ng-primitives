import { NgpDrawerOpenChangeEvent, NgpDrawerSnapPointChangeEvent } from './drawer.types';

describe('Drawer change events', () => {
  it('supports cancellation and close-only unmount prevention', () => {
    const event = new NgpDrawerOpenChangeEvent(false, 'outside-press');

    event.cancel();
    event.preventUnmountOnClose();

    expect(event.canceled).toBe(true);
    expect(event.unmountPrevented).toBe(true);
    expect(event.nextOpen).toBe(false);
  });

  it('ignores unmount prevention for opening events', () => {
    const event = new NgpDrawerOpenChangeEvent(true, 'trigger-press');
    event.preventUnmountOnClose();
    expect(event.unmountPrevented).toBe(false);
  });

  it('cancels snap-point changes', () => {
    const event = new NgpDrawerSnapPointChangeEvent('12rem', 'programmatic');
    event.cancel();
    expect(event.canceled).toBe(true);
    expect(event.nextSnapPoint).toBe('12rem');
  });
});
