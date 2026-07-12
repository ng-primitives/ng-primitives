import { Component, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroChevronRightMini,
  heroDocumentMini,
  heroFolderMini,
  heroFolderOpenMini,
} from '@ng-icons/heroicons/mini';
import { NgpTree, NgpTreeNode, NgpTreeNodeToggle } from 'ng-primitives/tree';
import { NgpTreeDropEvent } from 'ng-primitives/tree';

interface FileNode {
  id: string;
  name: string;
  folder?: boolean;
  children?: FileNode[];
}

/** Remove the node with `id`, returning it. */
function extract(list: FileNode[], id: string): FileNode | null {
  for (let i = 0; i < list.length; i++) {
    if (list[i].id === id) {
      return list.splice(i, 1)[0];
    }
    const child = list[i].children;
    if (child) {
      const found = extract(child, id);
      if (found) {
        return found;
      }
    }
  }
  return null;
}

/** Find the list + index that directly contains `id`. */
function locate(list: FileNode[], id: string): { list: FileNode[]; index: number } | null {
  for (let i = 0; i < list.length; i++) {
    if (list[i].id === id) {
      return { list, index: i };
    }
    const child = list[i].children;
    if (child) {
      const found = locate(child, id);
      if (found) {
        return found;
      }
    }
  }
  return null;
}

function find(list: FileNode[], id: string): FileNode | null {
  return locate(list, id)?.list[locate(list, id)!.index] ?? null;
}

