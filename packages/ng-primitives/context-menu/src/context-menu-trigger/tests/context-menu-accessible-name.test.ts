import { Component } from '@angular/core';
import { fireEvent, render, screen, waitFor } from '@testing-library/angular';
import {
  NgpContextMenu,
  NgpContextMenuItem,
  NgpContextMenuTrigger,
} from 'ng-primitives/context-menu';
import { describe, expect, it } from 'vitest';

@Component({
  template: `
    <div [ngpContextMenuTrigger]="menu" data-testid="area">Right-click anywhere in this area</div>

    <ng-template #menu>
      <div ngpContextMenu data-testid="context-menu">
        <button ngpContextMenuItem>Copy</button>
      </div>
    </ng-template>
  `,
  imports: [NgpContextMenuTrigger, NgpContextMenu, NgpContextMenuItem],
})
class ContextMenuNameTestComponent {}

describe('NgpContextMenu accessible name', () => {
  it('should not be labelled by the area it opens from', async () => {
    await render(ContextMenuNameTestComponent);
    fireEvent.contextMenu(screen.getByTestId('area'));
    await waitFor(() => expect(screen.getByTestId('context-menu')).toBeInTheDocument());

    await new Promise(resolve => setTimeout(resolve));
    expect(screen.getByTestId('context-menu')).not.toHaveAttribute('aria-labelledby');
  });
});
