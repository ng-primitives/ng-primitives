import { createPrimitive } from 'ng-primitives/state';
import { DrawerStackService } from '../drawer-stack.service';
import { DrawerState } from '../drawer-state';
import { DrawerKeyboardController } from './keyboard-controller';

interface DrawerKeyboardContextProps {
  readonly document: Document;
  readonly stack: DrawerStackService;
}

interface Registration {
  readonly state: DrawerState;
  readonly controller: DrawerKeyboardController;
}

export function createDrawerKeyboardContext(props: DrawerKeyboardContextProps) {
  const registrations: Registration[] = [];
  let destroyed = false;

  // `registrations` is ordered by registration, which is not the painting order: the drawer in
  // front is the one activated last. A drawer that is open but not on the stack yet is about to
  // be activated, so it is already in front of every drawer the stack knows.
  const owner = (): DrawerState | undefined => {
    const open = registrations
      .filter(value => value.state.open() && value.state.mounted())
      .map(value => value.state);
    const pending = open.filter(state => props.stack.frontmost([state]) === undefined);
    return pending.at(-1) ?? props.stack.frontmost(open);
  };

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
        () => owner() === state,
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
