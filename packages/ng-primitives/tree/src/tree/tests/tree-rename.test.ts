import { fireEvent, render } from '@testing-library/angular';
import { NgpTree, NgpTreeNode, NgpTreeNodeRename, NgpTreeNodeToggle } from 'ng-primitives/tree';
import { describe, expect, it, vi } from 'vitest';

interface Node {
  id: string;
  name: string;
  children?: Node[];
}

const template = `
  <ul ngpTree #t="ngpTree" [ngpTreeNodes]="nodes" [ngpTreeItemChildren]="children"
      [ngpTreeItemValue]="itemValue" [ngpTreeItemLabel]="itemLabel"
      [ngpTreeItemRenamable]="canRename" (ngpTreeRename)="onRename($event)">
    @for (node of t.visibleNodes(); track itemValue(node)) {
      <li ngpTreeNode #n="ngpTreeNode" class="node" [ngpTreeNode]="node" [attr.data-value]="n.value()">
        <button ngpTreeNodeToggle class="toggle">t</button>
        @if (n.renaming()) {
          <input ngpTreeNodeRename class="rename" [value]="node.name" />
        } @else {
          <span>{{ node.name }}</span>
        }
      </li>
    }
  </ul>
`;

async function renderTree(props: Record<string, unknown> = {}) {
  const view = await render(template, {
    imports: [NgpTree, NgpTreeNode, NgpTreeNodeRename, NgpTreeNodeToggle],
    componentProperties: {
      nodes: [
        { id: 'a', name: 'A' },
        { id: 'b', name: 'B' },
      ] as Node[],
      children: (n: Node) => n.children,
      itemValue: (n: Node) => n.id,
      itemLabel: (n: Node) => n.name,
      canRename: true,
      onRename: () => {},
      ...props,
    },
  });
  const row = (v: string) => view.container.querySelector<HTMLElement>(`.node[data-value="${v}"]`)!;
  const input = () => view.container.querySelector<HTMLInputElement>('.rename');
  return { ...view, row, input };
}

describe('NgpTree rename', () => {
  it('starts renaming on F2 and commits the new label on Enter', async () => {
    const onRename = vi.fn();
    const { row, input, detectChanges } = await renderTree({ onRename });

    fireEvent.keyDown(row('a'), { key: 'F2' });
    detectChanges();
    const field = input()!;
    expect(field).not.toBeNull();

    field.value = 'Renamed';
    fireEvent.keyDown(field, { key: 'Enter' });

    expect(onRename).toHaveBeenCalledTimes(1);
    expect(onRename.mock.calls[0][0]).toMatchObject({ node: { id: 'a' }, value: 'Renamed' });
  });

  it('starts renaming on double-click', async () => {
    const { row, input, detectChanges } = await renderTree();
    fireEvent.dblClick(row('b'));
    detectChanges();
    expect(input()).not.toBeNull();
  });

  it('does not start renaming on a double-click of an interactive part (the toggle)', async () => {
    const { row, input, detectChanges } = await renderTree({
      nodes: [{ id: 'a', name: 'A', children: [{ id: 'a1', name: 'A1' }] }] as Node[],
    });

    // Rapidly toggling the folder must not open the rename field.
    fireEvent.dblClick(row('a').querySelector('.toggle')!);
    detectChanges();
    expect(input()).toBeNull();

    // A double-click on the row body still starts a rename.
    fireEvent.dblClick(row('a'));
    detectChanges();
    expect(input()).not.toBeNull();
  });

  it('commits the new label when the field is blurred', async () => {
    const onRename = vi.fn();
    const { row, input, detectChanges } = await renderTree({ onRename });

    fireEvent.keyDown(row('a'), { key: 'F2' });
    detectChanges();
    const field = input()!;
    field.value = 'Blurred';
    fireEvent.blur(field);

    expect(onRename).toHaveBeenCalledTimes(1);
    expect(onRename.mock.calls[0][0]).toMatchObject({ node: { id: 'a' }, value: 'Blurred' });
  });

  it('does not commit twice when blur follows an Enter commit', async () => {
    const onRename = vi.fn();
    const { row, input, detectChanges } = await renderTree({ onRename });

    fireEvent.keyDown(row('a'), { key: 'F2' });
    detectChanges();
    const field = input()!;
    field.value = 'Once';
    fireEvent.keyDown(field, { key: 'Enter' });
    fireEvent.blur(field); // the trailing blur after Enter must be a no-op

    expect(onRename).toHaveBeenCalledTimes(1);
    expect(onRename.mock.calls[0][0]).toMatchObject({ node: { id: 'a' }, value: 'Once' });
  });

  it('starts renaming on a double-tap (touch)', async () => {
    const { row, input, detectChanges } = await renderTree();
    // Two quick taps on the same row.
    fireEvent.pointerUp(row('b'), { pointerType: 'touch' });
    fireEvent.pointerUp(row('b'), { pointerType: 'touch' });
    detectChanges();
    expect(input()).not.toBeNull();
  });

  it('does not start renaming on a single tap', async () => {
    const { row, input, detectChanges } = await renderTree();
    fireEvent.pointerUp(row('b'), { pointerType: 'touch' });
    detectChanges();
    expect(input()).toBeNull();
  });

  it('cancels on Escape without calling onRename', async () => {
    const onRename = vi.fn();
    const { row, input, detectChanges } = await renderTree({ onRename });

    fireEvent.keyDown(row('a'), { key: 'F2' });
    detectChanges();
    const field = input()!;
    field.value = 'Nope';
    fireEvent.keyDown(field, { key: 'Escape' });
    detectChanges();

    expect(onRename).not.toHaveBeenCalled();
    expect(input()).toBeNull(); // editing ended
  });

  it('treats an empty or unchanged label as a cancel', async () => {
    const onRename = vi.fn();
    const { row, input, detectChanges } = await renderTree({ onRename });

    // Unchanged.
    fireEvent.keyDown(row('a'), { key: 'F2' });
    detectChanges();
    fireEvent.keyDown(input()!, { key: 'Enter' });
    expect(onRename).not.toHaveBeenCalled();

    // Empty.
    fireEvent.keyDown(row('a'), { key: 'F2' });
    detectChanges();
    const field = input()!;
    field.value = '   ';
    fireEvent.keyDown(field, { key: 'Enter' });
    expect(onRename).not.toHaveBeenCalled();
  });

  it('does not start renaming when itemRenamable is not set', async () => {
    const { row, input, detectChanges } = await renderTree({ canRename: undefined });
    fireEvent.keyDown(row('a'), { key: 'F2' });
    detectChanges();
    expect(input()).toBeNull();
  });

  it('respects the itemRenamable predicate', async () => {
    const onRename = vi.fn();
    const { row, input, detectChanges } = await renderTree({
      onRename,
      canRename: (n: Node) => n.id !== 'a',
    });
    fireEvent.keyDown(row('a'), { key: 'F2' });
    detectChanges();
    expect(input()).toBeNull(); // 'a' rejected
    fireEvent.keyDown(row('b'), { key: 'F2' });
    detectChanges();
    expect(input()).not.toBeNull(); // 'b' allowed
  });
});