@Component({
  selector: 'app-tree-dnd',
  imports: [NgpTree, NgpTreeNode, NgpTreeNodeToggle, NgIcon],
  providers: [
    provideIcons({ heroChevronRightMini, heroFolderMini, heroFolderOpenMini, heroDocumentMini }),
  ],
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
      width: 100%;
    }

    .hint {
      max-width: 24rem;
      text-align: center;
      font-size: 0.75rem;
      letter-spacing: -0.011em;
      color: var(--ngp-text-tertiary);
    }

    [ngpTree] {
      width: 100%;
      max-width: 20rem;
      margin: 0;
      padding: 0.375rem;
      list-style: none;
      border-radius: 0.75rem;
      border: 1px solid var(--ngp-border);
      background-color: var(--ngp-background);
      box-shadow: var(--ngp-shadow);
      outline: none;
    }

    [ngpTreeNode] {
      position: relative;
      display: flex;
      align-items: center;
      gap: 0.375rem;
      padding-left: calc((var(--ngp-tree-node-level) - 1) * 1.125rem + 0.375rem);
      padding-right: 0.5rem;
      height: 2rem;
      border-radius: 0.5rem;
      font-size: 0.875rem;
      letter-spacing: -0.006em;
      color: var(--ngp-text-primary);
      cursor: grab;
      user-select: none;
      outline: none;
    }

    [ngpTreeNode]:hover {
      background-color: var(--ngp-background-hover);
    }

    [ngpTreeNode]:focus-visible {
      box-shadow: 0 0 0 2px var(--ngp-focus-ring);
    }

    /* Selected rows (click, Ctrl/Cmd-click, Shift-click). */
    [ngpTreeNode][data-selected] {
      background-color: color-mix(in srgb, var(--ngp-primary) 10%, transparent);
      color: var(--ngp-text-primary);
    }

    [ngpTreeNode][data-dragging] {
      opacity: 0.35;
    }

    /* Nodes marked for a cut/paste move: dimmed with a dashed outline. */
    [ngpTreeNode][data-cut] {
      opacity: 0.55;
      outline: 1px dashed var(--ngp-border);
      outline-offset: -1px;
    }

    /* Drop "into" a folder: soft accent fill + ring, matching the row radius. */
    [ngpTreeNode][data-drop-position='inside'] {
      background-color: color-mix(in srgb, var(--ngp-primary) 12%, transparent);
      box-shadow: inset 0 0 0 1.5px var(--ngp-primary);
    }

    /* Reorder before/after: a line aligned to the node's content, with a leading dot. */
    [ngpTreeNode][data-drop-position='before']::after,
    [ngpTreeNode][data-drop-position='after']::after {
      content: '';
      position: absolute;
      left: calc((var(--ngp-tree-node-level) - 1) * 1.125rem + 0.375rem);
      right: 0.5rem;
      height: 1.5px;
      border-radius: 1px;
      background-color: var(--ngp-primary);
      box-shadow:
        -3px 0 0 -1px var(--ngp-background),
        -3px 0 0 0.5px var(--ngp-primary);
    }

    [ngpTreeNode][data-drop-position='before']::after {
      top: -1px;
    }

    [ngpTreeNode][data-drop-position='after']::after {
      bottom: -1px;
    }

    [ngpTreeNodeToggle] {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex: none;
      width: 1.125rem;
      height: 1.125rem;
      padding: 0;
      border: none;
      border-radius: 0.25rem;
      background: transparent;
      color: var(--ngp-text-tertiary);
      cursor: pointer;
    }

    [ngpTreeNodeToggle] ng-icon {
      font-size: 1rem;
      transition: transform 150ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    [ngpTreeNodeToggle][data-expanded] ng-icon {
      transform: rotate(90deg);
    }

    .spacer {
      flex: none;
      width: 1.125rem;
      height: 1.125rem;
    }

    .node-icon {
      flex: none;
      font-size: 1.125rem;
      color: var(--ngp-text-tertiary);
    }
  `,
  template: `
    <ul
      #tree="ngpTree"
      [ngpTreeNodes]="nodes()"
      [ngpTreeItemChildren]="children"
      [ngpTreeItemValue]="itemValue"
      [ngpTreeItemLabel]="itemLabel"
      [ngpTreeDefaultExpandedKeys]="expanded"
      [ngpTreeCanDrop]="canDrop"
      [ngpTreeOnDrop]="onDrop"
      ngpTreeSelectionMode="multiple"
      ngpTree
    >
      @for (node of tree.visibleNodes(); track itemValue(node)) {
        <li #n="ngpTreeNode" [ngpTreeNode]="node" ngpTreeNode>
          @if (n.expandable()) {
            <button [attr.data-expanded]="n.expanded() ? '' : null" ngpTreeNodeToggle>
              <ng-icon name="heroChevronRightMini" />
            </button>
          } @else {
            <span class="spacer"></span>
          }
          <ng-icon
            class="node-icon"
            [name]="
              node.folder
                ? n.expanded()
                  ? 'heroFolderOpenMini'
                  : 'heroFolderMini'
                : 'heroDocumentMini'
            "
          />
          <span>{{ node.name }}</span>
        </li>
      }
    </ul>

    <p class="hint">
      Click to select, ⌘/Ctrl-click for multiple. Drag to move, or cut & paste with ⌘/Ctrl+X then V.
    </p>
  `,
})
export default class TreeDndExample {
  readonly nodes = signal<FileNode[]>([
    {
      id: 'src',
      name: 'src',
      folder: true,
      children: [
        { id: 'app.ts', name: 'app.ts' },
        { id: 'main.ts', name: 'main.ts' },
        { id: 'styles.css', name: 'styles.css' },
      ],
    },
    {
      id: 'assets',
      name: 'assets',
      folder: true,
      children: [{ id: 'logo.svg', name: 'logo.svg' }],
    },
    { id: 'package.json', name: 'package.json' },
    { id: 'readme', name: 'README.md' },
  ]);

  readonly expanded = new Set(['src', 'assets']);

  readonly children = (node: FileNode) => node.children;
  readonly itemValue = (node: FileNode) => node.id;
  readonly itemLabel = (node: FileNode) => node.name;

  // Only folders can receive a node dropped "inside" them; files can only be
  // reordered before/after.
  readonly canDrop = ({ target, position }: NgpTreeDropEvent<FileNode>): boolean =>
    position !== 'inside' || !!target.folder;

  readonly onDrop = ({ sources, target, position }: NgpTreeDropEvent<FileNode>): void => {
    const data = structuredClone(this.nodes());
    const moved = sources
      .map(source => extract(data, source.id))
      .filter((node): node is FileNode => node !== null);
    if (moved.length === 0) {
      return;
    }

    if (position === 'inside') {
      const parent = find(data, target.id);
      if (parent) {
        parent.children = [...moved, ...(parent.children ?? [])];
      }
    } else {
      const at = locate(data, target.id);
      if (at) {
        at.list.splice(position === 'before' ? at.index : at.index + 1, 0, ...moved);
      }
    }

    this.nodes.set(data);
  };
}
