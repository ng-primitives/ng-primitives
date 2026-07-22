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

    // MESSAGE lives only here — resolving from root would throw NullInjectorError.
    const parentEnvironmentInjector = TestBed.inject(EnvironmentInjector);
    const childEnvironmentInjector = createEnvironmentInjector(
      [{ provide: MESSAGE, useValue: 'child-injector-message' }],
      parentEnvironmentInjector,
    );

    // Mount the host within the child environment injector (the remote's subtree).
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
