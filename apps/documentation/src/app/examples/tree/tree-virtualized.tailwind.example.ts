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
  template: `
    <cdk-virtual-scroll-viewport
      class="mx-auto h-80 w-full max-w-80 rounded-xl border border-gray-200 bg-white p-1.5 shadow-sm outline-none dark:border-zinc-800 dark:bg-zinc-950"
      #tree="ngpTree"
      [ngpTreeNodes]="nodes"
      [ngpTreeItemChildren]="children"
      [ngpTreeItemValue]="itemValue"
      [ngpTreeItemLabel]="itemLabel"
      ngpTree
      itemSize="32"
    >
      <li
        class="box-border flex h-8 cursor-pointer items-center gap-1.5 rounded-lg pr-2 pl-[calc((var(--ngp-tree-node-level)-1)*1.125rem+0.375rem)] text-sm tracking-[-0.006em] text-gray-900 outline-none select-none hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-zinc-100 dark:hover:bg-zinc-900 dark:focus-visible:ring-blue-400"
        #n="ngpTreeNode"
        *cdkVirtualFor="let node of tree.visibleNodes()"
        [ngpTreeNode]="node"
        ngpTreeNode
      >
        @if (n.expandable()) {
          <button
            class="inline-flex h-[1.125rem] w-[1.125rem] flex-none cursor-pointer items-center justify-center rounded border-none bg-transparent p-0 text-gray-400 transition-transform duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] data-expanded:rotate-90 dark:text-zinc-500"
            ngpTreeNodeToggle
          >
            <ng-icon class="text-base" name="heroChevronRightMini" />
          </button>
        } @else {
          <span class="h-[1.125rem] w-[1.125rem] flex-none"></span>
        }
        @if (n.expandable()) {
          <ng-icon
            class="flex-none text-[1.125rem] text-gray-400 dark:text-zinc-500"
            [name]="n.expanded() ? 'heroFolderOpenMini' : 'heroFolderMini'"
          />
        } @else {
          <span class="h-[1.125rem] w-[1.125rem] flex-none"></span>
        }
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
