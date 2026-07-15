import { fireEvent, render, waitFor } from '@testing-library/angular';
import { NgpTree, NgpTreeNode, NgpTreeNodeToggle } from 'ng-primitives/tree';
import { describe, expect, it, vi } from 'vitest';

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
  <ul ngpTree #t="ngpTree" data-testid="tree"
      [ngpTreeNodes]="nodes" [ngpTreeItemChildren]="children"
      [ngpTreeItemValue]="itemValue" [ngpTreeItemLabel]="itemLabel">
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
    componentProperties: {
      nodes,
      children: (n: Node) => n.children,
      itemValue: (n: Node) => n.id,
      itemLabel: (n: Node) => n.name,
    },
  });
  const nodeEl = (value: string) =>
    view.container.querySelector<HTMLElement>(`.node[data-value="${value}"]`)!;
  const active = (value: string) =>
    waitFor(() => expect(nodeEl(value)).toHaveAttribute('tabindex', '0'));
  const type = (value: string, key: string) => {
    nodeEl(value).focus();
    fireEvent.keyDown(nodeEl(value), { key });
  };
  return { ...view, nodeEl, active, type };
}

describe('NgpTree typeahead', () => {
  it('jumps to the next node whose label starts with the typed letter', async () => {
    const { type, active } = await renderTree();
    type('a', 'b'); // from Apple, type "b" -> Banana
    await active('b');
  });

  it('cycles through nodes sharing a first letter', async () => {
    const { type, active, nodeEl } = await renderTree();
    // expand a so Apricot/Avocado are visible
    fireEvent.keyDown(nodeEl('a'), { key: 'ArrowRight' });
    await active('a');

    type('a', 'a'); // Apple -> next "A" is Apricot
    await active('a1');
    type('a1', 'a'); // -> Avocado
    await active('a2');
  });

  it('resets the buffer after a pause', async () => {
    vi.useFakeTimers();
    try {
      const { type, nodeEl, detectChanges } = await renderTree();

      // Type "b" -> Banana.
      type('a', 'b');
      detectChanges();
      expect(nodeEl('b')).toHaveAttribute('tabindex', '0');

      // After the buffer timeout, "a" starts a fresh search -> Apple. Without the
      // reset the buffer would be "ba", which prefix-matches Banana instead.
      vi.advanceTimersByTime(600);
      type('b', 'a');
      detectChanges();
      expect(nodeEl('a')).toHaveAttribute('tabindex', '0');
      expect(nodeEl('b')).toHaveAttribute('tabindex', '-1');
    } finally {
      vi.useRealTimers();
    }
  });

  it('matches multi-character sequences', async () => {
    const { active, nodeEl } = await renderTree();
    fireEvent.keyDown(nodeEl('a'), { key: 'ArrowRight' });
    await active('a');

    nodeEl('a').focus();
    fireEvent.keyDown(nodeEl('a'), { key: 'a' });
    fireEvent.keyDown(nodeEl('a'), { key: 'v' }); // "av" -> Avocado
    await active('a2');
  });
});

describe('NgpTree focus restoration', () => {
  it('moves focus to an ancestor when a focused descendant is collapsed away', async () => {
    const { nodeEl, active } = await renderTree();

    // expand a, move focus down to a1
    fireEvent.keyDown(nodeEl('a'), { key: 'ArrowRight' });
    await active('a');
    fireEvent.keyDown(nodeEl('a'), { key: 'ArrowDown' });
    await active('a1');

    // collapse a (via its toggle) while a1 (a descendant) is focused
    fireEvent.click(nodeEl('a').querySelector<HTMLElement>(':scope > .toggle')!);

    // a1 is gone; focus should land on the collapsed ancestor a
    await active('a');
  });
});
