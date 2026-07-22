import {
  ApplicationRef,
  Component,
  Directive,
  ElementRef,
  EnvironmentInjector,
  InjectionToken,
  createComponent,
  createEnvironmentInjector,
  inject,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  NgpDialog,
  NgpDialogManager,
  NgpDialogOverlay,
  NgpDialogTrigger,
} from 'ng-primitives/dialog';
import { afterEach, describe, expect, it } from 'vitest';

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
  selector: 'ngp-dialog-injector-host',
  template: `
    <button [ngpDialogTrigger]="dialog" data-testid="trigger">Open</button>

    <ng-template #dialog>
      <div ngpDialogOverlay>
        <div ngpDialog>
          <span readMessage data-testid="message"></span>
        </div>
      </div>
    </ng-template>
  `,
  imports: [NgpDialogTrigger, NgpDialog, NgpDialogOverlay, ReadMessage],
})
class DialogInjectorHost {}

describe('NgpDialogTrigger injector context', () => {
  let dialogManager: NgpDialogManager | undefined;

  afterEach(async () => {
    dialogManager?.closeAll();
    await Promise.resolve();
    await Promise.resolve();
    dialogManager = undefined;
  });

  it('resolves DI-dependent content from the trigger component injector, not the root injector', async () => {
    const appRef = TestBed.inject(ApplicationRef);
    dialogManager = TestBed.inject(NgpDialogManager);

    // Create a child environment injector that provides MESSAGE. The root injector
    // deliberately does NOT provide it, so if the dialog resolves from the root
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

    const componentRef = createComponent(DialogInjectorHost, {
      environmentInjector: childEnvironmentInjector,
      hostElement,
    });
    appRef.attachView(componentRef.hostView);
    componentRef.changeDetectorRef.detectChanges();

    const trigger = hostElement.querySelector('[data-testid="trigger"]') as HTMLElement;
    trigger.click();
    await Promise.resolve();

    const message = document.querySelector('[data-testid="message"]');
    expect(message?.textContent).toBe('child-injector-message');

    componentRef.destroy();
    hostElement.remove();
    childEnvironmentInjector.destroy();
  });
});
