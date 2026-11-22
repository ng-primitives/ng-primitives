import { signal } from '@angular/core';
import { createDrawerState, DrawerState, DrawerStateProps } from './drawer-state';

function createState(): { state: DrawerState; open: ReturnType<typeof signal<boolean>> } {
  const open = signal(false);
  const props: DrawerStateProps = {
    open,
    nested: signal(false),
    expanded: signal(false),
    snapPoint: signal(null),
    triggerId: signal(null),
    modal: signal(true),
    disablePointerDismissal: signal(false),
    swipeDirection: signal('down'),
    snapPoints: signal(undefined),
    snapToSequentialPoints: signal(false),
    payload: signal(undefined),
    mounted: signal(false),
    preventUnmount: signal(false),
    requestOpen: () => true,
    requestSnapPoint: () => true,
    completeOpenChange: () => undefined,
    requestUnmount: () => undefined,
  };
  return { state: createDrawerState(props), open };
}

function createChild(height: number): ReturnType<typeof createState> {
  const child = createState();
  child.state.popupHeight.set(height);
  child.state.popupGeometryReady.set(true);
  child.state.visualStore.set({ frontmostHeight: height });
  return child;
}

describe('createDrawerState nested children', () => {
  it('treats the child opened last as frontmost, whatever the registration order', () => {
    const parent = createState().state;
    const first = createChild(100);
    const second = createChild(200);
    parent.registerNested(first.state);
    parent.registerNested(second.state);

    second.open.set(true);
    expect(parent.frontmostHeight()).toBe(200);

    first.open.set(true);
    expect(parent.frontmostHeight()).toBe(100);
    first.state.visualStore.set({ progress: 0.5 });
    expect(parent.nestedVisualStore.getSnapshot().frontmostHeight).toBe(100);

    first.open.set(false);
    expect(parent.frontmostHeight()).toBe(200);
  });
});
