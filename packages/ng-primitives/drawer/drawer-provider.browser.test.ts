import { OverlayContainer, OverlayModule } from '@angular/cdk/overlay';
import { Component, viewChild, viewChildren } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgpDrawerIndentBackground } from './indent-background/drawer-indent-background';
import { NgpDrawerIndent } from './indent/drawer-indent';
import { NgpDrawerPopup } from './popup/drawer-popup';
import { NgpDrawerPortal } from './portal/drawer-portal';
import { NgpDrawerProvider } from './provider/drawer-provider';
import { NgpDrawer } from './drawer/drawer';
import { NgpDrawerViewport } from './viewport/drawer-viewport';

@Component({
  imports: [
    OverlayModule,
    NgpDrawerIndentBackground,
    NgpDrawerIndent,
    NgpDrawerPopup,
    NgpDrawerPortal,
    NgpDrawerProvider,
    NgpDrawer,
    NgpDrawerViewport,
  ],
  template: `
    <ng-container ngpDrawerProvider>
      <div
        data-test-indent-background
        ngpDrawerIndentBackground
        style="--ngp-drawer-height: 9px; --ngp-drawer-swipe-progress: 0.2"
      ></div>
      <main
        data-test-indent
        ngpDrawerIndent
        style="--ngp-drawer-height: 8px; --ngp-drawer-swipe-progress: 0.1"
      ></main>

      <ng-container [modal]="false" ngpDrawer>
        <ng-template ngpDrawerPortal>
          <div data-test-provider-viewport-1 ngpDrawerViewport>
            <section data-test-provider-popup-1 ngpDrawerPopup style="height: 200px"></section>
          </div>
        </ng-template>
      </ng-container>

      <ng-container [modal]="false" ngpDrawer>
        <ng-template ngpDrawerPortal>
          <div data-test-provider-viewport-2 ngpDrawerViewport>
            <section data-test-provider-popup-2 ngpDrawerPopup style="height: 300px"></section>
          </div>
        </ng-template>
      </ng-container>

      <div data-test-regular-dialog role="dialog"></div>
    </ng-container>
  `,
})
class ProviderHost {
  readonly provider = viewChild.required(NgpDrawerProvider);
  readonly roots = viewChildren(NgpDrawer);
}

