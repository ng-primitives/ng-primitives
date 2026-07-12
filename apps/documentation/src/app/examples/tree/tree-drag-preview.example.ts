import { Component, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroChevronRightMini,
  heroDocumentMini,
  heroFolderMini,
  heroFolderOpenMini,
} from '@ng-icons/heroicons/mini';
import {
  NgpTree,
  NgpTreeDragPreview,
  NgpTreeDropEvent,
  NgpTreeNode,
  NgpTreeNodeToggle,
} from 'ng-primitives/tree';

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
    const found = list[i].children && extract(list[i].children!, id);
    if (found) {
      return found;
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
    const found = list[i].children && locate(list[i].children!, id);
    if (found) {
      return found;
    }
  }
  return null;
}

/** Find the node with `id`. */
function find(list: FileNode[], id: string): FileNode | null {
  for (const node of list) {
    if (node.id === id) {
      return node;
    }
    const found = node.children && find(node.children, id);
    if (found) {
      return found;
    }
  }
  return null;
}

@Component({
  selector: 'app-tree-drag-preview',
  imports: [NgpTree, NgpTreeNode, NgpTreeNodeToggle, NgpTreeDragPreview, NgIcon],
  providers: [
    provideIcons({ heroChevronRightMini, heroFolderMini, heroFolderOpenMini, heroDocumentMini }),
  ],
  styles: `
    :host {
      display: flex;
      justify-content: center;
      width: 100%;
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

    [ngpTreeNode][data-dragging] {
      opacity: 0.35;
    }

    [ngpTreeNode][data-drop-position='inside'] {
      background-color: color-mix(in srgb, var(--ngp-primary) 12%, transparent);
      box-shadow: inset 0 0 0 1.5px var(--ngp-primary);
    }

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

    /* A bespoke, elevated preview instead of the default row clone. */
    .preview {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.375rem 0.75rem;
      font-size: 0.8125rem;
      font-weight: 510;
      letter-spacing: -0.006em;
      color: var(--ngp-primary-text);
      background-color: var(--ngp-primary);
      border-radius: 9999px;
      box-shadow: 0 8px 24px -6px rgba(0, 0, 0, 0.35);
      transform: rotate(-2deg);
    }

    .preview ng-icon {
      font-size: 1rem;
    }
  `,
  template: `
    <ul
      #tree="ngpTree"
      [ngpTreeNodes]="nodes()"
      [ngpTreeChildren]="children"
      [ngpTreeItemValue]="itemValue"
      [ngpTreeItemLabel]="itemLabel"
      [ngpTreeDefaultExpandedKeys]="expanded"
      [ngpTreeCanDrop]="canDrop"
      [ngpTreeOnDrop]="onDrop"
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

      <!-- Custom floating preview: a red pill instead of the default row clone. -->
      <ng-template ngpTreeDragPreview let-node>
        <div class="preview">
          <ng-icon [name]="node.folder ? 'heroFolderMini' : 'heroDocumentMini'" />
          {{ node.name }}
        </div>
      </ng-template>
    </ul>
  `,
})
export default class TreeDragPreviewExample {
  readonly nodes = signal<FileNode[]>([
    {
      id: 'src',
      name: 'src',
      folder: true,
      children: [
        { id: 'app.ts', name: 'app.ts' },
        { id: 'main.ts', name: 'main.ts' },
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
