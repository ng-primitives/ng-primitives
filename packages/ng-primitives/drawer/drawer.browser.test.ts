import { OverlayModule } from '@angular/cdk/overlay';
import { Component, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgpDrawerBackdrop } from './backdrop/drawer-backdrop';
import { NgpDrawer } from './drawer/drawer';
import { NgpDrawerPopup } from './popup/drawer-popup';
import { NgpDrawerPortal } from './portal/drawer-portal';
import { NgpDrawerViewport } from './viewport/drawer-viewport';

@Component({
  imports: [
    OverlayModule,
    NgpDrawerBackdrop,
    NgpDrawerPopup,
    NgpDrawerPortal,
    NgpDrawer,
    NgpDrawerViewport,
  ],
  template: `
    <ng-container ngpDrawer>
      <ng-template ngpDrawerPortal>
        <div class="animated-backdrop" data-test-animated-backdrop ngpDrawerBackdrop></div>
        <div class="animated-viewport" data-test-animated-viewport ngpDrawerViewport>
          <div class="viewport-motion"></div>
          <section class="animated-popup" data-test-animated-popup ngpDrawerPopup></section>
        </div>
      </ng-template>
    </ng-container>
  `,
  styles: `
    .animated-backdrop {
      opacity: 1;
      transition: opacity 120ms linear;
    }
    .animated-backdrop[data-starting-style],
    .animated-backdrop[data-ending-style] {
      opacity: 0;
      transition-duration: calc(var(--ngp-drawer-swipe-strength) * 120ms);
    }
    .viewport-motion {
      transform: translateY(0);
      transition: transform 120ms linear;
    }
    .animated-viewport[data-starting-style] .viewport-motion,
    .animated-viewport[data-ending-style] .viewport-motion {
      transform: translateY(100px);
      transition-duration: calc(var(--ngp-drawer-swipe-strength) * 120ms);
    }
    .animated-popup {
      --bleed: 48px;
      width: 320px;
      transform: translateX(var(--ngp-drawer-swipe-movement-x));
      transition: transform 120ms linear;
    }
    .animated-popup[data-starting-style],
    .animated-popup[data-ending-style] {
      transform: translateX(calc(100% - var(--bleed) + 2px));
      transition-duration: calc(var(--ngp-drawer-swipe-strength) * 120ms);
    }
  `,
})
class RootBrowserHost {
  readonly root = viewChild.required(NgpDrawer);
}

@Component({
  imports: [OverlayModule, NgpDrawerPopup, NgpDrawerPortal, NgpDrawer, NgpDrawerViewport],
  template: `
    <ng-container ngpDrawer>
      <ng-template ngpDrawerPortal>
        <div ngpDrawerViewport>
          <section class="owned-animation-popup" data-test-owned-animation-popup ngpDrawerPopup>
            <span class="decorative-loop" data-test-decorative-loop></span>
          </section>
        </div>
      </ng-template>
    </ng-container>
  `,
  styles: `
    @keyframes direct-loop {
      from {
        outline-offset: 0;
      }
      to {
        outline-offset: 1px;
      }
    }
    @keyframes descendant-loop {
      from {
        rotate: 0deg;
      }
      to {
        rotate: 360deg;
      }
    }
    .owned-animation-popup {
      animation: direct-loop 1s linear infinite;
      opacity: 1;
      transition: opacity 240ms linear;
    }
    .owned-animation-popup[data-starting-style],
    .owned-animation-popup[data-ending-style] {
      opacity: 0;
    }
    .decorative-loop {
      animation: descendant-loop 1s linear infinite;
      display: block;
      height: 1px;
      width: 1px;
    }
  `,
})
class OwnedAnimationHost {
  readonly root = viewChild.required(NgpDrawer);
}