describe('Drawer Provider and Indent parts', () => {
  let fixture: ComponentFixture<ProviderHost>;
  let overlayContainer: OverlayContainer;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ProviderHost] }).compileComponents();
    overlayContainer = TestBed.inject(OverlayContainer);
    fixture = TestBed.createComponent(ProviderHost);
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    overlayContainer.ngOnDestroy();
  });

  it('reports any-open/count and excludes a regular dialog', () => {
    expect(fixture.componentInstance.provider().anyOpen()).toBe(false);
    expect(fixture.componentInstance.provider().openCount()).toBe(0);
    expect(document.querySelector('[data-test-regular-dialog]')).not.toBeNull();
    fixture.componentInstance.roots()[0].show();
    fixture.detectChanges();
    expect(fixture.componentInstance.provider().anyOpen()).toBe(true);
    expect(fixture.componentInstance.provider().openCount()).toBe(1);
  });

  it('publishes active state and frontmost geometry on both Indent parts', async () => {
    const [first, second] = fixture.componentInstance.roots();
    first.show();
    fixture.detectChanges();
    await waitForPopup('[data-test-provider-popup-1]');
    const indent = getElement('[data-test-indent]');
    const background = getElement('[data-test-indent-background]');
    for (const element of [indent, background]) {
      expect(element.hasAttribute('data-active')).toBe(true);
      expect(element.hasAttribute('data-inactive')).toBe(false);
      expect(element.style.getPropertyValue('--ngp-drawer-nested-drawers')).toBe('1');
      expect(element.style.getPropertyValue('--ngp-drawer-height')).toBe('200px');
      expect(element.style.getPropertyValue('--ngp-drawer-frontmost-height')).toBe('200px');
    }

    second.show();
    fixture.detectChanges();
    await waitForPopup('[data-test-provider-popup-2]');
    for (const element of [indent, background]) {
      expect(element.style.getPropertyValue('--ngp-drawer-nested-drawers')).toBe('2');
      expect(element.style.getPropertyValue('--ngp-drawer-height')).toBe('300px');
      expect(element.style.getPropertyValue('--ngp-drawer-frontmost-height')).toBe('300px');
    }
  });

  it('propagates frontmost swipe progress imperatively to both parts', async () => {
    const second = fixture.componentInstance.roots()[1];
    second.show();
    fixture.detectChanges();
    await waitForPopup('[data-test-provider-popup-2]');
    const viewport = getElement('[data-test-provider-viewport-2]');
    dispatchPointer(viewport, 'pointerdown', 0, 1, 1, 0);
    dispatchPointer(viewport, 'pointermove', 60, 1, 1, 200);
    await animationFrame();
    for (const element of [
      getElement('[data-test-indent]'),
      getElement('[data-test-indent-background]'),
    ]) {
      expect(Number(element.style.getPropertyValue('--ngp-drawer-swipe-progress'))).toBeCloseTo(
        0.2,
      );
    }
    viewport.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true }));
    for (const element of [
      getElement('[data-test-indent]'),
      getElement('[data-test-indent-background]'),
    ]) {
      expect(element.style.getPropertyValue('--ngp-drawer-swipe-progress')).toBe('0');
    }
  });

  it('resets inactive state and variables as drawers close', async () => {
    const [first, second] = fixture.componentInstance.roots();
    first.show();
    second.show();
    fixture.detectChanges();
    await waitForPopup('[data-test-provider-popup-2]');
    second.hide();
    fixture.detectChanges();
    const indent = getElement('[data-test-indent]');
    expect(indent.style.getPropertyValue('--ngp-drawer-nested-drawers')).toBe('1');
    expect(indent.style.getPropertyValue('--ngp-drawer-height')).toBe('200px');
    first.hide();
    fixture.detectChanges();
    for (const element of [indent, getElement('[data-test-indent-background]')]) {
      expect(element.hasAttribute('data-active')).toBe(false);
      expect(element.hasAttribute('data-inactive')).toBe(true);
      expect(element.style.getPropertyValue('--ngp-drawer-nested-drawers')).toBe('');
      expect(element.style.getPropertyValue('--ngp-drawer-height')).toBe('');
      expect(element.style.getPropertyValue('--ngp-drawer-frontmost-height')).toBe('');
      expect(element.style.getPropertyValue('--ngp-drawer-swipe-progress')).toBe('0');
    }
  });

  it('restores consumer inline values when the parts are destroyed', () => {
    const indent = getElement('[data-test-indent]');
    const background = getElement('[data-test-indent-background]');
    fixture.destroy();
    expect(indent.style.getPropertyValue('--ngp-drawer-height')).toBe('8px');
    expect(indent.style.getPropertyValue('--ngp-drawer-swipe-progress')).toBe('0.1');
    expect(background.style.getPropertyValue('--ngp-drawer-height')).toBe('9px');
    expect(background.style.getPropertyValue('--ngp-drawer-swipe-progress')).toBe('0.2');
  });
});

async function waitForPopup(selector: string): Promise<void> {
  await vi.waitFor(() => expect(document.querySelector(selector)).not.toBeNull());
}

function getElement(selector: string): HTMLElement {
  return document.querySelector<HTMLElement>(selector)!;
}

function dispatchPointer(
  target: EventTarget,
  type: 'pointerdown' | 'pointermove',
  y: number,
  buttons: number,
  pointerId: number,
  timeStamp: number,
): void {
  const event = new PointerEvent(type, {
    bubbles: true,
    button: 0,
    buttons,
    clientY: y,
    composed: true,
    isPrimary: true,
    pointerId,
    pointerType: 'mouse',
  });
  Object.defineProperty(event, 'timeStamp', { configurable: true, value: timeStamp });
  target.dispatchEvent(event);
}

function animationFrame(): Promise<void> {
  return new Promise(resolve => requestAnimationFrame(() => resolve()));
}
