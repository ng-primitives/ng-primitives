import { fireEvent, render } from '@testing-library/angular';
import { NgpTree, NgpTreeNode } from 'ng-primitives/tree';
import { describe, expect, it } from 'vitest';

interface Node {
  id: string;
  name: string;
  children?: Node[];
}

const nodes: Node[] = [
  {
    id: 'a',
    name: 'A',
    children: [{ id: 'a1', name: 'A1', children: [{ id: 'a1x', name: 'A1X' }] }],
  },
  { id: 'b', name: 'B', children: [{ id: 'b1', name: 'B1' }] },
];

async function renderTree() {
  const template = `
    <button class="expand-all" (click)="t.expandAll()">expand</button>
    <button class="collapse-all" (click)="t.collapseAll()">collapse</button>
    <ul ngpTree #t="ngpTree" [ngpTreeNodes]="nodes" [ngpTreeItemChildren]="children"
        [ngpTreeItemValue]="itemValue">
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
    },
  });
  const rows = () => view.container.querySelectorAll('.node');
  const expandAll = () => fireEvent.click(view.container.querySelector('.expand-all')!);
  const collapseAll = () => fireEvent.click(view.container.querySelector('.collapse-all')!);
  return { ...view, rows, expandAll, collapseAll };
}

describe('NgpTree expandAll / collapseAll', () => {
  it('starts with only the roots visible', async () => {
    const { rows } = await renderTree();
    expect(rows()).toHaveLength(2); // a, b
  });

  it('expandAll reveals every node', async () => {
    const { rows, expandAll } = await renderTree();
    expandAll();
    expect(rows()).toHaveLength(5); // a, a1, a1x, b, b1
  });

  it('collapseAll returns to just the roots', async () => {
    const { rows, expandAll, collapseAll } = await renderTree();
    expandAll();
    expect(rows()).toHaveLength(5);
    collapseAll();
    expect(rows()).toHaveLength(2);
  });
});
