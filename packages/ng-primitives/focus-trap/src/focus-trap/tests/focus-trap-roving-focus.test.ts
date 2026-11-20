import { Component, signal } from '@angular/core';
import { fireEvent, render, screen, waitFor } from '@testing-library/angular';
import { NgpFocusTrap } from 'ng-primitives/focus-trap';
import { NgpRovingFocusGroup, NgpRovingFocusItem } from 'ng-primitives/roving-focus';
import { describe, expect, it } from 'vitest';

@Component({
  selector: 'test-trapped-list',
  hostDirectives: [NgpFocusTrap, NgpRovingFocusGroup],
  template: `
    <ng-content />
  `,
})
class TrappedList {}

@Component({
  imports: [TrappedList, NgpRovingFocusItem],
  template: `
    <button>Outside</button>
    @if (open()) {
      <test-trapped-list data-testid="list">
        <button ngpRovingFocusItem>One</button>
        <button ngpRovingFocusItem>Two</button>
      </test-trapped-list>
    }
  `,
})
class Host {
  readonly open = signal(false);
}

describe('NgpFocusTrap composed with NgpRovingFocusGroup', () => {
  it('should focus the tab stop on mount, rove with arrows and keep Tab inside', async () => {
    const { fixture } = await render(Host);
    const button = (name: string) => screen.getByRole('button', { name });

    button('Outside').focus();
    fixture.componentInstance.open.set(true);
    fixture.detectChanges();

    await waitFor(() => expect(button('One')).toHaveFocus());

    fireEvent.keyDown(button('One'), { key: 'ArrowDown' });
    expect(button('Two')).toHaveFocus();

    // Two is the only tabbable item, so the trap must cancel Tab and keep focus on it.
    expect(fireEvent.keyDown(button('Two'), { key: 'Tab' })).toBe(false);
    expect(button('Two')).toHaveFocus();
  });
});
