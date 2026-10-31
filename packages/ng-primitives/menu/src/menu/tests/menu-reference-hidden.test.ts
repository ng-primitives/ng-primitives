import { Component } from '@angular/core';
import { fireEvent, render, waitFor } from '@testing-library/angular';
import { NgpMenu, NgpMenuItem, NgpMenuTrigger } from 'ng-primitives/menu';
import { describe, expect, it } from 'vitest';

@Component({
  template: `
    <div data-testid="scroller" style="height: 200px; overflow: auto;">
      <div style="height: 100px;"></div>
      <button [ngpMenuTrigger]="menu" ngpMenuTriggerPlacement="right">Open</button>
      <div style="height: 1000px;"></div>
    </div>

    <ng-template #menu>
      <div ngpMenu data-testid="menu">
        <button ngpMenuItem>Item</button>
      </div>
    </ng-template>
  `,
  imports: [NgpMenuTrigger, NgpMenu, NgpMenuItem],
})
class ScrollContainerMenuComponent {}

describe('NgpMenu data-reference-hidden', () => {
  it('flags the menu while its trigger is scrolled out of view', async () => {
    const { getByRole, getByTestId } = await render(ScrollContainerMenuComponent);
    const scroller = getByTestId('scroller');

    fireEvent.click(getByRole('button', { name: 'Open' }));
    await waitFor(() => expect(document.querySelector('[data-testid="menu"]')).toBeInTheDocument());
    const menu = document.querySelector('[data-testid="menu"]')!;
    await waitFor(() => expect(menu).toHaveAttribute('data-placement'));
    expect(menu).not.toHaveAttribute('data-reference-hidden');

    scroller.scrollTop = 600;
    await waitFor(() => expect(menu).toHaveAttribute('data-reference-hidden'));

    scroller.scrollTop = 0;
    await waitFor(() => expect(menu).not.toHaveAttribute('data-reference-hidden'));
  });
});
