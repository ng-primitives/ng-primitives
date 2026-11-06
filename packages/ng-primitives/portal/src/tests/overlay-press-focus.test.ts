import {
  Component,
  ElementRef,
  inject,
  Injector,
  TemplateRef,
  viewChild,
  ViewContainerRef,
} from '@angular/core';
import { render, screen, waitFor } from '@testing-library/angular';
import { afterEach, describe, expect, it } from 'vitest';
import { createOverlay, NgpOverlay } from '../overlay';

@Component({
  template: `
    <button data-testid="elsewhere">Elsewhere</button>
    <div #trigger data-testid="area">
      Area
      <button data-testid="inner">Inner</button>
    </div>

    <ng-template #content>
      <div data-testid="content">Content</div>
    </ng-template>
  `,
})
class OverlayHost {
  readonly trigger = viewChild.required<ElementRef<HTMLElement>>('trigger');
  readonly content = viewChild.required<TemplateRef<unknown>>('content');

  private readonly injector = inject(Injector);
  private readonly viewContainerRef = inject(ViewContainerRef);

  create(showDelay = 0): NgpOverlay<unknown> {
    return createOverlay<unknown>({
      content: this.content,
      triggerElement: this.trigger().nativeElement,
      injector: this.injector,
      viewContainerRef: this.viewContainerRef,
      showDelay,
      restoreFocus: true,
    });
  }
}

const byId = (id: string) => screen.getByTestId(id);

async function closeFromNowhere(overlay: NgpOverlay<unknown>): Promise<void> {
  (document.activeElement as HTMLElement | null)?.blur();
  overlay.hide({ origin: 'mouse' });
  await waitFor(() => expect(screen.queryByTestId('content')).toBeNull());
}

describe('NgpOverlay focus return after a press', () => {
  afterEach(() => {
    document.querySelectorAll('[data-testid="content"]').forEach(element => element.remove());
  });

  it('returns focus to the control inside the trigger that the press landed on', async () => {
    const { fixture } = await render(OverlayHost);
    const overlay = fixture.componentInstance.create();
    byId('elsewhere').focus();

    await overlay.show({ pressTarget: byId('inner') });
    await closeFromNowhere(overlay);

    expect(document.activeElement).toBe(byId('inner'));
  });

  it('keeps the press of an open that a later show joins', async () => {
    const { fixture } = await render(OverlayHost);
    const overlay = fixture.componentInstance.create(50);
    byId('elsewhere').focus();

    const pressed = overlay.show({ pressTarget: byId('inner') });
    const joined = overlay.show();
    await Promise.all([pressed, joined]);
    await closeFromNowhere(overlay);

    expect(document.activeElement).toBe(byId('inner'));
  });

  it('takes the press of a show that joins a scheduled open', async () => {
    const { fixture } = await render(OverlayHost);
    const overlay = fixture.componentInstance.create(50);
    byId('elsewhere').focus();

    const scheduled = overlay.show();
    const pressed = overlay.show({ pressTarget: byId('inner') });
    await Promise.all([scheduled, pressed]);
    await closeFromNowhere(overlay);

    expect(document.activeElement).toBe(byId('inner'));
  });
});
