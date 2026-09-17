import { Component } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroChevronRightMini,
  heroDocumentMini,
  heroFolderMini,
  heroFolderOpenMini,
  heroLockClosedMini,
} from '@ng-icons/heroicons/mini';
import { NgpTree, NgpTreeNode, NgpTreeNodeToggle } from 'ng-primitives/tree';

interface FileNode {
  id: string;
  name: string;
  locked?: boolean;
  children?: FileNode[];
}

@Component({
  selector: 'app-tree-disabled',
  imports: [NgpTree, NgpTreeNode, NgpTreeNodeToggle, NgIcon],
  providers: [
    provideIcons({
      heroChevronRightMini,
      heroFolderMini,
      heroFolderOpenMini,
      heroDocumentMini,
      heroLockClosedMini,
    }),
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
      cursor: pointer;
      user-select: none;
      outline: none;
    }

    [ngpTreeNode][data-hover] {
      background-color: var(--ngp-background-hover);
    }

    [ngpTreeNode][data-focus-visible] {
      box-shadow: 0 0 0 2px var(--ngp-focus-ring);
    }

    [ngpTreeNode][data-disabled] {
      color: var(--ngp-text-disabled);
      cursor: not-allowed;
    }

    [ngpTreeNode][data-disabled][data-hover] {
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
      cursor: inherit;
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

    .trailing {
      margin-left: auto;
      font-size: 1rem;
      color: var(--ngp-text-tertiary);
    }
  `,
  template: `
    <ul
      #tree="ngpTree"
      [ngpTreeNodes]="nodes"
      [ngpTreeItemChildren]="children"
      [ngpTreeItemValue]="itemValue"
      [ngpTreeItemLabel]="itemLabel"
      [ngpTreeItemDisabled]="itemDisabled"
      [ngpTreeDefaultExpandedKeys]="expanded"
      ngpTree
    >
      @for (node of tree.visibleNodes(); track itemValue(node)) {
        <li #n="ngpTreeNode" [ngpTreeNode]="node" ngpTreeNode>
          @if (n.expandable()) {
            <button ngpTreeNodeToggle>
              <ng-icon name="heroChevronRightMini" />
            </button>
          } @else {
            <span class="spacer"></span>
          }
          <ng-icon
            class="node-icon"
            [name]="
              n.expandable()
                ? n.expanded()
                  ? 'heroFolderOpenMini'
                  : 'heroFolderMini'
                : 'heroDocumentMini'
            "
          />
          <span>{{ node.name }}</span>
          @if (node.locked) {
            <ng-icon class="trailing" name="heroLockClosedMini" />
          }
        </li>
      }
    </ul>
  `,
})
export default class TreeDisabledExample {
  readonly nodes: FileNode[] = [
    {
      id: 'src',
      name: 'src',
      children: [
        { id: 'index.ts', name: 'index.ts' },
        { id: 'secrets.ts', name: 'secrets.ts', locked: true },
      ],
    },
    {
      id: 'node_modules',
      name: 'node_modules',
      locked: true,
      children: [{ id: 'dep', name: 'some-dependency' }],
    },
    { id: 'package.json', name: 'package.json' },
  ];

  readonly expanded = new Set(['src']);

  readonly children = (node: FileNode) => node.children;
  readonly itemValue = (node: FileNode) => node.id;
  readonly itemLabel = (node: FileNode) => node.name;
  readonly itemDisabled = (node: FileNode) => node.locked === true;
}
