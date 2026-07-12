import { fireEvent, render } from '@testing-library/angular';
import { NgpTree, NgpTreeDragPreview, NgpTreeNode } from 'ng-primitives/tree';
import { afterEach, describe, expect, it, vi } from 'vitest';

interface Node {
  id: string;
  name: string;
  children?: Node[];
}

const nodes: Node[] = [
  {
    id: 'a',
    name: 'A',
    children: [
      { id: 'a1', name: 'A1' },
      { id: 'a2', name: 'A2' },
    ],
  },
  { id: 'b', name: 'B' },
];

const ORDER = ['a', 'a1', 'a2', 'b'];
const ROW_H = 20;

async function renderTree(props: Record<string, unknown> = {}) {
  const template = `
    <ul ngpTree #t="ngpTree" [ngpTreeNodes]="nodes" [ngpTreeChildren]="children"
        [ngpTreeItemValue]="itemValue" [ngpTreeDefaultExpandedKeys]="expanded"
        [ngpTreeCanDrag]="canDrag" [ngpTreeCanDrop]="canDrop" [ngpTreeOnDrop]="onDrop">
      @for (node of t.visibleNodes(); track itemValue(node)) {
        <li ngpTreeNode #n="ngpTreeNode" class="node" [ngpTreeNode]="node"
            [attr.data-value]="n.value()" [attr.data-dragging]="n.dragging() ? '' : null"
            [attr.data-drop]="n.dropPosition()">
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
      expanded: new Set(['a']),
      canDrag: undefined,
      canDrop: undefined,
      onDrop: () => {},
      ...props,
    },
  });
  const nodeEl = (value: string) =>
    view.container.querySelector<HTMLElement>(`.node[data-value="${value}"]`)!;

  // Stack the rows vertically and drive elementFromPoint off their boxes.
  ORDER.forEach((value, i) => {
    const el = nodeEl(value);
    if (!el) {
      return; // collapsed rows aren't rendered yet
    }
    const top = i * ROW_H;
    vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
      top,
      bottom: top + ROW_H,
      left: 0,
      right: 100,
      width: 100,
      height: ROW_H,
      x: 0,
      y: top,
      toJSON: () => ({}),
    } as DOMRect);
  });
  vi.spyOn(document, 'elementFromPoint').mockImplementation((_x, y) => {
    const el = ORDER.map(nodeEl)
      .filter(Boolean)
      .find(e => {
        const r = e.getBoundingClientRect();
        return y >= r.top && y < r.bottom;
      });
    return el ?? null;
  });

  // Centre y of a row, biased to before/inside/after.
  const yOf = (value: string, where: 'before' | 'inside' | 'after' = 'inside') => {
    const top = ORDER.indexOf(value) * ROW_H;
    return where === 'before' ? top + 2 : where === 'after' ? top + ROW_H - 2 : top + ROW_H / 2;
  };

  const drag = (from: string, to: string, where: 'before' | 'inside' | 'after' = 'inside') => {
    fireEvent.pointerDown(nodeEl(from), { clientX: 5, clientY: yOf(from), button: 0 });
    fireEvent.pointerMove(document.body, { clientX: 5, clientY: yOf(to, where) });
    return {
      drop: () => fireEvent.pointerUp(document.body, { clientX: 5, clientY: yOf(to, where) }),
    };
  };

  return { ...view, nodeEl, drag };
}

afterEach(() => vi.restoreAllMocks());

describe('NgpTree drag & drop', () => {
  it('drops a node onto another (inside) and reports source/target/position', async () => {
    const onDrop = vi.fn();
    const { drag } = await renderTree({ onDrop });

    drag('b', 'a', 'inside').drop();

    expect(onDrop).toHaveBeenCalledTimes(1);
    expect(onDrop.mock.calls[0][0]).toMatchObject({
      source: { id: 'b' },
      target: { id: 'a' },
      position: 'inside',
    });
  });

  it('computes before / after from the pointer position within the row', async () => {
    const onDrop = vi.fn();
    const { drag } = await renderTree({ onDrop });

    drag('b', 'a', 'before').drop();
    expect(onDrop.mock.calls[0][0].position).toBe('before');
  });

  it('marks the dragged node while dragging', async () => {
    const { nodeEl, drag } = await renderTree();
    drag('b', 'a', 'inside');
    expect(nodeEl('b')).toHaveAttribute('data-dragging');
    expect(nodeEl('a')).toHaveAttribute('data-drop', 'inside');
  });

  it('renders a floating clone of the dragged row as the preview', async () => {
    const { drag } = await renderTree();
    drag('b', 'a', 'inside');
    // The preview is a body-appended, aria-hidden clone of the dragged row.
    const preview = document.body.querySelector<HTMLElement>(':scope > [aria-hidden="true"]');
    expect(preview).not.toBeNull();
    expect(preview!.querySelector('.node[data-value="b"]')).not.toBeNull();
    expect(preview!.textContent).toContain('B');
  });

  it('renders a custom ngpTreeDragPreview template when provided', async () => {
    const view = await render(
      `
      <ul ngpTree #t="ngpTree" [ngpTreeNodes]="nodes" [ngpTreeChildren]="children"
          [ngpTreeItemValue]="itemValue" [ngpTreeDefaultExpandedKeys]="expanded" [ngpTreeOnDrop]="onDrop">
        @for (node of t.visibleNodes(); track itemValue(node)) {
          <li ngpTreeNode class="node" [ngpTreeNode]="node" [attr.data-value]="itemValue(node)">
            {{ node.name }}
          </li>
        }
        <ng-template ngpTreeDragPreview let-node>
          <div class="custom-preview">dragging {{ node.name }}</div>
        </ng-template>
      </ul>
    `,
      {
        imports: [NgpTree, NgpTreeNode, NgpTreeDragPreview],
        componentProperties: {
          nodes,
          children: (n: Node) => n.children,
          itemValue: (n: Node) => n.id,
          expanded: new Set(['a']),
          onDrop: () => {},
        },
      },
    );
    const nodeEl = (v: string) =>
      view.container.querySelector<HTMLElement>(`.node[data-value="${v}"]`)!;

    fireEvent.pointerDown(nodeEl('b'), { clientX: 5, clientY: 65, button: 0 });
    fireEvent.pointerMove(document.body, { clientX: 5, clientY: 20 });

    const preview = document.body.querySelector<HTMLElement>(':scope > [aria-hidden="true"]');
    expect(preview).not.toBeNull();
    expect(preview!.querySelector('.custom-preview')?.textContent).toContain('dragging B');
    // It should NOT be a clone of the row.
    expect(preview!.querySelector('.node')).toBeNull();
  });

  it('blocks dropping a node into its own subtree', async () => {
    const onDrop = vi.fn();
    const { nodeEl, drag } = await renderTree({ onDrop });

    drag('a', 'a1', 'inside').drop(); // a1 is a descendant of a
    expect(onDrop).not.toHaveBeenCalled();
    expect(nodeEl('a1')).not.toHaveAttribute('data-drop');
  });

  it('does not drag when drag & drop is not enabled (no onDrop)', async () => {
    const { nodeEl, drag } = await renderTree({ onDrop: undefined });
    drag('b', 'a', 'inside');
    expect(nodeEl('b')).not.toHaveAttribute('data-dragging');
    expect(document.body.querySelector(':scope > [aria-hidden="true"]')).toBeNull();
  });

  it('respects canDrag', async () => {
    const onDrop = vi.fn();
    const { nodeEl, drag } = await renderTree({ onDrop, canDrag: (n: Node) => n.id !== 'b' });

    drag('b', 'a', 'inside').drop();
    expect(onDrop).not.toHaveBeenCalled();
    expect(nodeEl('b')).not.toHaveAttribute('data-dragging');
  });

  it('waits for a long-press before dragging on touch (so the list can scroll)', async () => {
    vi.useFakeTimers();
    try {
      const onDrop = vi.fn();
      const { nodeEl, detectChanges } = await renderTree({ onDrop });

      // A touch that moves before the long-press fires is a scroll, not a drag.
      fireEvent.pointerDown(nodeEl('b'), {
        clientX: 5,
        clientY: 65,
        button: 0,
        pointerType: 'touch',
      });
      fireEvent.pointerMove(document.body, { clientX: 5, clientY: 10, pointerType: 'touch' });
      expect(nodeEl('b')).not.toHaveAttribute('data-dragging');

      // Holding still past the long-press arms the drag in place.
      fireEvent.pointerDown(nodeEl('b'), {
        clientX: 5,
        clientY: 65,
        button: 0,
        pointerType: 'touch',
      });
      vi.advanceTimersByTime(500);
      detectChanges();
      expect(nodeEl('b')).toHaveAttribute('data-dragging');
    } finally {
      vi.useRealTimers();
    }
  });

  it('spring-loads a collapsed folder when hovered over during a drag', async () => {
    vi.useFakeTimers();
    try {
      // Start with 'a' collapsed so it can spring open.
      const { nodeEl, drag, detectChanges } = await renderTree({ expanded: new Set<string>() });
      expect(nodeEl('a1')).toBeNull(); // collapsed: children not rendered

      // Hover 'b' over the middle of collapsed folder 'a' (inside).
      drag('b', 'a', 'inside');
      expect(nodeEl('a')).toHaveAttribute('data-drop', 'inside');

      vi.advanceTimersByTime(800);
      detectChanges();
      // 'a' should now be expanded - its children become visible rows.
      expect(nodeEl('a1')).not.toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });

  it('falls back to before/after when the target rejects an inside drop', async () => {
    // Reject every "inside" drop (mimics dropping onto a file).
    const canDrop = ({ position }: { position: string }) => position !== 'inside';
    const { nodeEl, drag } = await renderTree({ canDrop });

    // Hover the exact middle of leaf 'b' - would be "inside", but it's rejected.
    drag('a1', 'b', 'inside');
    // Instead of blinking out, it shows a reorder indicator.
    const drop = nodeEl('b').getAttribute('data-drop');
    expect(drop).not.toBeNull();
    expect(drop).not.toBe('inside');
  });

  it('respects a custom canDrop', async () => {
    const onDrop = vi.fn();
    const canDrop = vi.fn(() => false);
    const { drag } = await renderTree({ onDrop, canDrop });

    drag('b', 'a', 'inside').drop();
    expect(canDrop).toHaveBeenCalled();
    expect(onDrop).not.toHaveBeenCalled();
  });
});
