import { fireEvent, render } from '@testing-library/angular';
import { NgpTree, NgpTreeNode } from 'ng-primitives/tree';
import { describe, expect, it, vi } from 'vitest';

interface Node {
  id: string;
  name: string;
  children?: Node[];
}

const nodes: Node[] = [
  { id: 'a', name: 'A' },
  { id: 'b', name: 'B' },
];

async function renderTree(props: Record<string, unknown> = {}) {
  const template = `
    <ul ngpTree #t="ngpTree" [ngpTreeNodes]="nodes" [ngpTreeItemChildren]="children"
        [ngpTreeItemValue]="itemValue" [ngpTreeItemRenamable]="canRename"
        (ngpTreeActivate)="onActivate($event)">
      @for (node of t.visibleNodes(); track itemValue(node)) {
        <li ngpTreeNode #n="ngpTreeNode" class="node" [ngpTreeNode]="node" [attr.data-value]="n.value()">
          <span>{{ node.name }}</span>
        </li>
      }
    </ul>
  `;
  const view = await render(template, {
    imports: [NgpTree, NgpTreeNode],
    componentProperties: {
      nodes,
      children: (n: Node) => n.children,
      itemValue: (n: Node) => n.id,
      canRename: undefined,
      onActivate: () => {},
      ...props,
    },
  });
  const row = (value: string) =>
    view.container.querySelector<HTMLElement>(`.node[data-value="${value}"]`)!;
  return { ...view, row };
}

describe('NgpTree activate', () => {
  it('fires activate on Enter with the node', async () => {
    const onActivate = vi.fn();
    const { row } = await renderTree({ onActivate });

    fireEvent.keyDown(row('a'), { key: 'Enter' });
    expect(onActivate).toHaveBeenCalledTimes(1);
    expect(onActivate.mock.calls[0][0]).toMatchObject({ id: 'a' });
  });

  it('fires activate on double-click when the node is not renamable', async () => {
    const onActivate = vi.fn();
    const { row } = await renderTree({ onActivate });

    fireEvent.dblClick(row('b'));
    expect(onActivate).toHaveBeenCalledTimes(1);
    expect(onActivate.mock.calls[0][0]).toMatchObject({ id: 'b' });
  });

  it('does not fire activate on double-click when the node is renamable', async () => {
    const onActivate = vi.fn();
    const { row } = await renderTree({ onActivate, canRename: true });

    fireEvent.dblClick(row('a'));
    expect(onActivate).not.toHaveBeenCalled();
  });
});
