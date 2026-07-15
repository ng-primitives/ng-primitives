import { Component, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroChevronRightMini,
  heroDocumentMini,
  heroFolderMini,
  heroFolderOpenMini,
  heroMagnifyingGlassMini,
} from '@ng-icons/heroicons/mini';
import { NgpTree, NgpTreeNode, NgpTreeNodeToggle } from 'ng-primitives/tree';

interface FileNode {
  id: string;
  name: string;
  folder?: boolean;
  children?: FileNode[];
}

@Component({
  selector: 'app-tree-search',
  imports: [NgpTree, NgpTreeNode, NgpTreeNodeToggle, NgIcon],
  providers: [
    provideIcons({
      heroChevronRightMini,
      heroFolderMini,
      heroFolderOpenMini,
      heroDocumentMini,
      heroMagnifyingGlassMini,
    }),
  ],
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      width: 100%;
    }

    .container {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      width: 100%;
      max-width: 20rem;
    }

    .search {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0 0.625rem;
      height: 2.25rem;
      border-radius: 0.625rem;
      border: 1px solid var(--ngp-border);
      background-color: var(--ngp-background);
    }

    .search:focus-within {
      box-shadow: 0 0 0 2px var(--ngp-focus-ring);
      border-color: transparent;
    }

    .search ng-icon {
      flex: none;
      font-size: 1.125rem;
      color: var(--ngp-text-tertiary);
    }

    .search input {
      flex: 1 1 auto;
      min-width: 0;
      border: none;
      background: none;
      outline: none;
      font-size: 0.875rem;
      letter-spacing: -0.006em;
      color: var(--ngp-text-primary);
    }

    .search input::placeholder {
      color: var(--ngp-text-tertiary);
    }

    [ngpTree] {
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
      outline: none;
    }

    [ngpTreeNode][data-hover] {
      background-color: var(--ngp-background-hover);
    }

    [ngpTreeNode][data-focus-visible] {
      box-shadow: 0 0 0 2px var(--ngp-focus-ring);
    }

    /* Highlight rows that match the query. */
    [ngpTreeNode][data-matched] {
      font-weight: 590;
    }

    [ngpTreeNode][data-matched] .node-icon {
      color: var(--ngp-primary);
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

    .empty {
      padding: 1rem;
      text-align: center;
      font-size: 0.8125rem;
      color: var(--ngp-text-tertiary);
    }
  `,
  template: `
    <div class="container">
      <div class="search">
        <ng-icon name="heroMagnifyingGlassMini" />
        <input
          [value]="query()"
          (input)="query.set($any($event.target).value)"
          type="text"
          placeholder="Search files..."
        />
      </div>

      <ul
        #tree="ngpTree"
        [ngpTreeNodes]="nodes"
        [ngpTreeItemChildren]="children"
        [ngpTreeItemValue]="itemValue"
        [ngpTreeItemLabel]="itemLabel"
        [ngpTreeDefaultExpandedKeys]="expanded"
        [ngpTreeQuery]="query()"
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
        @if (tree.visibleNodes().length === 0) {
          <p class="empty">No files match "{{ query() }}"</p>
        }
      </ul>
    </div>
  `,
})
export default class TreeSearchExample {
  readonly query = signal('');

  readonly nodes: FileNode[] = [
    {
      id: 'src',
      name: 'src',
      folder: true,
      children: [
        {
          id: 'components',
          name: 'components',
          folder: true,
          children: [
            { id: 'button.ts', name: 'button.ts' },
            { id: 'input.ts', name: 'input.ts' },
          ],
        },
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
  ];

  readonly expanded = new Set(['src']);

  readonly children = (node: FileNode) => node.children;
  readonly itemValue = (node: FileNode) => node.id;
  readonly itemLabel = (node: FileNode) => node.name;
}
