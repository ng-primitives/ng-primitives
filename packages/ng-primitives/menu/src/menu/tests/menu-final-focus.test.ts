import { Component } from '@angular/core';
import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { NgpMenu, NgpMenuItem, NgpMenuTrigger } from 'ng-primitives/menu';
import { describe, expect, it } from 'vitest';

@Component({
  template: `
    <button [ngpMenuTrigger]="menu" data-testid="trigger">Open</button>
    <input #other data-testid="other" />

    <ng-template #menu>
      <div [ngpMenuFinalFocus]="other" ngpMenu data-testid="menu">
        <button ngpMenuItem data-testid="item">Item</button>
      </div>
    </ng-template>
  `,
  imports: [NgpMenuTrigger, NgpMenu, NgpMenuItem],
})
class MenuFinalFocusComponent {}

describe('NgpMenu final focus', () => {
  it('focuses the finalFocus element after a pick', async () => {
    await render(MenuFinalFocusComponent);

    await userEvent.click(screen.getByTestId('trigger'));
    await waitFor(() => expect(screen.getByTestId('menu')).toBeInTheDocument());

    await userEvent.click(screen.getByTestId('item'));
    await waitFor(() => expect(screen.queryByTestId('menu')).not.toBeInTheDocument());

    expect(screen.getByTestId('other')).toHaveFocus();
  });
});
