import { Component } from '@angular/core';
import { fireEvent, render, waitFor } from '@testing-library/angular';
import {
  NgpNavigationMenu,
  NgpNavigationMenuContent,
  NgpNavigationMenuItem,
  NgpNavigationMenuList,
  NgpNavigationMenuTrigger,
} from 'ng-primitives/navigation-menu';
import { describe, expect, it } from 'vitest';

@Component({
  template: `
    <div data-testid="scroller" style="height: 200px; overflow: auto;">
      <div style="height: 100px;"></div>
      <nav ngpNavigationMenu>
        <ul ngpNavigationMenuList>
          <li ngpNavigationMenuItem ngpNavigationMenuItemValue="products">
            <button [ngpNavigationMenuTrigger]="content" data-testid="trigger">Products</button>
            <ng-template #content>
              <div ngpNavigationMenuContent data-testid="content">Content</div>
            </ng-template>
          </li>
        </ul>
      </nav>
      <div style="height: 1000px;"></div>
    </div>
  `,
  imports: [
    NgpNavigationMenu,
    NgpNavigationMenuList,
    NgpNavigationMenuItem,
    NgpNavigationMenuTrigger,
    NgpNavigationMenuContent,
  ],
})
class ScrollContainerNavigationMenuComponent {}

describe('NgpNavigationMenuContent data-reference-hidden', () => {
  it('flags the content while its trigger is scrolled out of view', async () => {
    const { getByTestId } = await render(ScrollContainerNavigationMenuComponent);
    const scroller = getByTestId('scroller');

    fireEvent.click(getByTestId('trigger'));
    const content = await waitFor(() => {
      const element = document.querySelector('[data-testid="content"]');
      expect(element).toBeInTheDocument();
      return element!;
    });
    await waitFor(() => expect(content).toHaveAttribute('data-placement'));
    expect(content).not.toHaveAttribute('data-reference-hidden');

    scroller.scrollTop = 600;
    await waitFor(() => expect(content).toHaveAttribute('data-reference-hidden'));

    scroller.scrollTop = 0;
    await waitFor(() => expect(content).not.toHaveAttribute('data-reference-hidden'));
  });
});
