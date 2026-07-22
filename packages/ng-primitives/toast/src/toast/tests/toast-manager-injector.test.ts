import {
  ApplicationRef,
  Component,
  Directive,
  ElementRef,
  EnvironmentInjector,
  Injector,
  InjectionToken,
  TemplateRef,
  createComponent,
  createEnvironmentInjector,
  inject,
  viewChild,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it } from 'vitest';
import { NgpToast } from '../toast';
import { NgpToastManager } from '../toast-manager';

/**
 * A token that is only provided in a child environment injector (never at the
 * application root), mirroring the micro-frontend / `provideChildTranslateService()`
 * scenario from https://github.com/ng-primitives/ng-primitives/issues/823.
 */
const MESSAGE = new InjectionToken<string>('MESSAGE');

/** Reads the token from DI and renders it, so we can assert which injector resolved it. */
@Directive({ selector: '[readMessage]' })
class ReadMessage {
  constructor() {
    const element = inject(ElementRef).nativeElement as HTMLElement;
    element.textContent = inject(MESSAGE);
  }
}

@Component({
  selector: 'ngp-toast-injector-host',
  template: `
    <ng-template #toast>
      <div ngpToast>
        <span readMessage data-testid="message"></span>
      </div>
    </ng-template>
  `,
  imports: [NgpToast, ReadMessage],
})
class ToastInjectorHost {
  readonly toast = viewChild.required<TemplateRef<void>>('toast');
  /** The component's own injector — what a real caller passes to `show()`. */
  readonly injector = inject(Injector);
}

describe('NgpToastManager injector option', () => {
  let manager: NgpToastManager | undefined;

  afterEach(async () => {
    manager?.toasts().forEach(t => manager?.dismiss(t.instance));
    await Promise.resolve();
    manager = undefined;
    document
      .querySelectorAll('[data-ngp-toast-container]')
      .forEach(container => container.remove());
  });

  it('resolves DI-dependent content from the caller injector, not the root injector', async () => {
    const appRef = TestBed.inject(ApplicationRef);
    manager = TestBed.inject(NgpToastManager);

    // Create a child environment injector that provides MESSAGE. The root injector
    // deliberately does NOT provide it, so if the toast resolves from the root
    // injector the content directive will throw NullInjectorError.
    const parentEnvironmentInjector = TestBed.inject(EnvironmentInjector);
    const childEnvironmentInjector = createEnvironmentInjector(
      [{ provide: MESSAGE, useValue: 'child-injector-message' }],
      parentEnvironmentInjector,
    );

    // Mount the host component within the child environment injector, emulating a
    // remote/lazy component subtree that owns its own providers.
    const hostElement = document.createElement('div');
    document.body.appendChild(hostElement);

    const componentRef = createComponent(ToastInjectorHost, {
      environmentInjector: childEnvironmentInjector,
      hostElement,
    });
    appRef.attachView(componentRef.hostView);
    componentRef.changeDetectorRef.detectChanges();

    const host = componentRef.instance;
    manager.show(host.toast(), { injector: host.injector, persistent: true });
    await Promise.resolve();

    const message = document.querySelector('[data-testid="message"]');
    expect(message?.textContent).toBe('child-injector-message');

    componentRef.destroy();
    hostElement.remove();
    childEnvironmentInjector.destroy();
  });
});
