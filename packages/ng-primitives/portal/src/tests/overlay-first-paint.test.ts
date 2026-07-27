import { Component } from '@angular/core';
import { render } from '@testing-library/angular';
import { NgpMenu, NgpMenuTrigger } from 'ng-primitives/menu';

interface FirstPaint {
  /** The document's scrollable height at the moment the panel entered the DOM. */
  scrollHeightAtInsertion: number;
  /** Whether the panel was still transparent when it entered the DOM. */
  hiddenAtInsertion: boolean;
  /** The panel's inline styles on the first frame the browser could paint it. */
  opacity: string;
  left: string;
  top: string;
}

/** Component styles do not reach a portalled panel, so the panel is styled globally. */
const panelStyles = `
  [ngpMenu] {
    position: absolute;
    width: 200px;
  }
  [ngpMenu] > div {
    height: 30px;
  }
`;

@Component({
  imports: [NgpMenu, NgpMenuTrigger],
  template: `
    <div class="spacer"></div>
    <button [ngpMenuTrigger]="menu" ngpMenuTriggerScrollBehavior="reposition" data-testid="trigger">
      Open
    </button>

    <ng-template #menu>
      <div ngpMenu data-testid="panel">
        @for (item of items; track item) {
          <div>{{ item }}</div>
        }
      </div>
    </ng-template>
  `,
  styles: `
    .spacer {
      height: 1500px;
    }
  `,
})
class Host {
  readonly items = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
}

/**
 * The panel's `left`/`top` are bound with `styleBinding`, which runs in `afterRenderEffect`
 * and is not flushed by the portal's synchronous `detectChanges()`. Before the overlay hid
 * the panel until positioned, that left it painted at its static position - the end of the
 * container's flow - for a frame, growing the document's scrollable area by its height.
 */
describe('overlay first paint', () => {
  let styleElement: HTMLStyleElement;

  beforeEach(() => {
    styleElement = document.createElement('style');
    styleElement.textContent = panelStyles;
    document.head.appendChild(styleElement);
  });

  afterEach(() => styleElement.remove());

  /** Open the menu and capture the panel's state on the first frame it could be painted. */
  function openAndCaptureFirstPaint(trigger: HTMLElement): Promise<FirstPaint> {
    return new Promise<FirstPaint>(resolve => {
      const observer = new MutationObserver(records => {
        for (const record of records) {
          for (const node of Array.from(record.addedNodes)) {
            if (!(node instanceof HTMLElement) || !node.matches('[data-testid="panel"]')) {
              continue;
            }

            observer.disconnect();
            const scrollHeightAtInsertion = document.documentElement.scrollHeight;
            const hiddenAtInsertion = getComputedStyle(node).opacity === '0';

            requestAnimationFrame(() =>
              resolve({
                scrollHeightAtInsertion,
                hiddenAtInsertion,
                opacity: node.style.opacity,
                left: node.style.left,
                top: node.style.top,
              }),
            );
          }
        }
      });

      observer.observe(document.body, { childList: true, subtree: true });
      trigger.click();
    });
  }

  it('should not grow the document while the panel waits to be positioned', async () => {
    const { getByTestId } = await render(Host);
    const scrollHeightBeforeOpen = document.documentElement.scrollHeight;

    const firstPaint = await openAndCaptureFirstPaint(getByTestId('trigger'));

    expect(firstPaint.scrollHeightAtInsertion).toBe(scrollHeightBeforeOpen);
  });

  it('should not show the panel until it has been positioned', async () => {
    const { getByTestId } = await render(Host);

    const firstPaint = await openAndCaptureFirstPaint(getByTestId('trigger'));

    expect(firstPaint.hiddenAtInsertion).toBe(true);
    // Revealed within the attaching task's microtasks, so the first frame is already correct.
    expect(firstPaint.opacity).toBe('');
    expect(firstPaint.left).not.toBe('');
    expect(firstPaint.top).not.toBe('');
    expect(firstPaint.top).not.toBe('0px');
  });
});
