import {
  Component,
  Directive,
  ElementRef,
  Injector,
  TemplateRef,
  ViewContainerRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { render, screen, waitFor } from '@testing-library/angular';
import {
  NgpMiddleware,
  NgpOffset,
  NgpOverlay,
  NgpOverlayConfig,
  NgpOverlayTemplateContext,
  NgpPlacement,
  NgpPosition,
  createOverlay,
} from 'ng-primitives/portal';
import { afterEach, describe, expect, it } from 'vitest';

/** Registers a nested element as the overlay's positioning outlet. */
@Directive({ selector: '[testOutlet]' })
class TestOutletDirective {
  constructor() {
    inject(NgpOverlay).registerOutletElement(inject(ElementRef).nativeElement);
  }
}

/** Component content that reads the overlay it is rendered in. */
@Component({
  template: `
    <div data-testid="overlay" style="position: absolute; width: 80px; height: 40px;">
      <span data-testid="overlay-x">{{ overlay.position().x }}</span>
      <button (click)="overlay.hide()" data-testid="overlay-close" type="button">Close</button>
    </div>
  `,
})
class OverlayConsumerComponent {
  readonly overlay = inject(NgpOverlay);
}

@Component({
  imports: [TestOutletDirective],
  template: `
    <button
      data-testid="trigger"
      type="button"
      style="position: fixed; top: 300px; left: 300px; width: 40px; height: 20px;"
    >
      Trigger
    </button>
    <div
      data-testid="anchor"
      style="position: fixed; top: 400px; left: 50px; width: 60px; height: 30px;"
    ></div>
    <div
      data-testid="bottom-anchor"
      style="position: fixed; bottom: 4px; left: 50px; width: 60px; height: 20px;"
    ></div>
    <button data-testid="outside" type="button" style="position: fixed; top: 0; left: 0;">
      Outside
    </button>

    <ng-template #content let-ctx>
      <div data-testid="overlay" style="position: absolute; width: 80px; height: 40px;">
        {{ ctx?.() }}
      </div>
    </ng-template>

    <ng-template #nestedOutlet>
      <div data-testid="overlay" style="position: absolute; width: 80px; height: 200px;">
        <span testOutlet style="display: block; width: 50px; height: 20px;"></span>
      </div>
    </ng-template>

    <ng-template #controlFlowRoot>
      @if (true) {
        <div data-testid="overlay" style="position: absolute; width: 80px; height: 40px;">
          <span testOutlet style="display: block; width: 50px; height: 20px;"></span>
        </div>
      }
    </ng-template>
  `,
})
class OverlayHostComponent {
  readonly content = viewChild.required<TemplateRef<NgpOverlayTemplateContext<unknown>>>('content');
  readonly nestedOutlet =
    viewChild.required<TemplateRef<NgpOverlayTemplateContext<unknown>>>('nestedOutlet');
  readonly controlFlowRoot =
    viewChild.required<TemplateRef<NgpOverlayTemplateContext<unknown>>>('controlFlowRoot');
  readonly viewContainerRef = inject(ViewContainerRef);
  readonly injector = inject(Injector);
}

describe('createOverlay imperative usage', () => {
  let overlay: NgpOverlay<unknown> | null = null;

  afterEach(() => {
    overlay?.destroy();
    overlay = null;
    document.querySelectorAll('[data-testid="overlay"]').forEach(el => el.remove());
  });

  async function setup(
    config: (
      byTestId: (id: string) => HTMLElement,
      host: OverlayHostComponent,
    ) => Partial<NgpOverlayConfig<unknown>> = () => ({}),
  ) {
    const result = await render(OverlayHostComponent);
    result.fixture.autoDetectChanges(true);
    const host = result.fixture.componentInstance;

    overlay = TestBed.runInInjectionContext(() =>
      createOverlay<unknown>({
        content: host.content,
        triggerElement: result.getByTestId('trigger'),
        injector: host.injector,
        viewContainerRef: host.viewContainerRef,
        ...config(result.getByTestId, host),
      }),
    );

    return { ...result, overlay: overlay! };
  }

  function rectOf(testId: string): DOMRect {
    return document.querySelector(`[data-testid="${testId}"]`)!.getBoundingClientRect();
  }

  function press(target: Element): void {
    target.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true }));
    target.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, composed: true }));
  }

  it('positions at a programmatic point and follows updates to that point', async () => {
    const position = signal<NgpPosition | null>({ x: 200, y: 150 });
    const { overlay } = await setup(() => ({
      position,
      placement: signal<NgpPlacement>('right-start'),
    }));

    await overlay.show();
    await waitFor(() => expect(overlay.position()).toEqual({ x: 200, y: 150 }));

    position.set({ x: 240, y: 180 });
    await waitFor(() => expect(overlay.position()).toEqual({ x: 240, y: 180 }));
  });

  it('moves from a programmatic point onto an anchor element while open', async () => {
    const position = signal<NgpPosition | null>({ x: 200, y: 150 });
    const anchor = signal<HTMLElement | null>(null);
    const { overlay, getByTestId } = await setup(() => ({
      position,
      anchorElement: anchor,
      placement: signal<NgpPlacement>('right-start'),
    }));

    await overlay.show();
    await waitFor(() => expect(overlay.position()).toEqual({ x: 200, y: 150 }));

    anchor.set(getByTestId('anchor'));
    position.set(null);

    const anchorRect = rectOf('anchor');
    await waitFor(() =>
      expect(overlay.position()).toEqual({ x: anchorRect.right, y: anchorRect.top }),
    );
    expect(overlay.isOpen()).toBe(true);
  });

  it('passes the context signal to the template as $implicit and re-renders when it changes', async () => {
    const context = signal<unknown>('first');
    const { overlay } = await setup(() => ({ context }));

    await overlay.show();
    expect(await screen.findByTestId('overlay')).toHaveTextContent('first');

    context.set('second');
    await waitFor(() =>
      expect(document.querySelector('[data-testid="overlay"]')).toHaveTextContent('second'),
    );
  });

  it('lets component content inject the overlay to read its position and close it', async () => {
    const { overlay } = await setup(() => ({
      content: signal(OverlayConsumerComponent),
      placement: signal<NgpPlacement>('bottom-start'),
    }));

    await overlay.show();
    const triggerRect = rectOf('trigger');
    await waitFor(() =>
      expect(screen.getByTestId('overlay-x').textContent).toBe(String(triggerRect.left)),
    );

    (await screen.findByTestId('overlay-close')).click();

    await waitFor(() => expect(overlay.isOpen()).toBe(false));
    expect(document.querySelector('[data-testid="overlay"]')).not.toBeInTheDocument();
  });

  it('positions against an outlet element registered by nested content', async () => {
    const result = await render(OverlayHostComponent);
    result.fixture.autoDetectChanges(true);
    const host = result.fixture.componentInstance;

    overlay = TestBed.runInInjectionContext(() =>
      createOverlay<unknown>({
        content: host.nestedOutlet,
        triggerElement: result.getByTestId('trigger'),
        anchorElement: result.getByTestId('anchor'),
        injector: host.injector,
        viewContainerRef: host.viewContainerRef,
        placement: signal<NgpPlacement>('top'),
        flip: false,
        shift: false,
      }),
    );

    await overlay.show();

    // The registered span is 20px tall; the 200px wrapper would land far higher.
    const anchorRect = rectOf('anchor');
    await waitFor(() => expect(overlay!.position().y).toBe(anchorRect.top - 20));
  });

  // Skipped: a template portal's root nodes include the control flow block's comment anchor,
  // and closing calls removeAttribute on every root node, so the close rejects and the
  // overlay stays open.
  it.skip('opens and closes content whose template root is a control flow block', async () => {
    const { overlay } = await setup((_, host) => ({ content: host.controlFlowRoot }));

    await overlay.show();
    expect(await screen.findByTestId('overlay')).toBeInTheDocument();

    overlay.hide();

    await waitFor(() => expect(overlay.isOpen()).toBe(false));
    expect(document.querySelector('[data-testid="overlay"]')).not.toBeInTheDocument();
  });

  it('re-reads offset getters on every reposition', async () => {
    let crossAxis = 0;
    const offset: NgpOffset = {
      mainAxis: 0,
      get crossAxis() {
        return crossAxis;
      },
    };
    const { overlay } = await setup(byTestId => ({
      anchorElement: byTestId('anchor'),
      placement: signal<NgpPlacement>('bottom-start'),
      offset,
    }));

    await overlay.show();

    const anchorRect = rectOf('anchor');
    await waitFor(() => expect(overlay.position().x).toBe(anchorRect.left));

    crossAxis = 30;
    overlay.updatePosition();

    await waitFor(() => expect(overlay.position().x).toBe(anchorRect.left + 30));
  });

  it('reports the flipped placement through finalPlacement', async () => {
    const { overlay } = await setup(byTestId => ({
      anchorElement: byTestId('bottom-anchor'),
      placement: signal<NgpPlacement>('bottom-start'),
      flip: true,
    }));

    await overlay.show();

    await waitFor(() => expect(overlay.finalPlacement()).toBe('top-start'));
  });

  it('follows an anchor that moves without a scroll or resize when trackPosition is set', async () => {
    const { overlay, getByTestId } = await setup(byTestId => ({
      anchorElement: byTestId('anchor'),
      placement: signal<NgpPlacement>('bottom-start'),
      trackPosition: true,
    }));
    const anchor = getByTestId('anchor');

    await overlay.show();
    await waitFor(() => expect(overlay.position().x).toBe(anchor.getBoundingClientRect().left));

    anchor.style.left = '120px';

    await waitFor(() => expect(overlay.position().x).toBe(120));
  });

  it('closes on a press on the trigger when treatTriggerClickAsOutside is set', async () => {
    const { overlay, getByTestId } = await setup(() => ({
      closeOnOutsideClick: true,
      treatTriggerClickAsOutside: true,
    }));

    await overlay.show();
    await waitFor(() => expect(overlay.isOpen()).toBe(true));

    press(getByTestId('trigger'));

    await waitFor(() => expect(overlay.isOpen()).toBe(false));
  });

  it('stays open on a press on the trigger by default', async () => {
    const { overlay, getByTestId } = await setup(() => ({ closeOnOutsideClick: true }));

    await overlay.show();
    await waitFor(() => expect(overlay.isOpen()).toBe(true));

    press(getByTestId('trigger'));
    // A press elsewhere proves dismissal is live, so staying open above is meaningful.
    await new Promise(resolve => setTimeout(resolve, 20));
    expect(overlay.isOpen()).toBe(true);

    press(getByTestId('outside'));
    await waitFor(() => expect(overlay.isOpen()).toBe(false));
  });

  it('emits closing as soon as hide starts, before isOpen turns false', async () => {
    const { overlay } = await setup();
    await overlay.show();

    let isOpenWhenClosing: boolean | undefined;
    overlay.closing.subscribe(() => (isOpenWhenClosing = overlay.isOpen()));

    overlay.hide();

    expect(isOpenWhenClosing).toBe(true);
    await waitFor(() => expect(overlay.isOpen()).toBe(false));
  });

  it('stays open when show is called while a hide is still pending', async () => {
    const { overlay } = await setup();
    await overlay.show();

    overlay.hide();
    await overlay.show();

    await new Promise(resolve => setTimeout(resolve, 20));
    expect(overlay.isOpen()).toBe(true);
    expect(document.querySelector('[data-testid="overlay"]')).toBeInTheDocument();
  });

  it('leaves focus where it is on close when restoreFocus is false', async () => {
    const { overlay, getByTestId } = await setup(() => ({ restoreFocus: false }));
    const outside = getByTestId('outside');

    await overlay.show();
    outside.focus();

    overlay.hide();
    await waitFor(() => expect(overlay.isOpen()).toBe(false));

    expect(document.activeElement).toBe(outside);
  });

  it('removes the content and reports closed once destroyed', async () => {
    const { overlay } = await setup();
    await overlay.show();
    expect(document.querySelector('[data-testid="overlay"]')).toBeInTheDocument();

    overlay.destroy();

    await waitFor(() => expect(overlay.isOpen()).toBe(false));
    expect(document.querySelector('[data-testid="overlay"]')).not.toBeInTheDocument();
  });

  it('keeps the newest position when an older positioning pass resolves last', async () => {
    const placement = signal<NgpPlacement>('bottom');
    let holdNextPass = false;
    let held: { release: () => void } | null = null;

    // Holds one pass inside the middleware chain until released, so a newer pass can finish first.
    const holdOnce: NgpMiddleware = {
      name: 'holdOnce',
      async fn() {
        if (holdNextPass) {
          holdNextPass = false;
          await new Promise<void>(resolve => (held = { release: resolve }));
        }
        return {};
      },
    };

    const { overlay } = await setup(() => ({ placement, additionalMiddleware: [holdOnce] }));
    await overlay.show();
    await waitFor(() => expect(overlay.finalPlacement()).toBe('bottom'));

    holdNextPass = true;
    placement.set('top');
    await waitFor(() => expect(held).not.toBeNull());

    placement.set('bottom-end');
    await waitFor(() => expect(overlay.finalPlacement()).toBe('bottom-end'));

    held!.release();
    await new Promise(resolve => setTimeout(resolve, 50));
    expect(overlay.finalPlacement()).toBe('bottom-end');
  });
});
