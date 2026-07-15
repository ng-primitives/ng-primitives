import { fireEvent, render } from '@testing-library/angular';
import {
  NgpTree,
  NgpTreeDragPreview,
  NgpTreeNode,
  NgpTreeNodeDragHandle,
} from 'ng-primitives/tree';
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
    <ul ngpTree #t="ngpTree" [ngpTreeNodes]="nodes" [ngpTreeItemChildren]="children"
        [ngpTreeItemValue]="itemValue" [ngpTreeDefaultExpandedKeys]="expanded"
        [ngpTreeSelectionMode]="selectionMode" [ngpTreeDefaultSelectedKeys]="selectedKeys"
        [ngpTreeItemDraggable]="canDrag" [ngpTreeCanDrop]="canDrop" (ngpTreeDrop)="onDrop($event)">
      @for (node of t.visibleNodes(); track itemValue(node)) {
        <li ngpTreeNode #n="ngpTreeNode" class="node" [ngpTreeNode]="node"
            [attr.data-value]="n.value()" [attr.data-dragging]="n.dragging() ? '' : null"
            [attr.data-drop]="n.dropPosition()" [attr.data-cut]="n.cut() ? '' : null">
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
      selectionMode: 'none',
      selectedKeys: new Set<string>(),
      canDrag: true,
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
      drop: (init: Record<string, unknown> = {}) =>
        fireEvent.pointerUp(document.body, { clientX: 5, clientY: yOf(to, where), ...init }),
    };
  };

  return { ...view, nodeEl, drag, yOf };
}

afterEach(() => vi.restoreAllMocks());

