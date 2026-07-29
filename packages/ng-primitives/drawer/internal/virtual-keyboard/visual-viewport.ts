// Adapted from Base UI DrawerVirtualKeyboardProvider (MIT), pinned at c33f4210.

export interface DrawerKeyboardViewport {
  readonly top: number;
  readonly bottom: number;
}

const KEYBOARD_RESIZE_THRESHOLD = 60;

export function getDrawerKeyboardViewport(window: Window): DrawerKeyboardViewport | null {
  const viewport = window.visualViewport;
  if (!viewport || viewport.scale !== 1) {
    return null;
  }

  if (window.innerHeight - viewport.height <= KEYBOARD_RESIZE_THRESHOLD) {
    return null;
  }

  const top = Math.max(0, viewport.offsetTop);
  return {
    top,
    bottom: Math.min(window.innerHeight, top + viewport.height),
  };
}

export function getDrawerKeyboardInset(window: Window, viewport: DrawerKeyboardViewport): number {
  return Math.max(0, window.innerHeight - viewport.bottom);
}
