import { Component } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroChevronRightMini,
  heroDocumentMini,
  heroFolderMini,
  heroFolderOpenMini,
} from '@ng-icons/heroicons/mini';
import { NgpTree, NgpTreeNode, NgpTreeNodeToggle } from 'ng-primitives/tree';

interface FileNode {
  id: string;
  name: string;
  children?: FileNode[];
}

@Component({
  selector: 'app-tree-indent-guides',
  imports: [NgpTree, NgpTreeNode, NgpTreeNodeToggle, NgIcon],
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
      --indent: 1.25rem;
      /* half the toggle/spacer width, so guides sit under each toggle column */
      --toggle-half: 0.5625rem;
    }

    [ngpTreeNode] {
      position: relative;
      display: flex;
      align-items: center;
      gap: 0.375rem;
      padding-left: calc(var(--ngp-tree-node-level) * var(--indent));
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

    /* One vertical guide per ancestor level, each centered under that ancestor's
       toggle column. The gutter starts one indent in (roots have no guide) and a
       1px line is drawn at the toggle centre of every indent step. */
    [ngpTreeNode]::before {
      content: '';
      position: absolute;
      inset-block: 0;
      left: var(--indent);
      width: calc((var(--ngp-tree-node-level) - 1) * var(--indent));
      background-image: repeating-linear-gradient(
        to right,
        transparent 0,
        transparent var(--toggle-half),
        var(--ngp-border) var(--toggle-half),
        var(--ngp-border) calc(var(--toggle-half) + 1px),
        transparent calc(var(--toggle-half) + 1px),
        transparent var(--indent)
      );
      pointer-events: none;
    }

    [ngpTreeNode]:hover {
      background-color: var(--ngp-background-hover);
    }

    [ngpTreeNode]:focus-visible {
      box-shadow: 0 0 0 2px var(--ngp-focus-ring);
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
      [ngpTreeNodes]="nodes"
      [ngpTreeItemChildren]="children"
      [ngpTreeItemValue]="itemValue"
      [ngpTreeItemLabel]="itemLabel"
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
        </li>
      }
    </ul>
  `,
})
export default class TreeIndentGuidesExample {
  readonly nodes: FileNode[] = [
    {
      id: 'src',
      name: 'src',
      children: [
        {
          id: 'app',
          name: 'app',
          children: [
            {
              id: 'components',
              name: 'components',
              children: [{ id: 'button.ts', name: 'button.ts' }],
            },
            { id: 'app.ts', name: 'app.ts' },
          ],
        },
        { id: 'main.ts', name: 'main.ts' },
      ],
    },
    { id: 'package.json', name: 'package.json' },
  ];

  readonly expanded = new Set(['src', 'app', 'components']);

  readonly children = (node: FileNode) => node.children;
  readonly itemValue = (node: FileNode) => node.id;
  readonly itemLabel = (node: FileNode) => node.name;
}
