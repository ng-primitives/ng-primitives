import { OverlayContainer, OverlayModule } from '@angular/cdk/overlay';
import { Component, signal, viewChild, viewChildren } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgpDrawerBackdrop } from './backdrop/drawer-backdrop';
import { NgpDrawerClose } from './close/drawer-close';
import { NgpDrawerDescription } from './description/drawer-description';
import { NgpDrawerFocusTarget, NgpDrawerModal } from './drawer.types';
import { createDrawerHandle } from './handle/drawer-handle';
import { NgpDrawerPopup } from './popup/drawer-popup';
import { NgpDrawerPortal } from './portal/drawer-portal';
import { NgpDrawerRoot } from './root/drawer-root';
import { NgpDrawerSwipeArea } from './swipe-area/drawer-swipe-area';
import { NgpDrawerTitle } from './title/drawer-title';
import { NgpDrawerTrigger } from './trigger/drawer-trigger';
import { NgpDrawerViewport } from './viewport/drawer-viewport';

const DRAWER_IMPORTS = [
  OverlayModule,
  NgpDrawerBackdrop,
  NgpDrawerClose,
  NgpDrawerDescription,
  NgpDrawerPopup,
  NgpDrawerPortal,
  NgpDrawerRoot,
  NgpDrawerSwipeArea,
  NgpDrawerTitle,
  NgpDrawerTrigger,
  NgpDrawerViewport,
] as const;

@Component({
  imports: DRAWER_IMPORTS,
  template: `
    <button id="prior-target" type="button">Prior</button>
    <button id="final-target" type="button">Final</button>
    @if (showDetachedTrigger()) {
      <button [ngpDrawerHandle]="handle" data-test-detached-trigger ngpDrawerTrigger>
        Open detached
      </button>
    }
    <ng-container [handle]="handle" [modal]="modal()" ngpDrawerRoot>
      @if (showInTreeTrigger()) {
        <button data-test-trigger ngpDrawerTrigger>Open</button>
      }
      <div data-test-swipe-area ngpDrawerSwipeArea></div>
      <ng-template ngpDrawerPortal>
        <div data-test-backdrop ngpDrawerBackdrop></div>
        <div ngpDrawerViewport>
          <section
            [finalFocus]="finalFocus()"
            [initialFocus]="initialFocus()"
            [role]="role()"
            data-test-popup
            ngpDrawerPopup
          >
            <h2 ngpDrawerTitle>Accessible drawer</h2>
            <p ngpDrawerDescription>Drawer details</p>
            <button id="initial-target" type="button">Initial</button>
            @if (showMarked()) {
              <button cdkFocusInitial data-test-marked type="button">Marked</button>
            }
            <button data-test-close ngpDrawerClose>Close</button>
          </section>
        </div>
      </ng-template>
    </ng-container>
  `,
})
class AccessibilityHost {
  readonly handle = createDrawerHandle();
  readonly modal = signal<NgpDrawerModal>(true);
  readonly role = signal<'dialog' | 'alertdialog'>('dialog');
  readonly initialFocus = signal<NgpDrawerFocusTarget>(undefined);
  readonly finalFocus = signal<NgpDrawerFocusTarget>(undefined);
  readonly showMarked = signal(false);
  readonly showDetachedTrigger = signal(true);
  readonly showInTreeTrigger = signal(true);
  readonly root = viewChild.required(NgpDrawerRoot);
}

@Component({
  imports: DRAWER_IMPORTS,
  template: `
    <ng-container ngpDrawerRoot>
      <ng-template ngpDrawerPortal>
        <div ngpDrawerViewport>
          <section data-test-outer-popup ngpDrawerPopup>
            <button cdkFocusInitial data-test-outer-initial type="button">Outer initial</button>
            <ng-container ngpDrawerRoot>
              <button data-test-inner-trigger ngpDrawerTrigger>Open inner</button>
              <ng-template ngpDrawerPortal>
                <div ngpDrawerViewport>
                  <section data-test-inner-popup ngpDrawerPopup>
                    <button cdkFocusInitial data-test-inner-initial type="button">
                      Inner initial
                    </button>
                  </section>
                </div>
              </ng-template>
            </ng-container>
          </section>
        </div>
      </ng-template>
    </ng-container>
  `,
})
class NestedAccessibilityHost {
  readonly roots = viewChildren(NgpDrawerRoot);
}

