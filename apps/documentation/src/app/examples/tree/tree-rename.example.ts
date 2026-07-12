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
  NgpTreeNode,
  NgpTreeNodeRename,
  NgpTreeNodeToggle,
  NgpTreeRenameEvent,
} from 'ng-primitives/tree';

interface FileNode {
  id: string;
  name: string;
  folder?: boolean;
  children?: FileNode[];
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
  selector: 'app-tree-rename',
  imports: [NgpTree, NgpTreeNode, NgpTreeNodeToggle, NgpTreeNodeRename, NgIcon],
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
      user-select: none;
      outline: none;
    }

    [ngpTreeNode]:hover {
      background-color: var(--ngp-background-hover);
    }

    [ngpTreeNode]:focus-visible {
      box-shadow: 0 0 0 2px var(--ngp-focus-ring);
    }

    [ngpTreeNode][data-renaming] {
      background-color: transparent;
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

    .label {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    /* The inline edit field, sized to sit in the row seamlessly. */
    [ngpTreeNodeRename] {
      flex: 1 1 auto;
      min-width: 0;
      margin: 0;
      padding: 0 0.25rem;
      font: inherit;
      letter-spacing: inherit;
      color: var(--ngp-text-primary);
      background-color: var(--ngp-background);
      border: 1px solid var(--ngp-focus-ring);
      border-radius: 0.25rem;
      outline: none;
    }

    .hint {
      font-size: 0.75rem;
      letter-spacing: -0.011em;
      color: var(--ngp-text-tertiary);
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
      [ngpTreeOnRename]="onRename"
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
          @if (n.renaming()) {
            <input
              [value]="node.name"
              [attr.aria-label]="'Rename ' + node.name"
              ngpTreeNodeRename
            />
          } @else {
            <span class="label">{{ node.name }}</span>
          }
        </li>
      }
    </ul>

    <p class="hint">
      Double-click a row or press
      <kbd>F2</kbd>
      to rename. Enter saves, Escape cancels.
    </p>
  `,
})
export default class TreeRenameExample {
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
    { id: 'package.json', name: 'package.json' },
    { id: 'readme', name: 'README.md' },
  ]);

  readonly expanded = new Set(['src']);

  readonly children = (node: FileNode) => node.children;
  readonly itemValue = (node: FileNode) => node.id;
  readonly itemLabel = (node: FileNode) => node.name;

  readonly onRename = ({ node, value }: NgpTreeRenameEvent<FileNode>): void => {
    const data = structuredClone(this.nodes());
    const match = find(data, node.id);
    if (match) {
      match.name = value;
      this.nodes.set(data);
    }
  };
}
