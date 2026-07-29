import { createPrimitive } from 'ng-primitives/state';
import { DrawerState } from '../drawer-state';
import { DrawerKeyboardController } from './keyboard-controller';

interface DrawerKeyboardContextProps {
  readonly document: Document;
}

interface Registration {
  readonly state: DrawerState;
  readonly controller: DrawerKeyboardController;
}

export function createDrawerKeyboardContext(props: DrawerKeyboardContextProps) {
  const registrations: Registration[] = [];
  let destroyed = false;

  const sync = (): void => {
    for (const registration of registrations) {
      registration.controller.sync();
    }
  };

  return {
    register(state: DrawerState, viewport: HTMLElement): () => void {
      const registration = {} as Registration;
      const controller = new DrawerKeyboardController(
        state,
        viewport,
        props.document,
        () =>
          registrations.filter(value => value.state.open() && value.state.mounted()).at(-1) ===
          registration,
      );
      Object.assign(registration, { state, controller });
      registrations.push(registration);
      sync();

      let registered = true;
      return () => {
        if (!registered) {
          return;
        }
        registered = false;
        const index = registrations.indexOf(registration);
        if (index >= 0) {
          registrations.splice(index, 1);
        }
        controller.destroy();
        sync();
      };
    },
    sync,
    destroy(): void {
      if (destroyed) {
        return;
      }
      destroyed = true;
      for (const registration of registrations.splice(0)) {
        registration.controller.destroy();
      }
    },
  };
}

export type DrawerKeyboardContext = ReturnType<typeof createDrawerKeyboardContext>;

export const [
  NgpDrawerVirtualKeyboardStateToken,
  ngpDrawerVirtualKeyboard,
  injectDrawerVirtualKeyboardState,
  provideDrawerVirtualKeyboardState,
] = createPrimitive('NgpDrawerVirtualKeyboard', createDrawerKeyboardContext);
