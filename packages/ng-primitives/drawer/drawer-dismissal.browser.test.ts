import { OverlayContainer, OverlayModule } from '@angular/cdk/overlay';
import { Component, signal, viewChild, viewChildren } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgpDrawerBackdrop } from './backdrop/drawer-backdrop';
import { NgpDrawerChangeReason, NgpDrawerOpenChangeEvent } from './drawer.types';
import { NgpDrawerPopup } from './popup/drawer-popup';
import { NgpDrawerPortal } from './portal/drawer-portal';
import { NgpDrawerRoot } from './root/drawer-root';
import { NgpDrawerTrigger } from './trigger/drawer-trigger';
import { NgpDrawerViewport } from './viewport/drawer-viewport';

const DRAWER_IMPORTS = [
  OverlayModule,
  NgpDrawerBackdrop,
  NgpDrawerPopup,
  NgpDrawerPortal,
  NgpDrawerRoot,
  NgpDrawerTrigger,
  NgpDrawerViewport,
] as const;

@Component({
  imports: DRAWER_IMPORTS,
  template: `
    <div #customContainer data-test-custom-container></div>
    <ng-container
      [disablePointerDismissal]="disablePointerDismissal()"
      [modal]="false"
      (beforeOpenChange)="record($event)"
      ngpDrawerRoot
    >
      <button data-test-trigger ngpDrawerTrigger>Open</button>
      <ng-template [container]="custom() ? customContainer : null" ngpDrawerPortal>
        <div data-test-backdrop ngpDrawerBackdrop>
          <span data-test-backdrop-child></span>
        </div>
        <div data-test-viewport ngpDrawerViewport>
          <section data-test-popup ngpDrawerPopup>
            <button data-test-inside type="button">Inside</button>
            <div data-test-shadow-host></div>
          </section>
        </div>
      </ng-template>
    </ng-container>
    <button data-test-outside type="button">Outside</button>
  `,
})
class DismissalHost {
  readonly custom = signal(false);
  readonly disablePointerDismissal = signal(false);
  readonly root = viewChild.required(NgpDrawerRoot);
  readonly reasons: NgpDrawerChangeReason[] = [];

  record(event: NgpDrawerOpenChangeEvent): void {
    this.reasons.push(event.reason);
  }
}

@Component({
  imports: DRAWER_IMPORTS,
  template: `
    <ng-container [modal]="false" ngpDrawerRoot>
      <ng-template ngpDrawerPortal>
        <div ngpDrawerViewport><section data-test-popup-a ngpDrawerPopup>A</section></div>
      </ng-template>
    </ng-container>
    <ng-container [modal]="false" ngpDrawerRoot>
      <ng-template ngpDrawerPortal>
        <div ngpDrawerViewport><section data-test-popup-b ngpDrawerPopup>B</section></div>
      </ng-template>
    </ng-container>
    <button data-test-outside type="button">Outside</button>
  `,
})
class StackHost {
  readonly roots = viewChildren(NgpDrawerRoot);
}

