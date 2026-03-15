import { fakeAsync, flush } from '@angular/core/testing';
import { fireEvent, render, screen } from '@testing-library/angular';
import { NgpMenu, NgpMenuItem, NgpMenuTrigger } from '../index';

describe('NgpMenuTrigger', () => {
  it('should open a menu on click', fakeAsync(async () => {
    const { getByText } = await render(
      `<button [ngpMenuTrigger]="menu">Open Menu</button>

    <ng-template #menu>
      <div ngpMenu data-testid="ngp-menu">
        <button ngpMenuItem>Item 1</button>
        <button ngpMenuItem>Item 2</button>
        <button ngpMenuItem>Item 3</button>
      </div>
    </ng-template>`,
      {
        imports: [NgpMenuTrigger, NgpMenu, NgpMenuItem],
      },
    );

    const trigger = getByText('Open Menu');
    fireEvent.click(trigger);
    flush();

    const menu = screen.getByTestId('ngp-menu');
    expect(menu).toBeInTheDocument();
  }));
});
