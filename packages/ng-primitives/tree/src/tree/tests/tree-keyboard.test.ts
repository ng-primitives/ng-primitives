import { fireEvent, render, waitFor } from '@testing-library/angular';
import { NgpTree, NgpTreeNode, NgpTreeNodeToggle } from 'ng-primitives/tree';
import { describe, expect, it } from 'vitest';

interface Node {
  id: string;
  name: string;
  children?: Node[];
}

const nodes: Node[] = [
  {
    id: 'a',
    name: 'Apple',
    children: [
      { id: 'a1', name: 'Apricot' },
      { id: 'a2', name: 'Avocado', children: [{ id: 'a2x', name: 'Ackee' }] },
    ],
  },
  { id: 'b', name: 'Banana' },
];

const template = `
  <ul ngpTree #t="ngpTree" data-testid="tree" [ngpTreeNodes]="nodes" [ngpTreeItemChildren]="children" [ngpTreeItemValue]="itemValue">
    @for (node of t.visibleNodes(); track itemValue(node)) {
      <li ngpTreeNode #n="ngpTreeNode" class="node" [ngpTreeNode]="node" [attr.data-value]="n.value()">
        <button ngpTreeNodeToggle class="toggle">t</button>
        <span class="label">{{ node.name }}</span>
      </li>
    }
  </ul>
`;

const imports = [NgpTree, NgpTreeNode, NgpTreeNodeToggle];

async function renderTree() {
  const view = await render(template, {
    imports,
    componentProperties: { nodes, children: (n: Node) => n.children, itemValue: (n: Node) => n.id },
  });
  const nodeEl = (value: string) =>
    view.container.querySelector<HTMLElement>(`.node[data-value="${value}"]`)!;
  const press = (value: string, key: string) => {
    nodeEl(value).focus();
    fireEvent.keyDown(nodeEl(value), { key });
  };
  const active = (value: string) =>
    waitFor(() => expect(nodeEl(value)).toHaveAttribute('tabindex', '0'));
  return { ...view, nodeEl, press, active };
}

describe('NgpTree keyboard', () => {
  it('roving tabindex: first node 0, others -1', async () => {
    const { nodeEl } = await renderTree();
    expect(nodeEl('a')).toHaveAttribute('tabindex', '0');
    expect(nodeEl('b')).toHaveAttribute('tabindex', '-1');
  });

  it('ArrowDown/ArrowUp move through visible nodes', async () => {
    const { press, active } = await renderTree();
    press('a', 'ArrowDown');
    await active('b');
    press('b', 'ArrowUp');
    await active('a');
  });

  it('ArrowRight expands a collapsed parent (focus stays)', async () => {
    const { nodeEl, press, active } = await renderTree();
    press('a', 'ArrowRight');
    await waitFor(() => expect(nodeEl('a')).toHaveAttribute('aria-expanded', 'true'));
    await active('a');
  });

  it('ArrowRight on an expanded parent moves to first child', async () => {
    const { press, active } = await renderTree();
    press('a', 'ArrowRight'); // expand
    await active('a');
    press('a', 'ArrowRight'); // to first child
    await active('a1');
  });

  it('ArrowLeft on an expanded parent collapses it', async () => {
    const { nodeEl, press } = await renderTree();
    press('a', 'ArrowRight');
    await waitFor(() => expect(nodeEl('a')).toHaveAttribute('aria-expanded', 'true'));
    press('a', 'ArrowLeft');
    await waitFor(() => expect(nodeEl('a')).toHaveAttribute('aria-expanded', 'false'));
  });

  it('ArrowLeft on a child moves to its parent', async () => {
    const { press, active } = await renderTree();
    press('a', 'ArrowRight'); // expand a
    await active('a');
    press('a', 'ArrowRight'); // focus a1
    await active('a1');
    press('a1', 'ArrowLeft'); // to parent a
    await active('a');
  });

  it('ArrowDown traverses into expanded children then to the next root', async () => {
    const { press, active } = await renderTree();
    press('a', 'ArrowRight'); // expand a
    await active('a');
    press('a', 'ArrowDown');
    await active('a1');
    press('a1', 'ArrowDown');
    await active('a2');
    press('a2', 'ArrowDown'); // a2 collapsed -> skip a2x, go to b
    await active('b');
  });

  it('Home and End jump to first and last visible nodes', async () => {
    const { press, active } = await renderTree();
    press('a', 'ArrowRight'); // expand a -> visible: a, a1, a2, b
    await active('a');
    press('a', 'End');
    await active('b');
    press('b', 'Home');
    await active('a');
  });
});
