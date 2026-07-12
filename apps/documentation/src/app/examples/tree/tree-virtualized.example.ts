import {
  CdkFixedSizeVirtualScroll,
  CdkVirtualForOf,
  CdkVirtualScrollViewport,
} from '@angular/cdk/scrolling';
import { Component } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroChevronRightMini, heroFolderMini, heroFolderOpenMini } from '@ng-icons/heroicons/mini';
import { NgpTree, NgpTreeNode, NgpTreeNodeToggle } from 'ng-primitives/tree';

interface Node {
  id: string;
  name: string;
  children?: Node[];
}

/** Build a wide, deep tree (thousands of nodes) to show virtualization. */
function generate(): Node[] {
  const roots: Node[] = [];
  for (let a = 0; a < 40; a++) {
    const group: Node = { id: `g${a}`, name: `Group ${a + 1}`, children: [] };
    for (let b = 0; b < 40; b++) {
      group.children!.push({ id: `g${a}-i${b}`, name: `Item ${a + 1}.${b + 1}` });
    }
    roots.push(group);
  }
  return roots;
}

@Component({
  selector: 'app-tree-virtualized',
  imports: [
    NgpTree,
    NgpTreeNode,
    NgpTreeNodeToggle,
    NgIcon,
    CdkVirtualScrollViewport,
    CdkFixedSizeVirtualScroll,
    CdkVirtualForOf,
  ],
  providers: [provideIcons({ heroChevronRightMini, heroFolderMini, heroFolderOpenMini })],
  styles: `
    :host {
      display: flex;
      justify-content: center;
      width: 100%;
    }

    [ngpTree] {
      width: 100%;
      max-width: 20rem;
      height: 20rem;
      padding: 0.375rem;
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
      box-sizing: border-box;
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

    .node-icon {
      flex: none;
      font-size: 1.125rem;
      color: var(--ngp-text-tertiary);
    }
  `,
  template: `
    <cdk-virtual-scroll-viewport
      #tree="ngpTree"
      [ngpTreeNodes]="nodes"
      [ngpTreeChildren]="children"
      [ngpTreeItemValue]="itemValue"
      [ngpTreeItemLabel]="itemLabel"
      ngpTree
      itemSize="32"
    >
      <li
        #n="ngpTreeNode"
        *cdkVirtualFor="let node of tree.visibleNodes()"
        [ngpTreeNode]="node"
        ngpTreeNode
      >
        @if (n.expandable()) {
          <button [attr.data-expanded]="n.expanded() ? '' : null" ngpTreeNodeToggle>
            <ng-icon name="heroChevronRightMini" />
          </button>
        } @else {
          <span class="spacer"></span>
        }
        <ng-icon
          class="node-icon"
          [name]="n.expandable() ? (n.expanded() ? 'heroFolderOpenMini' : 'heroFolderMini') : ''"
        />
        <span>{{ node.name }}</span>
      </li>
    </cdk-virtual-scroll-viewport>
  `,
})
export default class TreeVirtualizedExample {
  readonly nodes = generate();
  readonly children = (node: Node) => node.children;
  readonly itemValue = (node: Node) => node.id;
  readonly itemLabel = (node: Node) => node.name;
}
