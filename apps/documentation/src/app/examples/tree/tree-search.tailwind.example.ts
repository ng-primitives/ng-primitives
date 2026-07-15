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
  host: { class: 'flex w-full flex-col items-center gap-2' },
  template: `
    <div class="flex w-full max-w-80 flex-col gap-2">
      <div
        class="flex h-9 items-center gap-1.5 rounded-[0.625rem] border border-gray-200 bg-white px-2.5 focus-within:border-transparent focus-within:ring-2 focus-within:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-950 dark:focus-within:ring-blue-400"
      >
        <ng-icon
          class="flex-none text-[1.125rem] text-gray-400 dark:text-zinc-500"
          name="heroMagnifyingGlassMini"
        />
        <input
          class="min-w-0 flex-1 border-none bg-transparent text-sm tracking-[-0.006em] text-gray-900 outline-none placeholder:text-gray-400 dark:text-zinc-100 dark:placeholder:text-zinc-500"
          [value]="query()"
          (input)="query.set($any($event.target).value)"
          type="text"
          placeholder="Search files..."
        />
      </div>

      <ul
        class="m-0 w-full list-none rounded-xl border border-gray-200 bg-white p-1.5 shadow-sm outline-none dark:border-zinc-800 dark:bg-zinc-950"
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
          <li
            class="group relative flex h-8 items-center gap-1.5 rounded-lg pr-2 pl-[calc((var(--ngp-tree-node-level)-1)*1.125rem+0.375rem)] text-sm tracking-[-0.006em] text-gray-900 outline-none data-focus-visible:ring-2 data-focus-visible:ring-blue-500 data-hover:bg-gray-100 data-matched:font-[590] dark:text-zinc-100 dark:data-focus-visible:ring-blue-400 dark:data-hover:bg-zinc-900"
            #n="ngpTreeNode"
            [ngpTreeNode]="node"
            ngpTreeNode
          >
            @if (n.expandable()) {
              <button
                class="group/toggle inline-flex h-[1.125rem] w-[1.125rem] flex-none cursor-pointer items-center justify-center rounded border-none bg-transparent p-0 text-gray-400 dark:text-zinc-500"
                ngpTreeNodeToggle
              >
                <ng-icon
                  class="text-base transition-transform duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] group-data-expanded/toggle:rotate-90"
                  name="heroChevronRightMini"
                />
              </button>
            } @else {
              <span class="h-[1.125rem] w-[1.125rem] flex-none"></span>
            }
            <ng-icon
              class="flex-none text-[1.125rem] text-gray-400 group-data-matched:text-[#f01e2b] dark:text-zinc-500 dark:group-data-matched:text-[#ff4651]"
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
          <p class="p-4 text-center text-[0.8125rem] text-gray-400 dark:text-zinc-500">
            No files match "{{ query() }}"
          </p>
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