describe('Drawer transition lifecycle', () => {
  let fixture: ComponentFixture<RootBrowserHost>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [RootBrowserHost] }).compileComponents();
    fixture = TestBed.createComponent(RootBrowserHost);
    fixture.detectChanges();
  });

  afterEach(() => fixture.destroy());

  it('completes after consumer animations instead of the request microtask', async () => {
    const completed: boolean[] = [];
    fixture.componentInstance.root().openChangeComplete.subscribe(value => completed.push(value));

    fixture.componentInstance.root().show();
    fixture.detectChanges();
    await Promise.resolve();
    expect(completed).toEqual([]);

    await vi.waitFor(() => expect(completed).toEqual([true]));
    fixture.componentInstance.root().hide();
    fixture.detectChanges();
    await vi.waitFor(() => expect(completed).toEqual([true, false]));
  });

  it('mounts with the starting style before beginning the enter transition', async () => {
    fixture.componentInstance.root().show();
    fixture.detectChanges();

    const parts = await vi.waitFor(() => {
      const elements = [
        document.querySelector<HTMLElement>('[data-test-animated-backdrop]'),
        document.querySelector<HTMLElement>('[data-test-animated-viewport]'),
        document.querySelector<HTMLElement>('[data-test-animated-popup]'),
      ];
      expect(elements.every(element => element !== null)).toBe(true);
      return elements as HTMLElement[];
    });
    const popup = parts[2];
    expect(parts.every(part => part.hasAttribute('data-starting-style'))).toBe(true);
    expect(getComputedStyle(popup).transform).not.toBe('none');
    expect(parts.flatMap(part => part.getAnimations({ subtree: true }))).toHaveLength(0);

    await animationFrame();
    await vi.waitFor(() =>
      expect(parts.every(part => !part.hasAttribute('data-starting-style'))).toBe(true),
    );
    const animations = parts.flatMap(part => part.getAnimations({ subtree: true }));
    expect(animations.length).toBeGreaterThanOrEqual(3);
    expect(animations.every(animation => animation.playState !== 'finished')).toBe(true);
  });

  it('initializes neutral visual properties on every animated part', async () => {
    fixture.componentInstance.root().show();
    fixture.detectChanges();

    const parts = await vi.waitFor(() => {
      const elements = [
        document.querySelector<HTMLElement>('[data-test-animated-backdrop]'),
        document.querySelector<HTMLElement>('[data-test-animated-viewport]'),
        document.querySelector<HTMLElement>('[data-test-animated-popup]'),
      ];
      expect(elements.every(element => element !== null)).toBe(true);
      return elements as HTMLElement[];
    });

    for (const part of parts) {
      expect(part.style.getPropertyValue('--ngp-drawer-swipe-movement-x')).toBe('0px');
      expect(part.style.getPropertyValue('--ngp-drawer-swipe-movement-y')).toBe('0px');
      expect(part.style.getPropertyValue('--ngp-drawer-swipe-progress')).toBe('0');
      expect(part.style.getPropertyValue('--ngp-drawer-swipe-strength')).toBe('1');
    }
  });

  it('keeps every part mounted while the exit transition runs', async () => {
    fixture.componentInstance.root().show();
    fixture.detectChanges();
    await vi.waitFor(() =>
      expect(document.querySelector('[data-test-animated-popup]')).not.toBeNull(),
    );
    await vi.waitFor(() => expect(fixture.componentInstance.root().open()).toBe(true));

    const parts = [
      document.querySelector<HTMLElement>('[data-test-animated-backdrop]')!,
      document.querySelector<HTMLElement>('[data-test-animated-viewport]')!,
      document.querySelector<HTMLElement>('[data-test-animated-popup]')!,
    ];
    await animationFrame();
    await vi.waitFor(() =>
      expect(parts.every(part => !part.hasAttribute('data-starting-style'))).toBe(true),
    );
    const enterAnimations = [
      ...new Set(parts.flatMap(part => part.getAnimations({ subtree: true }))),
    ];
    expect(enterAnimations.length).toBeGreaterThanOrEqual(3);
    await Promise.all(enterAnimations.map(animation => animation.finished));

    fixture.componentInstance.root().hide();
    fixture.detectChanges();
    await animationFrame();

    expect(parts.every(part => part.hasAttribute('data-ending-style'))).toBe(true);
    expect(parts.every(part => document.contains(part))).toBe(true);
    const animations = [...new Set(parts.flatMap(part => part.getAnimations({ subtree: true })))];
    expect(animations.length).toBeGreaterThanOrEqual(3);
    expect(animations.every(animation => animation.playState === 'running')).toBe(true);

    await Promise.all(animations.map(animation => animation.finished));
    await vi.waitFor(() => expect(document.querySelector('[data-test-animated-popup]')).toBeNull());
  });
});

describe('Drawer transition ownership', () => {
  let fixture: ComponentFixture<OwnedAnimationHost>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [OwnedAnimationHost] }).compileComponents();
    fixture = TestBed.createComponent(OwnedAnimationHost);
    fixture.detectChanges();
  });

  afterEach(() => fixture.destroy());

  it('waits for finite part motion without waiting for infinite decorative loops', async () => {
    const completed: boolean[] = [];
    fixture.componentInstance.root().openChangeComplete.subscribe(value => completed.push(value));

    fixture.componentInstance.root().show();
    fixture.detectChanges();
    const popup = await vi.waitFor(() => {
      const element = document.querySelector<HTMLElement>('[data-test-owned-animation-popup]');
      expect(element).not.toBeNull();
      return element!;
    });
    const decoration = popup.querySelector<HTMLElement>('[data-test-decorative-loop]')!;
    const enterTransition = await waitForFiniteAnimation(popup);
    const popupLoop = findInfiniteAnimation(popup);
    const descendantLoop = findInfiniteAnimation(decoration);

    expect(completed).toEqual([]);
    expect(popupLoop).toBeDefined();
    expect(descendantLoop).toBeDefined();
    await enterTransition.finished;
    await vi.waitFor(() => expect(completed).toEqual([true]));
    expect(popupLoop!.playState).toBe('running');
    expect(descendantLoop!.playState).toBe('running');

    fixture.componentInstance.root().hide();
    fixture.detectChanges();
    const exitTransition = await waitForFiniteAnimation(popup);
    expect(completed).toEqual([true]);
    await exitTransition.finished;
    await vi.waitFor(() => expect(completed).toEqual([true, false]));
    expect(document.querySelector('[data-test-owned-animation-popup]')).toBeNull();
  });
});

async function waitForFiniteAnimation(element: HTMLElement): Promise<Animation> {
  return vi.waitFor(() => {
    const animation = element.getAnimations().find(candidate => {
      const endTime = candidate.effect?.getComputedTiming().endTime;
      return (
        typeof endTime === 'number' &&
        Number.isFinite(endTime) &&
        candidate.playState !== 'finished'
      );
    });
    expect(animation).toBeDefined();
    return animation!;
  });
}

function findInfiniteAnimation(element: HTMLElement): Animation | undefined {
  return element
    .getAnimations()
    .find(animation => animation.effect?.getComputedTiming().endTime === Infinity);
}

function animationFrame(): Promise<void> {
  return new Promise(resolve => requestAnimationFrame(() => resolve()));
}