describe('Drawer dismissal', () => {
  let fixture: ComponentFixture<DismissalHost> | undefined;
  let stackFixture: ComponentFixture<StackHost> | undefined;
  let overlayContainer: OverlayContainer | undefined;

  afterEach(() => {
    fixture?.destroy();
    stackFixture?.destroy();
    overlayContainer?.ngOnDestroy();
    document
      .querySelectorAll('[data-ngp-drawer-custom-host], [data-ngp-drawer-overlay-host]')
      .forEach(element => element.remove());
  });

  it('requires matching outside down/up containment', async () => {
    await createDismissalFixture();
    const popup = await openDrawer();
    const inside = popup.querySelector<HTMLElement>('[data-test-inside]')!;
    const outside = fixture!.nativeElement.querySelector<HTMLElement>('[data-test-outside]')!;

    dispatchPointer(inside, 'pointerdown', 1);
    dispatchPointer(outside, 'pointerup', 1);
    fixture!.detectChanges();
    expect(fixture!.componentInstance.root().open()).toBe(true);

    dispatchPointer(outside, 'pointerdown', 2);
    dispatchPointer(inside, 'pointerup', 2);
    fixture!.detectChanges();
    expect(fixture!.componentInstance.root().open()).toBe(true);

    dispatchPointer(outside, 'pointerdown', 3);
    dispatchPointer(outside, 'pointerup', 3);
    fixture!.detectChanges();
    expect(fixture!.componentInstance.root().open()).toBe(false);
    expect(fixture!.componentInstance.reasons.at(-1)).toBe('outside-press');
  });

  it('uses the final compatibility click target for touch dismissal', async () => {
    await createDismissalFixture();
    const popup = await openDrawer();
    const inside = popup.querySelector<HTMLElement>('[data-test-inside]')!;
    const outside = fixture!.nativeElement.querySelector<HTMLElement>('[data-test-outside]')!;

    dispatchPointer(outside, 'pointerdown', 4, 0, 0, 'touch');
    dispatchPointer(outside, 'pointerup', 4, 0, 0, 'touch');
    inside.click();
    fixture!.detectChanges();

    expect(fixture!.componentInstance.root().open()).toBe(true);

    dispatchPointer(outside, 'pointerdown', 5, 0, 0, 'touch');
    dispatchPointer(outside, 'pointerup', 5, 0, 0, 'touch');
    fixture!.detectChanges();
    expect(fixture!.componentInstance.root().open()).toBe(true);

    outside.click();
    fixture!.detectChanges();
    expect(fixture!.componentInstance.root().open()).toBe(false);
    expect(fixture!.componentInstance.reasons.at(-1)).toBe('outside-press');
  });

  it('dismisses when pressing the viewport outside the popup', async () => {
    await createDismissalFixture();
    await openDrawer();
    const viewport = document.querySelector<HTMLElement>('[data-test-viewport]')!;

    dispatchPointer(viewport, 'pointerdown', 1);
    dispatchPointer(viewport, 'pointerup', 1);
    fixture!.detectChanges();

    expect(fixture!.componentInstance.root().open()).toBe(false);
    expect(fixture!.componentInstance.reasons.at(-1)).toBe('outside-press');
  });

  it('does not dismiss when dragging the viewport outside the popup', async () => {
    await createDismissalFixture();
    await openDrawer();
    const viewport = document.querySelector<HTMLElement>('[data-test-viewport]')!;
    const reasonsBeforeDrag = [...fixture!.componentInstance.reasons];

    dispatchPointer(viewport, 'pointerdown', 1, 0, 0);
    dispatchPointer(viewport, 'pointermove', 1, 30, 0);
    dispatchPointer(viewport, 'pointerup', 1, 30, 0);
    fixture!.detectChanges();

    expect(fixture!.componentInstance.root().open()).toBe(true);
    expect(fixture!.componentInstance.reasons).toEqual(reasonsBeforeDrag);
  });

  it('dismisses only an exact backdrop down/up pair', async () => {
    await createDismissalFixture();
    await openDrawer();
    const backdrop = document.querySelector<HTMLElement>('[data-test-backdrop]')!;
    const child = backdrop.querySelector<HTMLElement>('[data-test-backdrop-child]')!;

    dispatchPointer(child, 'pointerdown', 1);
    dispatchPointer(child, 'pointerup', 1);
    fixture!.detectChanges();
    expect(fixture!.componentInstance.root().open()).toBe(true);

    dispatchPointer(backdrop, 'pointerdown', 2);
    dispatchPointer(backdrop, 'pointerup', 2);
    fixture!.detectChanges();
    expect(fixture!.componentInstance.root().open()).toBe(false);
    expect(fixture!.componentInstance.reasons.at(-1)).toBe('backdrop-press');
  });

  it('treats portaled and Shadow DOM descendants as inside', async () => {
    await createDismissalFixture();
    fixture!.componentInstance.custom.set(true);
    const popup = await openDrawer();
    const inside = popup.querySelector<HTMLElement>('[data-test-inside]')!;
    dispatchPointer(inside, 'pointerdown', 1);
    dispatchPointer(inside, 'pointerup', 1);

    const shadowHost = popup.querySelector<HTMLElement>('[data-test-shadow-host]')!;
    const shadowRoot = shadowHost.attachShadow({ mode: 'open' });
    const shadowButton = document.createElement('button');
    shadowRoot.append(shadowButton);
    dispatchPointer(shadowButton, 'pointerdown', 2);
    dispatchPointer(shadowButton, 'pointerup', 2);
    fixture!.detectChanges();

    expect(fixture!.componentInstance.root().open()).toBe(true);
    expect(fixture!.componentInstance.reasons).toEqual(['imperative']);
  });

  it('blocks outside, backdrop, and focus-out dismissal while preserving Escape', async () => {
    await createDismissalFixture();
    await openDrawer();
    fixture!.componentInstance.disablePointerDismissal.set(true);
    fixture!.detectChanges();
    const outside = fixture!.nativeElement.querySelector<HTMLElement>('[data-test-outside]')!;
    const backdrop = document.querySelector<HTMLElement>('[data-test-backdrop]')!;

    dispatchPointer(outside, 'pointerdown', 1);
    dispatchPointer(outside, 'pointerup', 1);
    dispatchPointer(backdrop, 'pointerdown', 2);
    dispatchPointer(backdrop, 'pointerup', 2);
    outside.focus();
    fixture!.detectChanges();
    expect(fixture!.componentInstance.root().open()).toBe(true);

    document.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' }));
    fixture!.detectChanges();
    expect(fixture!.componentInstance.root().open()).toBe(false);
    expect(fixture!.componentInstance.reasons.at(-1)).toBe('escape-key');
  });

  it('dismisses a non-modal drawer on focus-out without stealing focus back', async () => {
    await createDismissalFixture();
    await openDrawer();
    const outside = fixture!.nativeElement.querySelector<HTMLElement>('[data-test-outside]')!;

    outside.focus();
    fixture!.detectChanges();

    expect(fixture!.componentInstance.root().open()).toBe(false);
    expect(fixture!.componentInstance.reasons.at(-1)).toBe('focus-out');
    expect(document.activeElement).toBe(outside);
  });

  it('lets only the topmost drawer handle outside press and Escape', async () => {
    await TestBed.configureTestingModule({ imports: [StackHost] }).compileComponents();
    overlayContainer = TestBed.inject(OverlayContainer);
    stackFixture = TestBed.createComponent(StackHost);
    stackFixture.detectChanges();
    const [first, second] = stackFixture.componentInstance.roots();
    first.show();
    second.show();
    stackFixture.detectChanges();
    await waitForElement('[data-test-popup-b]');
    const outside = stackFixture.nativeElement.querySelector<HTMLElement>('[data-test-outside]')!;

    dispatchPointer(outside, 'pointerdown', 1);
    dispatchPointer(outside, 'pointerup', 1);
    stackFixture.detectChanges();
    expect(first.open()).toBe(true);
    expect(second.open()).toBe(false);

    document.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' }));
    stackFixture.detectChanges();
    expect(first.open()).toBe(false);
  });

  it('uses and destroys CloseWatcher when the platform provides it', async () => {
    class CloseWatcherStub extends EventTarget {
      static readonly instances: CloseWatcherStub[] = [];
      readonly destroy = vi.fn();

      constructor() {
        super();
        CloseWatcherStub.instances.push(this);
      }
    }

    const descriptor = Object.getOwnPropertyDescriptor(window, 'CloseWatcher');
    Object.defineProperty(window, 'CloseWatcher', {
      configurable: true,
      value: CloseWatcherStub,
      writable: true,
    });
    try {
      await createDismissalFixture();
      await openDrawer();
      const watcher = CloseWatcherStub.instances.at(-1)!;

      watcher.dispatchEvent(new Event('close'));
      fixture!.detectChanges();

      expect(fixture!.componentInstance.root().open()).toBe(false);
      expect(fixture!.componentInstance.reasons.at(-1)).toBe('escape-key');
      expect(watcher.destroy).toHaveBeenCalledOnce();
    } finally {
      if (descriptor) {
        Object.defineProperty(window, 'CloseWatcher', descriptor);
      } else {
        delete (window as Window & { CloseWatcher?: unknown }).CloseWatcher;
      }
    }
  });

  async function createDismissalFixture(): Promise<void> {
    await TestBed.configureTestingModule({ imports: [DismissalHost] }).compileComponents();
    overlayContainer = TestBed.inject(OverlayContainer);
    fixture = TestBed.createComponent(DismissalHost);
    fixture.detectChanges();
  }

  async function openDrawer(): Promise<HTMLElement> {
    fixture!.componentInstance.root().show();
    fixture!.detectChanges();
    return waitForElement('[data-test-popup]');
  }
});

function dispatchPointer(
  target: EventTarget,
  type: 'pointerdown' | 'pointermove' | 'pointerup',
  pointerId: number,
  clientX = 0,
  clientY = 0,
  pointerType = 'mouse',
): void {
  target.dispatchEvent(
    new PointerEvent(type, {
      bubbles: true,
      button: 0,
      clientX,
      clientY,
      composed: true,
      isPrimary: true,
      pointerId,
      pointerType,
    }),
  );
}

async function waitForElement(selector: string): Promise<HTMLElement> {
  await vi.waitFor(() => expect(document.querySelector(selector)).not.toBeNull());
  return document.querySelector<HTMLElement>(selector)!;
}