describe('NgpTree drag & drop', () => {
  it('drops a node onto another (inside) and reports sources/target/position', async () => {
    const onDrop = vi.fn();
    const { drag } = await renderTree({ onDrop });

    drag('b', 'a', 'inside').drop();

    expect(onDrop).toHaveBeenCalledTimes(1);
    expect(onDrop.mock.calls[0][0]).toMatchObject({
      sources: [{ id: 'b' }],
      target: { id: 'a' },
      position: 'inside',
    });
  });

  it('computes before / after from the pointer position within the row', async () => {
    const onDrop = vi.fn();
    const { drag } = await renderTree({ onDrop });

    drag('b', 'a', 'before').drop();
    expect(onDrop.mock.calls[0][0].position).toBe('before');

    // The bottom quarter of a row drops after it.
    drag('b', 'a', 'after').drop();
    expect(onDrop.mock.calls[1][0].position).toBe('after');
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
      <ul ngpTree #t="ngpTree" [ngpTreeNodes]="nodes" [ngpTreeItemChildren]="children"
          [ngpTreeItemValue]="itemValue" [ngpTreeDefaultExpandedKeys]="expanded"
          [ngpTreeItemDraggable]="true" (ngpTreeDrop)="onDrop($event)">
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

  it('does not drag when drag & drop is not enabled (no itemDraggable)', async () => {
    const { nodeEl, drag } = await renderTree({ canDrag: undefined });
    drag('b', 'a', 'inside');
    expect(nodeEl('b')).not.toHaveAttribute('data-dragging');
    expect(document.body.querySelector(':scope > [aria-hidden="true"]')).toBeNull();
  });

  it('respects the itemDraggable predicate', async () => {
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

  it('drags the whole selection when a selected node is grabbed', async () => {
    const onDrop = vi.fn();
    const { drag } = await renderTree({
      onDrop,
      selectionMode: 'multiple',
      selectedKeys: new Set(['a1', 'a2']),
    });

    drag('a1', 'b', 'after').drop();

    expect(onDrop).toHaveBeenCalledTimes(1);
    const ids = onDrop.mock.calls[0][0].sources.map((n: Node) => n.id);
    expect(ids).toEqual(['a1', 'a2']); // visible order, both moved
  });

  it('drags only the grabbed node when it is not part of the selection', async () => {
    const onDrop = vi.fn();
    const { drag } = await renderTree({
      onDrop,
      selectionMode: 'multiple',
      selectedKeys: new Set(['a1', 'a2']),
    });

    drag('b', 'a', 'inside').drop(); // b isn't selected

    expect(onDrop.mock.calls[0][0].sources.map((n: Node) => n.id)).toEqual(['b']);
  });

  it('moves a node with keyboard cut / paste', async () => {
    const onDrop = vi.fn();
    const { nodeEl, detectChanges } = await renderTree({ onDrop });

    // Cut 'b' (send both modifiers to be platform-independent).
    fireEvent.keyDown(nodeEl('b'), { key: 'x', ctrlKey: true, metaKey: true });
    detectChanges();
    expect(nodeEl('b')).toHaveAttribute('data-cut');

    // Paste onto folder 'a' -> dropped inside.
    fireEvent.keyDown(nodeEl('a'), { key: 'v', ctrlKey: true, metaKey: true });
    expect(onDrop).toHaveBeenCalledTimes(1);
    expect(onDrop.mock.calls[0][0]).toMatchObject({
      sources: [{ id: 'b' }],
      target: { id: 'a' },
      position: 'inside',
    });
  });

  it('cancels an in-flight drag on Escape without dropping', async () => {
    const onDrop = vi.fn();
    const { nodeEl, drag, yOf } = await renderTree({ onDrop });

    drag('b', 'a', 'inside');
    expect(nodeEl('b')).toHaveAttribute('data-dragging');
    expect(nodeEl('a')).toHaveAttribute('data-drop', 'inside');

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(nodeEl('b')).not.toHaveAttribute('data-dragging');
    expect(nodeEl('a')).not.toHaveAttribute('data-drop');

    // Releasing over a valid target after the cancel must not drop.
    fireEvent.pointerUp(document.body, { clientX: 5, clientY: yOf('a') });
    expect(onDrop).not.toHaveBeenCalled();
  });

  it('moves the whole selection with keyboard cut / paste', async () => {
    const onDrop = vi.fn();
    const { nodeEl, detectChanges } = await renderTree({
      onDrop,
      selectionMode: 'multiple',
      selectedKeys: new Set(['a2', 'a1']),
    });

    // Cut from one of the selected nodes marks the whole selection.
    fireEvent.keyDown(nodeEl('a2'), { key: 'x', ctrlKey: true, metaKey: true });
    detectChanges();
    expect(nodeEl('a1')).toHaveAttribute('data-cut');
    expect(nodeEl('a2')).toHaveAttribute('data-cut');

    // Paste onto folder 'a' -> both dropped inside, in visible order.
    fireEvent.keyDown(nodeEl('a'), { key: 'v', ctrlKey: true, metaKey: true });
    expect(onDrop).toHaveBeenCalledTimes(1);
    expect(onDrop.mock.calls[0][0]).toMatchObject({
      target: { id: 'a' },
      position: 'inside',
    });
    expect(onDrop.mock.calls[0][0].sources.map((n: Node) => n.id)).toEqual(['a1', 'a2']);
  });

  it('clears a pending cut on Escape', async () => {
    const onDrop = vi.fn();
    const { nodeEl, detectChanges } = await renderTree({ onDrop });

    fireEvent.keyDown(nodeEl('b'), { key: 'x', ctrlKey: true, metaKey: true });
    detectChanges();
    expect(nodeEl('b')).toHaveAttribute('data-cut');

    fireEvent.keyDown(nodeEl('b'), { key: 'Escape' });
    detectChanges();
    expect(nodeEl('b')).not.toHaveAttribute('data-cut');
  });

  it('respects a custom canDrop', async () => {
    const onDrop = vi.fn();
    const canDrop = vi.fn(() => false);
    const { drag } = await renderTree({ onDrop, canDrop });

    drag('b', 'a', 'inside').drop();
    expect(canDrop).toHaveBeenCalled();
    expect(onDrop).not.toHaveBeenCalled();
  });

  it('with a drag handle, a drag only starts from the handle, not the row body', async () => {
    const view = await render(
      `
      <ul ngpTree #t="ngpTree" [ngpTreeNodes]="nodes" [ngpTreeItemChildren]="children"
          [ngpTreeItemValue]="itemValue" [ngpTreeDefaultExpandedKeys]="expanded"
          [ngpTreeItemDraggable]="true" (ngpTreeDrop)="onDrop($event)">
        @for (node of t.visibleNodes(); track itemValue(node)) {
          <li ngpTreeNode #n="ngpTreeNode" class="node" [ngpTreeNode]="node"
              [attr.data-value]="n.value()" [attr.data-dragging]="n.dragging() ? '' : null">
            <button class="handle" ngpTreeNodeDragHandle>::</button>
            <span class="label">{{ node.name }}</span>
          </li>
        }
      </ul>
    `,
      {
        imports: [NgpTree, NgpTreeNode, NgpTreeNodeDragHandle],
        componentProperties: {
          nodes,
          children: (n: Node) => n.children,
          itemValue: (n: Node) => n.id,
          expanded: new Set(['a']),
          onDrop: () => {},
        },
      },
    );
    const row = (v: string) =>
      view.container.querySelector<HTMLElement>(`.node[data-value="${v}"]`)!;
    const handle = (v: string) => row(v).querySelector<HTMLElement>('.handle')!;

    // Dragging from the row body (the label) does not start a drag.
    fireEvent.pointerDown(row('b').querySelector('.label')!, {
      clientX: 5,
      clientY: 65,
      button: 0,
    });
    fireEvent.pointerMove(document.body, { clientX: 5, clientY: 20 });
    expect(row('b')).not.toHaveAttribute('data-dragging');

    // Dragging from the handle starts a drag.
    fireEvent.pointerDown(handle('b'), { clientX: 5, clientY: 65, button: 0 });
    fireEvent.pointerMove(document.body, { clientX: 5, clientY: 20 });
    expect(row('b')).toHaveAttribute('data-dragging');
  });

  it('reports a move effect by default and a copy effect when the modifier is held', async () => {
    const onDrop = vi.fn();
    const { drag } = await renderTree({ onDrop });

    drag('b', 'a', 'inside').drop();
    expect(onDrop.mock.calls[0][0].effect).toBe('move');

    drag('b', 'a', 'inside').drop({ altKey: true });
    expect(onDrop.mock.calls[1][0].effect).toBe('copy');
  });

  it('drops into the tree root when released over empty space below the rows', async () => {
    const onDrop = vi.fn();
    const { nodeEl, yOf, container } = await renderTree({ onDrop });

    // Give the tree container a tall box so a point below the rows is still inside it.
    const ul = container.querySelector('[ngptree]')!;
    vi.spyOn(ul, 'getBoundingClientRect').mockReturnValue({
      top: 0,
      bottom: 200,
      left: 0,
      right: 100,
      width: 100,
      height: 200,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    } as DOMRect);

    fireEvent.pointerDown(nodeEl('a1'), { clientX: 5, clientY: yOf('a1'), button: 0 });
    fireEvent.pointerMove(document.body, { clientX: 5, clientY: 120 }); // below all rows
    fireEvent.pointerUp(document.body, { clientX: 5, clientY: 120 });

    expect(onDrop).toHaveBeenCalledTimes(1);
    expect(onDrop.mock.calls[0][0]).toMatchObject({
      sources: [{ id: 'a1' }],
      target: null,
      position: 'inside',
    });
  });
});
