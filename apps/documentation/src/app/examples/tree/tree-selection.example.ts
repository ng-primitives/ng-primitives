import { Component, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroChevronRightMini,
  heroFolderMini,
  heroFolderOpenMini,
  heroHashtagMini,
} from '@ng-icons/heroicons/mini';
import { NgpTree, NgpTreeNode, NgpTreeNodeToggle } from 'ng-primitives/tree';

interface Item {
  id: string;
  name: string;
  children?: Item[];
}

@Component({
  selector: 'app-tree-selection',
  imports: [NgpTree, NgpTreeNode, NgpTreeNodeToggle, NgIcon],
  providers: [
    provideIcons({ heroChevronRightMini, heroFolderMini, heroFolderOpenMini, heroHashtagMini }),
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
      transition: background-color 150ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    [ngpTreeNode]:hover {
      background-color: var(--ngp-background-hover);
    }

    [ngpTreeNode]:focus-visible {
      box-shadow: 0 0 0 2px var(--ngp-focus-ring);
    }

    /* Explorer-style selection: the whole row is highlighted with the brand accent. */
    [ngpTreeNode][data-selected] {
      background-color: color-mix(in srgb, var(--ngp-primary) 14%, transparent);
    }

    [ngpTreeNode][data-selected]:hover {
      background-color: color-mix(in srgb, var(--ngp-primary) 20%, transparent);
    }

    [ngpTreeNode][data-selected] .node-icon {
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

    .count {
      font-size: 0.8125rem;
      color: var(--ngp-text-secondary);
    }
  `,
  template: `
    <ul
      #tree="ngpTree"
      [(ngpTreeSelectedKeys)]="selected"
      [ngpTreeNodes]="nodes"
      [ngpTreeItemChildren]="children"
      [ngpTreeItemValue]="itemValue"
      [ngpTreeItemLabel]="itemLabel"
      [ngpTreeDefaultExpandedKeys]="expanded"
      ngpTree
      ngpTreeSelectionMode="multiple"
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
                : 'heroHashtagMini'
            "
          />
          <span>{{ node.name }}</span>
        </li>
      }
    </ul>

    <p class="count">{{ selected().size }} selected</p>
  `,
})
export default class TreeSelectionExample {
  readonly nodes: Item[] = [
    {
      id: 'frontend',
      name: 'Frontend',
      children: [
        { id: 'angular', name: 'Angular' },
        { id: 'react', name: 'React' },
        { id: 'vue', name: 'Vue' },
      ],
    },
    {
      id: 'backend',
      name: 'Backend',
      children: [
        { id: 'node', name: 'Node.js' },
        { id: 'go', name: 'Go' },
      ],
    },
    { id: 'devops', name: 'DevOps' },
  ];

  readonly expanded = new Set(['frontend', 'backend']);
  readonly selected = signal<ReadonlySet<string>>(new Set(['angular']));

  readonly children = (node: Item) => node.children;
  readonly itemValue = (node: Item) => node.id;
  readonly itemLabel = (node: Item) => node.name;
}
