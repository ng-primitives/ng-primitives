import { DrawerVisualStateStore } from './visual-state-store';

describe('DrawerVisualStateStore', () => {
  it('publishes imperative snapshots without Angular signals', () => {
    const store = new DrawerVisualStateStore();
    const progress: number[] = [];
    const unsubscribe = store.subscribe(state => progress.push(state.progress));

    store.set({ progress: 0.5, movementY: 40 });
    store.reset();
    unsubscribe();
    store.set({ progress: 1 });

    expect(progress).toEqual([0.5, 0]);
    expect(store.getSnapshot().progress).toBe(1);
    expect(store.getSnapshot().movementY).toBe(0);
  });

  it('keeps the frontmost height when the gesture resets', () => {
    const store = new DrawerVisualStateStore();

    store.set({ frontmostHeight: 320, progress: 0.5, movementY: 40, strength: 0.2 });
    store.reset();

    expect(store.getSnapshot()).toEqual({
      movementX: 0,
      movementY: 0,
      progress: 0,
      strength: 0,
      frontmostHeight: 320,
    });
  });
});
