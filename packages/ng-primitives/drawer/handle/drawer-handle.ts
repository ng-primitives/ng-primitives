import { computed, signal, Signal } from '@angular/core';

export interface NgpDrawerHandle<Payload = unknown> {
  readonly opened: Signal<boolean>;
  readonly payload: Signal<Payload | undefined>;
  open(payload?: Payload, triggerId?: string): void;
  close(): void;
  toggle(): void;
  unmount(): void;
}

export interface NgpDrawerHandleController<Payload> {
  readonly opened: () => boolean;
  readonly payload: () => Payload | undefined;
  open(payload?: Payload, triggerId?: string): void;
  close(): void;
  toggle(): void;
  unmount(): void;
}

class DrawerHandleImpl<Payload> implements NgpDrawerHandle<Payload> {
  private readonly attachments: { controller: NgpDrawerHandleController<Payload> }[] = [];
  private readonly controller = signal<NgpDrawerHandleController<Payload> | null>(null);

  readonly opened = computed(() => this.controller()?.opened() ?? false);
  readonly payload = computed(() => this.controller()?.payload());

  open(payload?: Payload, triggerId?: string): void {
    this.controller()?.open(payload, triggerId);
  }

  close(): void {
    this.controller()?.close();
  }

  toggle(): void {
    this.controller()?.toggle();
  }

  unmount(): void {
    this.controller()?.unmount();
  }

  attach(controller: NgpDrawerHandleController<Payload>): () => void {
    const attachment = { controller };
    this.attachments.push(attachment);
    this.controller.set(controller);

    return () => {
      const index = this.attachments.indexOf(attachment);
      if (index === -1) {
        return;
      }

      this.attachments.splice(index, 1);
      this.controller.set(this.attachments.at(-1)?.controller ?? null);
    };
  }
}

export function createDrawerHandle<Payload = unknown>(): NgpDrawerHandle<Payload> {
  return new DrawerHandleImpl<Payload>();
}

/** @internal Used only by NgpDrawerRoot. */
export function setDrawerHandleController<Payload>(
  handle: NgpDrawerHandle<Payload>,
  controller: NgpDrawerHandleController<Payload>,
): () => void {
  if (!(handle instanceof DrawerHandleImpl)) {
    throw new Error('ngpDrawerRoot: handle must be created with createDrawerHandle().');
  }
  return handle.attach(controller);
}
