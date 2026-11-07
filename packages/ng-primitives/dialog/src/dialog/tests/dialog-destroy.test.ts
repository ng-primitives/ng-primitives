import { ApplicationRef, Component, provideZonelessChangeDetection } from '@angular/core';
import { createApplication } from '@angular/platform-browser';
import { NgpDialogManager } from 'ng-primitives/dialog';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

// No `ngpDialog` in the content: that directive closes its dialog ref when destroyed, which
// would close the dialog whatever the manager does.
@Component({
  selector: 'ngp-destroy-dialog',
  template: '<p>Dialog</p>',
})
class TestDialog {}

@Component({
  selector: 'ngp-destroy-root',
  template: '',
})
class Root {}

describe('NgpDialogManager when the application is destroyed', () => {
  let host: HTMLElement;
  let appRef: ApplicationRef;

  beforeEach(async () => {
    host = document.createElement('ngp-destroy-root');
    document.body.appendChild(host);
    appRef = await createApplication({ providers: [provideZonelessChangeDetection()] });
    appRef.bootstrap(Root, host);
    await appRef.whenStable();
  });

  afterEach(() => {
    if (!appRef.destroyed) {
      appRef.destroy();
    }
    host.remove();
  });

  it('should close the open dialogs', () => {
    const manager = appRef.injector.get(NgpDialogManager);
    const first = manager.open(TestDialog);
    const second = manager.open(TestDialog);
    const closed: string[] = [];
    first.closed.subscribe(() => closed.push(first.id));
    second.closed.subscribe(() => closed.push(second.id));

    appRef.destroy();

    expect(closed).toEqual([second.id, first.id]);
  });

  it('should emit afterAllClosed', () => {
    const manager = appRef.injector.get(NgpDialogManager);
    manager.open(TestDialog);
    let emitted = false;
    manager.afterAllClosed.subscribe(() => (emitted = true));

    appRef.destroy();

    expect(emitted).toBe(true);
  });
});
