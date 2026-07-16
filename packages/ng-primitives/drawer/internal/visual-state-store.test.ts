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
});
