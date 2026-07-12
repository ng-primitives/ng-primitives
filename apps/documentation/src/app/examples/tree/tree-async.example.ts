import { Component } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroArrowPathMini,
  heroChevronRightMini,
  heroDocumentMini,
  heroFolderMini,
  heroFolderOpenMini,
} from '@ng-icons/heroicons/mini';
import { NgpTree, NgpTreeNode, NgpTreeNodeToggle } from 'ng-primitives/tree';

interface RemoteNode {
  id: string;
  name: string;
  folder?: boolean;
  children?: RemoteNode[];
}

let counter = 0;

@Component({
  selector: 'app-tree-async',
  imports: [NgpTree, NgpTreeNode, NgpTreeNodeToggle, NgIcon],
  providers: [
    provideIcons({
      heroChevronRightMini,
      heroFolderMini,
      heroFolderOpenMini,
      heroDocumentMini,
      heroArrowPathMini,
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

    .spinner {
      flex: none;
      display: inline-flex;
      width: 1.125rem;
      height: 1.125rem;
      align-items: center;
      justify-content: center;
      color: var(--ngp-text-tertiary);
    }

    .spinner ng-icon {
      font-size: 1rem;
      animation: spin 0.7s linear infinite;
    }

    .node-icon {
      flex: none;
      font-size: 1.125rem;
      color: var(--ngp-text-tertiary);
    }

    .retry {
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

    .retry ng-icon {
      font-size: 1rem;
    }

    .error-text {
      margin-left: auto;
      font-size: 0.75rem;
      letter-spacing: -0.011em;
      color: var(--ngp-text-tertiary);
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
  `,
  template: `
    <ul
      #tree="ngpTree"
      [ngpTreeNodes]="nodes"
      [ngpTreeItemChildren]="children"
      [ngpTreeItemValue]="itemValue"
      [ngpTreeItemLabel]="itemLabel"
      [ngpTreeItemExpandable]="isExpandable"
      [ngpTreeItemLoadChildren]="loadChildren"
      ngpTree
    >
      @for (node of tree.visibleNodes(); track itemValue(node)) {
        <li #n="ngpTreeNode" [ngpTreeNode]="node" ngpTreeNode>
          @if (n.loading()) {
            <span class="spinner"><ng-icon name="heroArrowPathMini" /></span>
          } @else if (n.loadError()) {
            <button class="retry" (click)="n.reload()" aria-label="Retry loading">
              <ng-icon name="heroArrowPathMini" />
            </button>
          } @else if (n.expandable()) {
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
          @if (n.loadError()) {
            <span class="error-text">Couldn't load</span>
          }
        </li>
      }
    </ul>
  `,
})
export default class TreeAsyncExample {
  readonly nodes: RemoteNode[] = [
    { id: 'documents', name: 'Documents', folder: true },
    { id: 'photos', name: 'Photos', folder: true },
    { id: 'readme', name: 'README.md' },
  ];

  readonly children = (node: RemoteNode) => node.children;
  readonly itemValue = (node: RemoteNode) => node.id;
  readonly itemLabel = (node: RemoteNode) => node.name;
  readonly isExpandable = (node: RemoteNode) => node.folder === true;

  // Tracks which folders have already failed once, so the retry can succeed.
  private readonly failedOnce = new Set<string>();

  // Simulate a network request that resolves after a short delay - and fails the
  // first time "Photos" is opened to show the error/retry state.
  readonly loadChildren = (node: RemoteNode): Promise<RemoteNode[]> =>
    new Promise((resolve, reject) =>
      setTimeout(() => {
        if (node.id === 'photos' && !this.failedOnce.has(node.id)) {
          this.failedOnce.add(node.id);
          reject(new Error('Network error'));
          return;
        }
        const folder = counter++ % 2 === 0;
        resolve([
          { id: `${node.id}-a`, name: folder ? 'Subfolder' : 'file-a.txt', folder },
          { id: `${node.id}-b`, name: 'file-b.txt' },
          { id: `${node.id}-c`, name: 'file-c.txt' },
        ]);
      }, 700),
    );
}
