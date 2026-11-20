import { booleanAttribute, DestroyRef, Directive, inject, input } from '@angular/core';
import { injectElementRef, explicitEffect } from 'ng-primitives/internal';
import { attrBinding } from 'ng-primitives/state';
import { NgpDrawerHandle } from '../handle/drawer-handle';
import { createDrawerId, isNativeInteractiveElement } from '../internal/dom';
import { injectDrawerState } from '../internal/drawer-state';

@Directive({
  selector: '[ngpDrawerTrigger]',
  standalone: true,
  host: {
    'aria-haspopup': 'dialog',
    '[attr.aria-expanded]': 'opened() ? "true" : "false"',
    '[attr.aria-disabled]': 'disabled() ? "true" : null',
    '[attr.data-open]': 'opened() ? "" : null',
    '[attr.data-closed]': 'opened() ? null : ""',
    '[attr.data-disabled]': 'disabled() ? "" : null',
    '(click)': 'activate($event)',
    '(keydown)': 'onKeydown($event)',
  },
})
export class NgpDrawerTrigger {
  readonly ngpDrawerHandle = input<NgpDrawerHandle<unknown> | undefined>();
  readonly ngpDrawerPayload = input<unknown>();
  readonly disabled = input(false, { transform: booleanAttribute });

  private readonly elementRef = injectElementRef<HTMLElement>();
  private readonly stateRef = injectDrawerState({ optional: true });
  private readonly generatedId = createDrawerId('trigger');
  private readonly unregisterElement = this.stateRef()?.registerElement(
    this.elementRef.nativeElement,
  );

  constructor() {
    const element = this.elementRef.nativeElement;
    const state = this.stateRef();
    if (!element.id) {
      element.id = this.generatedId;
    }
    if (element instanceof HTMLButtonElement && !element.hasAttribute('type')) {
      element.type = 'button';
    }

    attrBinding(this.elementRef, 'aria-controls', () => state?.popup()?.id ?? null);

    if (state) {
      explicitEffect([state.activeTrigger], ([activeTrigger]) => {
        if (activeTrigger === element) {
          state.triggerId.set(element.id);
        }
      });
    }

    inject(DestroyRef).onDestroy(() => this.unregisterElement?.());
  }

  activate(event: Event): void {
    if (this.disabled()) {
      event.preventDefault();
      return;
    }
    const handle = this.ngpDrawerHandle();
    if (handle) {
      handle.open(this.ngpDrawerPayload(), this.elementRef.nativeElement.id);
      return;
    }
    const state = this.stateRef();
    if (!state) {
      throw new Error(
        'ngpDrawerTrigger must be inside ng-container[ngpDrawer] or receive [ngpDrawerHandle].',
      );
    }
    state.activeTrigger.set(this.elementRef.nativeElement);
    state.requestOpen(
      true,
      'trigger-press',
      {
        nativeEvent: event,
        trigger: this.elementRef.nativeElement,
      },
      this.ngpDrawerPayload(),
    );
  }

  onKeydown(event: KeyboardEvent): void {
    if (isNativeInteractiveElement(this.elementRef.nativeElement)) {
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.activate(event);
    }
  }

  protected opened(): boolean {
    return this.ngpDrawerHandle()?.opened() ?? this.stateRef()?.open() ?? false;
  }
}
