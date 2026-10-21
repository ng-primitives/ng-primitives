import { Component } from '@angular/core';
import { fireEvent, render, waitFor } from '@testing-library/angular';
import {
  NgpMenu,
  NgpMenuItem,
  NgpMenuTrigger,
  NgpSubmenuTrigger,
  injectMenuTriggerState,
} from 'ng-primitives/menu';
import { afterEach, describe, expect, it, vi } from 'vitest';

/** Submenu content that is not an ngpMenu and reports pointer presence to its trigger itself. */
@Component({
  selector: 'custom-submenu-panel',
  template: `
    <button>Nested</button>
  `,
  host: {
    'data-testid': 'submenu',
    style: 'display: block; position: absolute',
    '(pointerenter)': 'trigger().setPointerOverContent(true)',
    '(pointerleave)': 'trigger().setPointerOverContent(false)',
  },
})
class CustomSubmenuPanelComponent {
  readonly trigger = injectMenuTriggerState();
}

@Component({
  template: `
    <button [ngpMenuTrigger]="menu" data-testid="root-trigger">Open</button>

    <ng-template #menu>
      <div ngpMenu data-testid="root-menu">
        <button [ngpSubmenuTrigger]="submenu" ngpMenuItem data-testid="submenu-trigger">
          More
        </button>
      </div>
    </ng-template>

    <ng-template #submenu>
      <custom-submenu-panel />
    </ng-template>
  `,
  imports: [NgpMenuTrigger, NgpMenu, NgpMenuItem, NgpSubmenuTrigger, CustomSubmenuPanelComponent],
})
class CustomSubmenuComponent {}

const query = (id: string) => document.querySelector<HTMLElement>(`[data-testid="${id}"]`);

describe('NgpSubmenuTrigger with custom content', () => {
  afterEach(() => vi.useRealTimers());

  it('stays open after the pointer leaves the trigger once the content reports the pointer over it', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    await render(CustomSubmenuComponent);
    fireEvent.click(query('root-trigger')!);
    await waitFor(() => expect(query('submenu-trigger')).toBeInTheDocument());

    const submenuTrigger = query('submenu-trigger')!;
    fireEvent.pointerEnter(submenuTrigger, { pointerType: 'mouse' });
    await waitFor(() => expect(query('submenu')).toBeInTheDocument());
    const submenu = query('submenu')!;

    // Without a corridor the trigger falls back to its idle close, which the content must veto.
    vi.spyOn(submenuTrigger, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 120, 30));
    vi.spyOn(submenu, 'getBoundingClientRect').mockReturnValue(new DOMRect(200, 0, 120, 90));
    fireEvent.pointerLeave(submenuTrigger, { pointerType: 'mouse', clientX: 120, clientY: 15 });
    fireEvent.pointerEnter(submenu, { pointerType: 'mouse' });
    vi.advanceTimersByTime(200);

    expect(query('submenu')).toBeInTheDocument();
  });
});
