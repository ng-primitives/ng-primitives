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

// Provided only in a child environment injector (never at root), mirroring a
// component-scoped provider in a micro-frontend subtree. See #823.
const MESSAGE = new InjectionToken<string>('MESSAGE');

/** Renders the resolved token so we can assert which injector served it. */
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
    await Promise.all((manager?.toasts() ?? []).map(t => manager!.dismiss(t.instance)));
    manager = undefined;
    document
      .querySelectorAll('[data-ngp-toast-container]')
      .forEach(container => container.remove());
  });

  it('resolves DI-dependent content from the caller injector, not the root injector', async () => {
    const appRef = TestBed.inject(ApplicationRef);
    manager = TestBed.inject(NgpToastManager);

    // MESSAGE lives only here — resolving from root would throw NullInjectorError.
    const parentEnvironmentInjector = TestBed.inject(EnvironmentInjector);
    const childEnvironmentInjector = createEnvironmentInjector(
      [{ provide: MESSAGE, useValue: 'child-injector-message' }],
      parentEnvironmentInjector,
    );

    // Mount the host within the child environment injector (the remote's subtree).
    const hostElement = document.createElement('div');
    document.body.appendChild(hostElement);

    const componentRef = createComponent(ToastInjectorHost, {
      environmentInjector: childEnvironmentInjector,
      hostElement,
    });
    appRef.attachView(componentRef.hostView);
    componentRef.changeDetectorRef.detectChanges();

    const host = componentRef.instance;
    const toastRef = manager.show(host.toast(), { injector: host.injector, persistent: true });

    try {
      await Promise.resolve();

      const message = document.querySelector('[data-testid="message"]');
      expect(message?.textContent).toBe('child-injector-message');
    } finally {
      // Dispose the toast before tearing down the injector that renders it, and
      // run cleanup even when the assertion fails.
      await toastRef.dismiss();
      componentRef.destroy();
      hostElement.remove();
      childEnvironmentInjector.destroy();
    }
  });
});