describe('Drawer accessibility', () => {
  let fixture: ComponentFixture<AccessibilityHost> | undefined;
  let nestedFixture: ComponentFixture<NestedAccessibilityHost> | undefined;
  let overlayContainer: OverlayContainer | undefined;
  const ownedElements: HTMLElement[] = [];

  afterEach(() => {
    fixture?.destroy();
    nestedFixture?.destroy();
    overlayContainer?.ngOnDestroy();
    for (const element of ownedElements) {
      element.remove();
    }
    ownedElements.length = 0;
    document
      .querySelectorAll('[data-ngp-drawer-custom-host], [data-ngp-drawer-overlay-host]')
      .forEach(element => element.remove());
  });

  it.each([
    { mode: true as const, trapped: true, isolated: true, scrollLocked: true },
    { mode: 'trap-focus' as const, trapped: true, isolated: false, scrollLocked: false },
    { mode: false as const, trapped: false, isolated: false, scrollLocked: false },
  ])('applies the $mode modal contract', async ({ mode, trapped, isolated, scrollLocked }) => {
    await createAccessibilityFixture();
    const outside = appendOutsideElement();
    fixture!.componentInstance.modal.set(mode);
    fixture!.componentInstance.root().show();
    fixture!.detectChanges();

    const popup = await waitForElement('[data-test-popup]');
    await vi.waitFor(() => expect(document.activeElement).toBe(popup));

    expect(popup.getAttribute('aria-modal')).toBe(mode === true ? 'true' : null);
    const backdrop = document.querySelector<HTMLElement>('[data-test-backdrop]')!;
    const trigger = fixture!.nativeElement.querySelector<HTMLElement>('[data-test-trigger]')!;
    const swipeArea = fixture!.nativeElement.querySelector<HTMLElement>('[data-test-swipe-area]')!;
    expect(document.querySelectorAll('.cdk-focus-trap-anchor')).toHaveLength(trapped ? 2 : 0);
    expect(outside.inert).toBe(isolated);
    expect(outside.getAttribute('aria-hidden')).toBe(isolated ? 'true' : null);
    expect(outside.style.pointerEvents).toBe(isolated ? 'none' : 'auto');
    expect(isEffectivelyInert(trigger)).toBe(isolated);
    expect(isEffectivelyInert(swipeArea)).toBe(isolated);
    expect(isEffectivelyInert(popup)).toBe(false);
    expect(isEffectivelyInert(backdrop)).toBe(false);
    expect(document.documentElement.classList.contains('cdk-global-scrollblock')).toBe(
      scrollLocked,
    );

    fixture!.componentInstance.root().hide();
    fixture!.detectChanges();
    await vi.waitFor(() => expect(outside.getAttribute('aria-hidden')).toBeNull());
    expect(outside.inert).toBe(false);
    expect(outside.style.pointerEvents).toBe('auto');
    expect(isEffectivelyInert(trigger)).toBe(false);
    expect(isEffectivelyInert(swipeArea)).toBe(false);
  });

  it('publishes role, labels, trigger ARIA, marked initial focus, and trigger restoration', async () => {
    await createAccessibilityFixture();
    fixture!.componentInstance.role.set('alertdialog');
    fixture!.componentInstance.showMarked.set(true);
    const trigger = fixture!.nativeElement.querySelector<HTMLElement>('[data-test-trigger]')!;
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect((trigger as HTMLButtonElement).type).toBe('button');

    trigger.click();
    fixture!.detectChanges();
    const popup = await waitForElement('[data-test-popup]');
    const marked = popup.querySelector<HTMLElement>('[data-test-marked]')!;
    await vi.waitFor(() => expect(document.activeElement).toBe(marked));

    expect(popup.getAttribute('role')).toBe('alertdialog');
    expect(popup.getAttribute('aria-labelledby')).toMatch(/^ngp-drawer-title-/);
    expect(popup.getAttribute('aria-describedby')).toMatch(/^ngp-drawer-description-/);
    expect(trigger.getAttribute('aria-haspopup')).toBe('dialog');
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(trigger.getAttribute('aria-controls')).toBe(popup.id);

    popup.querySelector<HTMLElement>('[data-test-close]')!.click();
    fixture!.detectChanges();
    await vi.waitFor(() => expect(document.activeElement).toBe(trigger));
  });

  it('restores focus to the current triggerId instead of a stale active trigger', async () => {
    await createAccessibilityFixture();
    const inTreeTrigger = fixture!.nativeElement.querySelector<HTMLElement>('[data-test-trigger]')!;
    const detachedTrigger = fixture!.nativeElement.querySelector<HTMLElement>(
      '[data-test-detached-trigger]',
    )!;

    inTreeTrigger.click();
    fixture!.detectChanges();
    await waitForPopupFocus();

    fixture!.componentInstance.root().hide();
    fixture!.detectChanges();
    await vi.waitFor(() => expect(document.activeElement).toBe(inTreeTrigger));

    detachedTrigger.focus();
    detachedTrigger.click();
    fixture!.detectChanges();
    await waitForPopupFocus();
    expect(fixture!.componentInstance.root().triggerId()).toBe(detachedTrigger.id);

    fixture!.componentInstance.root().hide();
    fixture!.detectChanges();
    await vi.waitFor(() => expect(document.activeElement).toBe(detachedTrigger));
    expect(document.activeElement).not.toBe(inTreeTrigger);
  });

  it('falls back from a disconnected triggerId to the connected active trigger', async () => {
    await createAccessibilityFixture();
    const inTreeTrigger = fixture!.nativeElement.querySelector<HTMLElement>('[data-test-trigger]')!;
    const detachedTrigger = fixture!.nativeElement.querySelector<HTMLElement>(
      '[data-test-detached-trigger]',
    )!;
    const prior = fixture!.nativeElement.querySelector<HTMLElement>('#prior-target')!;

    inTreeTrigger.click();
    fixture!.detectChanges();
    await waitForPopupFocus();
    fixture!.componentInstance.root().hide();
    fixture!.detectChanges();
    await vi.waitFor(() => expect(document.activeElement).toBe(inTreeTrigger));

    prior.focus();
    detachedTrigger.click();
    fixture!.detectChanges();
    await waitForPopupFocus();
    fixture!.componentInstance.showDetachedTrigger.set(false);
    fixture!.detectChanges();
    expect(detachedTrigger.isConnected).toBe(false);

    fixture!.componentInstance.root().hide();
    fixture!.detectChanges();
    await vi.waitFor(() => expect(document.activeElement).toBe(inTreeTrigger));
  });

  it('falls back from disconnected triggers to connected prior focus', async () => {
    await createAccessibilityFixture();
    const inTreeTrigger = fixture!.nativeElement.querySelector<HTMLElement>('[data-test-trigger]')!;
    const prior = fixture!.nativeElement.querySelector<HTMLElement>('#prior-target')!;

    inTreeTrigger.click();
    fixture!.detectChanges();
    await waitForPopupFocus();
    fixture!.componentInstance.root().hide();
    fixture!.detectChanges();
    await vi.waitFor(() => expect(document.activeElement).toBe(inTreeTrigger));

    fixture!.componentInstance.showInTreeTrigger.set(false);
    fixture!.detectChanges();
    expect(inTreeTrigger.isConnected).toBe(false);
    prior.focus();
    fixture!.componentInstance.handle.open(undefined, 'missing-trigger');
    fixture!.detectChanges();
    await waitForPopupFocus();

    fixture!.componentInstance.root().hide();
    fixture!.detectChanges();
    await vi.waitFor(() => expect(document.activeElement).toBe(prior));
  });

  it('keeps explicit final focus ahead of trigger candidates', async () => {
    await createAccessibilityFixture();
    const inTreeTrigger = fixture!.nativeElement.querySelector<HTMLElement>('[data-test-trigger]')!;
    const detachedTrigger = fixture!.nativeElement.querySelector<HTMLElement>(
      '[data-test-detached-trigger]',
    )!;
    const finalTarget = fixture!.nativeElement.querySelector<HTMLElement>('#final-target')!;

    inTreeTrigger.click();
    fixture!.detectChanges();
    await waitForPopupFocus();
    fixture!.componentInstance.root().hide();
    fixture!.detectChanges();
    await vi.waitFor(() => expect(document.activeElement).toBe(inTreeTrigger));

    fixture!.componentInstance.finalFocus.set(finalTarget);
    detachedTrigger.click();
    fixture!.detectChanges();
    await waitForPopupFocus();
    fixture!.componentInstance.root().hide();
    fixture!.detectChanges();

    await vi.waitFor(() => expect(document.activeElement).toBe(finalTarget));
  });

  it('supports explicit initial and final focus targets', async () => {
    await createAccessibilityFixture();
    fixture!.componentInstance.initialFocus.set('#initial-target');
    fixture!.componentInstance.finalFocus.set('#final-target');
    fixture!.componentInstance.root().show();
    fixture!.detectChanges();

    const initial = await waitForElement('#initial-target');
    await vi.waitFor(() => expect(document.activeElement).toBe(initial));

    fixture!.componentInstance.root().hide();
    fixture!.detectChanges();
    await vi.waitFor(() =>
      expect(document.activeElement).toBe(fixture!.nativeElement.querySelector('#final-target')),
    );
  });

  it('resolves focus callbacks and element targets', async () => {
    await createAccessibilityFixture();
    const finalTarget = fixture!.nativeElement.querySelector<HTMLElement>('#final-target')!;
    fixture!.componentInstance.initialFocus.set(() =>
      document.querySelector<HTMLElement>('#initial-target'),
    );
    fixture!.componentInstance.finalFocus.set(finalTarget);
    fixture!.componentInstance.root().show();
    fixture!.detectChanges();

    const initial = await waitForElement('#initial-target');
    await vi.waitFor(() => expect(document.activeElement).toBe(initial));

    fixture!.componentInstance.root().hide();
    fixture!.detectChanges();
    await vi.waitFor(() => expect(document.activeElement).toBe(finalTarget));
  });

  it('honors disabled initial focus and restores connected prior focus', async () => {
    await createAccessibilityFixture();
    const prior = fixture!.nativeElement.querySelector<HTMLElement>('#prior-target')!;
    fixture!.componentInstance.modal.set('trap-focus');
    fixture!.componentInstance.initialFocus.set(false);
    prior.focus();

    fixture!.componentInstance.root().show();
    fixture!.detectChanges();
    const popup = await waitForElement('[data-test-popup]');
    await nextFrame();
    expect(document.activeElement).toBe(prior);

    popup.focus();
    fixture!.componentInstance.root().hide();
    fixture!.detectChanges();
    await vi.waitFor(() => expect(document.activeElement).toBe(prior));
  });

  it('does not move focus when final focus is disabled', async () => {
    await createAccessibilityFixture();
    fixture!.componentInstance.finalFocus.set(false);
    const trigger = fixture!.nativeElement.querySelector<HTMLElement>('[data-test-trigger]')!;
    trigger.click();
    fixture!.detectChanges();
    const popup = await waitForElement('[data-test-popup]');
    await vi.waitFor(() => expect(document.activeElement).toBe(popup));

    fixture!.componentInstance.root().hide();
    fixture!.detectChanges();
    expect(document.activeElement).toBe(popup);
    expect(document.activeElement).not.toBe(trigger);
  });

  it('preserves consumer isolation state and excludes live regions', async () => {
    await createAccessibilityFixture();
    const outside = appendOutsideElement();
    outside.setAttribute('aria-hidden', 'false');
    outside.inert = true;
    const liveContainer = document.createElement('div');
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    const liveSibling = document.createElement('button');
    liveContainer.append(liveRegion, liveSibling);
    document.body.append(liveContainer);
    ownedElements.push(liveContainer);
    const popover = document.createElement('div');
    const popoverButton = document.createElement('button');
    popover.popover = 'manual';
    popover.append(popoverButton);
    document.body.append(popover);
    popover.showPopover();
    ownedElements.push(popover);

    fixture!.componentInstance.root().show();
    fixture!.detectChanges();
    await waitForElement('[data-test-popup]');
    await vi.waitFor(() => expect(outside.style.pointerEvents).toBe('none'));
    expect(liveRegion.inert).toBe(false);
    expect(liveRegion.getAttribute('aria-hidden')).toBeNull();
    expect(liveSibling.inert).toBe(true);
    expect(liveSibling.getAttribute('aria-hidden')).toBe('true');
    expect(popover.matches(':popover-open')).toBe(true);
    expect(isEffectivelyInert(popoverButton)).toBe(false);

    fixture!.componentInstance.root().hide();
    fixture!.detectChanges();
    await vi.waitFor(() => expect(outside.style.pointerEvents).toBe('auto'));
    expect(outside.getAttribute('aria-hidden')).toBe('false');
    expect(outside.inert).toBe(true);
    expect(liveSibling.inert).toBe(false);
    expect(liveSibling.getAttribute('aria-hidden')).toBeNull();
  });

  it('updates trap, isolation, and scroll locking when modal mode changes while open', async () => {
    await createAccessibilityFixture();
    const outside = appendOutsideElement();
    fixture!.componentInstance.modal.set(false);
    fixture!.componentInstance.root().show();
    fixture!.detectChanges();
    await waitForElement('[data-test-popup]');
    expect(document.querySelectorAll('.cdk-focus-trap-anchor')).toHaveLength(0);
    expect(outside.inert).toBe(false);

    fixture!.componentInstance.modal.set(true);
    fixture!.detectChanges();
    await vi.waitFor(() => expect(outside.inert).toBe(true));
    expect(document.querySelectorAll('.cdk-focus-trap-anchor')).toHaveLength(2);
    expect(document.documentElement.classList.contains('cdk-global-scrollblock')).toBe(true);

    fixture!.componentInstance.modal.set('trap-focus');
    fixture!.detectChanges();
    await vi.waitFor(() => expect(outside.inert).toBe(false));
    expect(document.querySelectorAll('.cdk-focus-trap-anchor')).toHaveLength(2);
    expect(document.documentElement.classList.contains('cdk-global-scrollblock')).toBe(false);

    fixture!.componentInstance.modal.set(false);
    fixture!.detectChanges();
    await vi.waitFor(() =>
      expect(document.querySelectorAll('.cdk-focus-trap-anchor')).toHaveLength(0),
    );
  });

  it('suspends nested traps and keeps modal isolation until the outer drawer closes', async () => {
    await TestBed.configureTestingModule({
      imports: [NestedAccessibilityHost],
    }).compileComponents();
    overlayContainer = TestBed.inject(OverlayContainer);
    nestedFixture = TestBed.createComponent(NestedAccessibilityHost);
    nestedFixture.detectChanges();
    const outside = appendOutsideElement();

    nestedFixture.componentInstance.roots()[0].show();
    nestedFixture.detectChanges();
    const outerPopup = await waitForElement('[data-test-outer-popup]');
    await vi.waitFor(() =>
      expect(document.activeElement).toBe(outerPopup.querySelector('[data-test-outer-initial]')),
    );
    expect(outside.inert).toBe(true);

    const innerTrigger = outerPopup.querySelector<HTMLElement>('[data-test-inner-trigger]')!;
    innerTrigger.click();
    nestedFixture.detectChanges();
    const innerPopup = await waitForElement('[data-test-inner-popup]');
    await vi.waitFor(() =>
      expect(document.activeElement).toBe(innerPopup.querySelector('[data-test-inner-initial]')),
    );
    expect(focusAnchors(outerPopup).every(anchor => anchor.tabIndex === -1)).toBe(true);
    expect(focusAnchors(innerPopup).every(anchor => anchor.tabIndex === 0)).toBe(true);
    expect(isEffectivelyInert(innerTrigger)).toBe(true);
    expect(isEffectivelyInert(innerPopup)).toBe(false);

    document.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' }));
    nestedFixture.detectChanges();
    await vi.waitFor(() => expect(nestedFixture!.componentInstance.roots()[1].open()).toBe(false));
    expect(nestedFixture.componentInstance.roots()[0].open()).toBe(true);
    expect(outside.inert).toBe(true);
    expect(document.activeElement).toBe(innerTrigger);
    expect(isEffectivelyInert(innerTrigger)).toBe(false);
    expect(focusAnchors(outerPopup).every(anchor => anchor.tabIndex === 0)).toBe(true);

    nestedFixture.componentInstance.roots()[0].hide();
    nestedFixture.detectChanges();
    await vi.waitFor(() => expect(outside.inert).toBe(false));
  });

  it('restores modal state and removes focus infrastructure when destroyed while open', async () => {
    await createAccessibilityFixture();
    const outside = appendOutsideElement();
    fixture!.componentInstance.root().show();
    fixture!.detectChanges();
    await waitForElement('[data-test-popup]');
    await vi.waitFor(() => expect(outside.inert).toBe(true));

    fixture!.destroy();
    fixture = undefined;

    expect(outside.inert).toBe(false);
    expect(outside.getAttribute('aria-hidden')).toBeNull();
    expect(outside.style.pointerEvents).toBe('auto');
    expect(document.querySelectorAll('.cdk-focus-trap-anchor')).toHaveLength(0);
    expect(document.querySelector('[data-ngp-drawer-overlay-host]')).toBeNull();
    expect(document.documentElement.classList.contains('cdk-global-scrollblock')).toBe(false);
  });

  async function createAccessibilityFixture(): Promise<void> {
    await TestBed.configureTestingModule({ imports: [AccessibilityHost] }).compileComponents();
    overlayContainer = TestBed.inject(OverlayContainer);
    fixture = TestBed.createComponent(AccessibilityHost);
    fixture.detectChanges();
  }

  function appendOutsideElement(): HTMLElement {
    const element = document.createElement('button');
    element.type = 'button';
    element.style.height = '2000px';
    element.style.pointerEvents = 'auto';
    document.body.append(element);
    ownedElements.push(element);
    return element;
  }
});

async function waitForElement(selector: string): Promise<HTMLElement> {
  await vi.waitFor(() => expect(document.querySelector(selector)).not.toBeNull());
  return document.querySelector<HTMLElement>(selector)!;
}

async function waitForPopupFocus(): Promise<void> {
  const popup = await waitForElement('[data-test-popup]');
  await vi.waitFor(() => expect(document.activeElement).toBe(popup));
}

function focusAnchors(popup: HTMLElement): HTMLAnchorElement[] {
  return Array.from(
    popup.parentElement?.querySelectorAll<HTMLAnchorElement>('.cdk-focus-trap-anchor') ?? [],
  );
}

function isEffectivelyInert(element: HTMLElement): boolean {
  let current: HTMLElement | null = element;
  while (current) {
    if (current.inert) {
      return true;
    }
    const root = current.getRootNode();
    current = current.parentElement ?? (root instanceof ShadowRoot ? root.host : null);
  }
  return false;
}

function nextFrame(): Promise<void> {
  return new Promise(resolve => requestAnimationFrame(() => resolve()));
}
