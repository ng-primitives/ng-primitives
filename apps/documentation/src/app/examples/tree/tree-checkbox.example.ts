import { Component, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroCheckMini, heroChevronRightMini, heroMinusMini } from '@ng-icons/heroicons/mini';
import { NgpTree, NgpTreeNode, NgpTreeNodeCheckbox, NgpTreeNodeToggle } from 'ng-primitives/tree';

interface Item {
  id: string;
  name: string;
  children?: Item[];
}

@Component({
  selector: 'app-tree-checkbox',
  imports: [NgpTree, NgpTreeNode, NgpTreeNodeToggle, NgpTreeNodeCheckbox, NgIcon],
  providers: [provideIcons({ heroChevronRightMini, heroCheckMini, heroMinusMini })],
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
      gap: 0.5rem;
      padding-left: calc((var(--ngp-tree-node-level) - 1) * 1.25rem + 0.375rem);
      padding-right: 0.5rem;
      height: 2rem;
      border-radius: 0.5rem;
      font-size: 0.875rem;
      letter-spacing: -0.006em;
      color: var(--ngp-text-primary);
      user-select: none;
      outline: none;
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

    /* Checkbox: brand red for checked / indeterminate. */
    [ngpTreeNodeCheckbox] {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex: none;
      width: 1.125rem;
      height: 1.125rem;
      padding: 0;
      border-radius: 0.3125rem;
      border: 1.5px solid var(--ngp-border);
      background: var(--ngp-background);
      color: transparent;
      cursor: pointer;
      transition:
        background-color 150ms cubic-bezier(0.4, 0, 0.2, 1),
        border-color 150ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    [ngpTreeNodeCheckbox][data-checked],
    [ngpTreeNodeCheckbox][data-indeterminate] {
      background-color: var(--ngp-primary);
      border-color: var(--ngp-primary);
      color: var(--ngp-primary-text);
    }

    [ngpTreeNodeCheckbox] ng-icon {
      font-size: 0.875rem;
    }
  `,
  template: `
    <ul
      #tree="ngpTree"
      [(ngpTreeCheckedKeys)]="checked"
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
            <button [attr.data-expanded]="n.expanded() ? '' : null" ngpTreeNodeToggle>
              <ng-icon name="heroChevronRightMini" />
            </button>
          } @else {
            <span class="spacer"></span>
          }
          <button ngpTreeNodeCheckbox>
            @if (n.indeterminate()) {
              <ng-icon name="heroMinusMini" />
            } @else if (n.checked()) {
              <ng-icon name="heroCheckMini" />
            }
          </button>
          <span>{{ node.name }}</span>
        </li>
      }
    </ul>
  `,
})
export default class TreeCheckboxExample {
  readonly nodes: Item[] = [
    {
      id: 'src',
      name: 'src',
      children: [
        { id: 'app.ts', name: 'app.ts' },
        { id: 'main.ts', name: 'main.ts' },
        {
          id: 'utils',
          name: 'utils',
          children: [
            { id: 'dates.ts', name: 'dates.ts' },
            { id: 'strings.ts', name: 'strings.ts' },
          ],
        },
      ],
    },
    { id: 'readme', name: 'README.md' },
  ];

  readonly expanded = new Set(['src', 'utils']);
  readonly checked = signal<ReadonlySet<string>>(new Set(['app.ts']));

  readonly children = (node: Item) => node.children;
  readonly itemValue = (node: Item) => node.id;
  readonly itemLabel = (node: Item) => node.name;
}
