export interface DrawerVisualState {
  movementX: number;
  movementY: number;
  progress: number;
  strength: number;
  frontmostHeight: number;
}

export type DrawerVisualStateListener = (state: Readonly<DrawerVisualState>) => void;

export class DrawerVisualStateStore {
  private state: DrawerVisualState = {
    movementX: 0,
    movementY: 0,
    progress: 0,
    strength: 0,
    frontmostHeight: 0,
  };
  private readonly listeners = new Set<DrawerVisualStateListener>();

  getSnapshot(): Readonly<DrawerVisualState> {
    return this.state;
  }

  set(update: Partial<DrawerVisualState>): void {
    this.state = { ...this.state, ...update };
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }

  reset(): void {
    this.set({ movementX: 0, movementY: 0, progress: 0, strength: 0 });
  }

  subscribe(listener: DrawerVisualStateListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}
