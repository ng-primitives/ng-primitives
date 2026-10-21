import { Component, signal, viewChild } from '@angular/core';
import { fireEvent, render, screen } from '@testing-library/angular';
import { NgpRovingFocusGroup, NgpRovingFocusItem } from 'ng-primitives/roving-focus';
import { describe, expect, it } from 'vitest';

@Component({
  imports: [NgpRovingFocusGroup, NgpRovingFocusItem],
  template: `
    <div [ngpRovingFocusGroupWrap]="false" ngpRovingFocusGroup>
      @for (item of items(); track item) {
        <button ngpRovingFocusItem>{{ item }}</button>
      }
    </div>
  `,
})
class DynamicGroup {
  readonly items = signal(['a', 'b', 'c']);
  readonly group = viewChild.required(NgpRovingFocusGroup);
}

const item = (name: string) => screen.getByRole('button', { name });

describe('NgpRovingFocusGroup with changing items', () => {
  it('should switch navigation keys when the orientation is set through the state', async () => {
    const { fixture } = await render(DynamicGroup);

    fixture.componentInstance.group().state.setOrientation('horizontal');

    item('a').focus();
    fireEvent.keyDown(item('a'), { key: 'ArrowDown' });
    expect(item('a')).toHaveFocus();

    fireEvent.keyDown(item('a'), { key: 'ArrowRight' });
    expect(item('b')).toHaveFocus();
  });

  it('should navigate in DOM order after the items are reordered', async () => {
    const { fixture } = await render(DynamicGroup);

    fixture.componentInstance.items.set(['c', 'a', 'b']);
    fixture.detectChanges();

    item('a').focus();
    fireEvent.keyDown(item('a'), { key: 'ArrowUp' });

    expect(item('c')).toHaveFocus();
  });

  it('should navigate in DOM order to an item inserted before the existing ones', async () => {
    const { fixture } = await render(DynamicGroup);

    fixture.componentInstance.items.set(['z', 'a', 'b', 'c']);
    fixture.detectChanges();

    item('a').focus();
    fireEvent.keyDown(item('a'), { key: 'ArrowUp' });

    expect(item('z')).toHaveFocus();
  });

  it('should move the tab stop to a remaining item when the tab stop is removed', async () => {
    const { fixture } = await render(DynamicGroup);
    expect(item('a')).toHaveAttribute('tabindex', '0');

    fixture.componentInstance.items.set(['b', 'c']);
    fixture.detectChanges();

    expect(item('b')).toHaveAttribute('tabindex', '0');
  });
});
