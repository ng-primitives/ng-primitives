---
name: 'Tree'
sourceUrl: 'https://github.com/ng-primitives/ng-primitives/tree/next/packages/ng-primitives/tree'
---

# Tree

Present hierarchical data as an accessible, keyboard-navigable tree.

<docs-example name="tree"></docs-example>

## Import

Import the Tree primitives from `ng-primitives/tree`.

```ts
import {
  NgpTree,
  NgpTreeNode,
  NgpTreeNodeToggle,
  NgpTreeNodeCheckbox,
  NgpTreeNodeDragHandle,
  NgpTreeDragPreview,
  NgpTreeNodeRename,
} from 'ng-primitives/tree';
```

## Usage

The tree is **data-driven** and **flat-rendered**: you give it your nested data plus a
few accessors, and it exposes `visibleNodes()` - the flattened list of currently-visible
nodes. Render that list with a single `@for` (or `*cdkVirtualFor` to virtualize very large
trees) and place an `ngpTreeNode` on each row.

```html
<ul
  ngpTree
  #tree="ngpTree"
  [ngpTreeNodes]="nodes"
  [ngpTreeItemChildren]="children"
  [ngpTreeItemValue]="itemValue"
>
  @for (node of tree.visibleNodes(); track itemValue(node)) {
  <li ngpTreeNode #n="ngpTreeNode" [ngpTreeNode]="node">
    @if (n.expandable()) {
    <button ngpTreeNodeToggle>▶</button>
    } {{ node.name }}
  </li>
  }
</ul>
```

Each `ngpTreeNode` derives its `level`, `setsize`, `posinset` and `expanded` state from the
tree by its value, and exposes them as signals so you can branch on them. It also sets a
`--ngp-tree-node-level` CSS variable on the row, so you can indent purely in CSS:

```css
[ngpTreeNode] {
  padding-left: calc(var(--ngp-tree-node-level) * 1rem);
}
```

## Reusable Component

Create a reusable component that uses the `NgpTree` directives.

<docs-snippet name="tree"></docs-snippet>

## Schematics

Generate a reusable tree component using the Angular CLI.

```bash npm
ng g ng-primitives:primitive tree
```

### Options

- `path`: The path at which to create the component file.
- `prefix`: The prefix to apply to the generated component selector.
- `component-suffix`: The suffix to apply to the generated component class name.
- `file-suffix`: The suffix to apply to the generated component file name. Defaults to `component`.
- `example-styles`: Whether to include example styles in the generated component file. Defaults to `true`.

## Examples

Here are some additional examples of how to use the Tree primitives.

### Selection

Set `ngpTreeSelectionMode` to `single` or `multiple` and bind `[(ngpTreeSelectedKeys)]`.
With `ngpTreeSelectionBehavior="replace"` you get the desktop file-explorer model: a plain
click replaces the selection, the platform modifier (<kbd>⌘</kbd> on macOS, <kbd>Ctrl</kbd>
on Windows/Linux) toggles, and <kbd>Shift</kbd>-click selects a range. The default `toggle`
behavior toggles each item on plain click (checkbox/touch style). `ngpTreeSelectionBehavior`
applies to `multiple` mode - in `single` mode a plain click always replaces the selection,
while <kbd>⌘</kbd>/<kbd>Ctrl</kbd>-click or <kbd>Space</kbd> deselects the selected node.
<kbd>⌘</kbd>/<kbd>Ctrl</kbd>+<kbd>A</kbd> selects the currently **visible** nodes.

<docs-example name="tree-selection"></docs-example>

### Activating Nodes

Selecting a node and _activating_ it (opening a file, navigating to a route) are separate
intents. Handle the `(ngpTreeActivate)` output to react to activation: it emits the node on
<kbd>Enter</kbd>, and on a double-click when that node isn't renamable (so rename and
activate never collide). Activation is independent of selection, so it works even with no
`ngpTreeSelectionMode` set.

```html
<ul ngpTree ... (ngpTreeActivate)="open($event)">
  ...
</ul>
```

### Checkboxes

Add an `ngpTreeNodeCheckbox` to each row for a tri-state checkbox. Checking a parent
checks all of its leaf descendants; a parent shows `mixed` (indeterminate) when only some
are checked. Bind `[(ngpTreeCheckedKeys)]` to read the checked leaves. Pressing
<kbd>Space</kbd> on a row toggles its checkbox, so a checkbox tree stays fully
keyboard-operable even without a selection mode. The `treeitem` row itself carries
`aria-checked` (the APG checkbox-tree pattern); the checkbox element is decorative.

By default (`ngpTreeCheckboxBehavior="cascade"`) checking cascades to leaf descendants and
parents roll up to checked / indeterminate. Set `ngpTreeCheckboxBehavior="independent"`
(the `checkStrictly` model) to make every checkbox stand alone - no cascade, no
indeterminate state, and `checkedKeys` holds exactly the nodes you toggled.

<docs-example name="tree-checkbox"></docs-example>

### Drag & Drop

Set `ngpTreeItemDraggable` (to `true`, or a per-node predicate) to enable drag-and-drop reordering,
and handle the `(ngpTreeDrop)` event to move the node(s) in your own data. The tree computes a
`before` / `inside` / `after` drop position from the pointer, blocks dropping a node into its
own subtree, and exposes `n.dragging()` and `n.dropPosition()` (plus `data-dragging` /
`data-drop-position`) so you can render a drop indicator. Use `ngpTreeCanDrop` to validate a target;
the `(ngpTreeDrop)` payload carries `sources` (an array), so the same handler covers single and
multi-node moves.

When a selection is active, grabbing a selected node drags the whole selection (the preview shows a
count badge - restyle it via `[data-ngp-tree-drag-badge]`, or replace preview and badge entirely
with `ngpTreeDragPreview`). The move is also keyboard-accessible: <kbd>⌘</kbd>/<kbd>Ctrl</kbd>+<kbd>X</kbd> cuts the
focused node(s) (`n.cut()` / `data-cut`), then <kbd>⌘</kbd>/<kbd>Ctrl</kbd>+<kbd>V</kbd> pastes them
onto the focused node (inside a folder, otherwise after it); <kbd>Escape</kbd> clears the cut.
<kbd>Escape</kbd> also cancels an in-flight pointer drag. Hovering a collapsed folder while
dragging springs it open after a moment. On touch, a drag starts after a short long-press, so a
normal swipe still scrolls the list.

The `(ngpTreeDrop)` payload also reports `effect` and supports root drops. Holding
<kbd>Alt</kbd>/<kbd>Option</kbd> while dropping sets `effect` to `copy` (otherwise `move`) so you
can duplicate instead of relocate. Releasing over the tree's empty space drops onto the root - then
`target` is `null` (and the tree gets `data-root-drop` while hovering) - so you can move a nested
node back out to the top level.

By default a drag starts from anywhere on the row. Add an `ngpTreeNodeDragHandle` to a child
element to restrict the drag origin to that handle, leaving the rest of the row free for clicks,
links or inline controls:

```html
<li ngpTreeNode [ngpTreeNode]="node">
  <button ngpTreeNodeDragHandle aria-label="Drag">⠿</button>
  <span>{{ node.name }}</span>
</li>
```

<docs-example name="tree-dnd"></docs-example>

### Custom Drag Preview

While dragging, a floating preview follows the pointer - by default a pixel-identical clone of the
dragged row. To render your own, add an `<ng-template ngpTreeDragPreview let-node>` inside the tree;
it receives the dragged node as its implicit context.

<docs-example name="tree-drag-preview"></docs-example>

### Rename

Set `ngpTreeItemRenamable` (to `true`, or a per-node predicate) to enable inline renaming, and handle
the `(ngpTreeRename)` event to update the label in your data. Press <kbd>F2</kbd> on the focused node
or double-click a row to start editing; render an `<input ngpTreeNodeRename>` while `n.renaming()` is
true. The field auto-focuses and selects its text, commits on <kbd>Enter</kbd> or blur, and cancels
on <kbd>Escape</kbd> (an empty or unchanged value is treated as a cancel).

<docs-example name="tree-rename"></docs-example>

### Lazy Loading

Provide `ngpTreeItemLoadChildren` to fetch a node's children the first time it is expanded, and
`ngpTreeItemExpandable` so folders show a chevron before their contents exist. While loading, the
node reports `loading()` (and sets `aria-busy`). If the load rejects, the node reports
`loadError()` (and `data-load-error`) so you can show an error affordance; call `n.reload()` to
retry it in place.

<docs-example name="tree-async"></docs-example>

### Controlled Expansion

Bind the expanded set with `[(ngpTreeExpandedKeys)]` to drive expansion from your
component. The tree also exposes `expandAll()` / `collapseAll()` off its `ngpTree` template
reference - the "Expand all" / "Collapse all" buttons below call them directly.

<docs-example name="tree-controlled"></docs-example>

### Virtualized Tree

Because the tree renders a flat `visibleNodes()` list, you can swap `@for` for
`*cdkVirtualFor` inside a `cdk-virtual-scroll-viewport` to render only the visible rows -
this example scrolls thousands of nodes smoothly. Keyboard navigation scrolls the focused
row into view as you move. Note that <kbd>Home</kbd>/<kbd>End</kbd> and programmatic focus
(type-ahead, arrow-to-parent) can only reach rows the virtualizer has currently rendered - a
node scrolled far out of view is not in the DOM to receive focus.

<docs-example name="tree-virtualized"></docs-example>

### Disabled Nodes

Provide `ngpTreeItemDisabled` to mark nodes as disabled. By default (`ngpTreeDisabledBehavior="all"`)
they are fully inert - skipped by keyboard navigation, not expandable, and not selectable. Set
`ngpTreeDisabledBehavior="selection"` to keep them focusable and expandable while still blocking
selection and checkboxes.

<docs-example name="tree-disabled"></docs-example>

### Indent Guides

The `--ngp-tree-node-level` variable is enough to draw connecting guide lines purely in CSS.

<docs-example name="tree-indent-guides"></docs-example>

### Search

Bind `ngpTreeQuery` to a query string to filter the tree: non-matching nodes are hidden, but every
match keeps its ancestors visible (and auto-expanded) so it stays in context. Each node exposes
`n.matched()` (and `data-matched`) so you can highlight the hits. Provide `ngpTreeItemMatch` to
customise matching (it defaults to a case-insensitive `ngpTreeItemLabel` match).

<docs-example name="tree-search"></docs-example>

### Custom Content

The tree is data-agnostic - it works with any node shape and arbitrary row content, such as
this nested navigation with item counts. Double-click a leaf (or press <kbd>Enter</kbd>) to
activate it - `(ngpTreeActivate)` drives the highlighted "current" item.

<docs-example name="tree-navigation"></docs-example>

## API Reference

The following directives are available to import from the `ng-primitives/tree` package:

### NgpTree

<api-docs name="NgpTree"></api-docs>

<api-reference-props name="NgpTree"></api-reference-props>

### NgpTreeNode

<api-docs name="NgpTreeNode"></api-docs>

<api-reference-props name="NgpTreeNode"></api-reference-props>

<api-reference-attributes>
  <api-attribute name="role" description="Set to treeitem." />
  <api-attribute name="data-expanded" description="Applied when the node is expanded." />
  <api-attribute name="data-expandable" description="Applied when the node can be expanded." />
  <api-attribute name="data-disabled" description="Applied when the node is disabled." />
  <api-attribute name="data-selected" description="Applied when the node is selected." />
  <api-attribute name="data-loading" description="Applied while the node's children are lazily loading." />
  <api-attribute name="data-load-error" description="Applied when the node's last lazy load failed." />
  <api-attribute name="data-dragging" description="Applied while the node is being dragged." />
  <api-attribute name="data-drop-target" description="Applied while this node is the current drop target." />
  <api-attribute name="data-drop-position" description="The drop position when the node is the drop target." value="before | inside | after" />
  <api-attribute name="data-renaming" description="Applied while the node is being renamed." />
  <api-attribute name="data-cut" description="Applied while the node is marked for a cut/paste move." />
  <api-attribute name="data-matched" description="Applied when the node matches the current search query." />
  <api-attribute name="data-level" description="The 1-based depth of the node." />
</api-reference-attributes>

### NgpTreeNodeToggle

<api-docs name="NgpTreeNodeToggle"></api-docs>

<api-reference-attributes>
  <api-attribute name="data-expanded" description="Applied when the owning node is expanded." />
  <api-attribute name="data-expandable" description="Applied when the owning node can be expanded." />
</api-reference-attributes>

### NgpTreeNodeCheckbox

<api-docs name="NgpTreeNodeCheckbox"></api-docs>

<api-reference-attributes>
  <api-attribute name="data-checked" description="Applied when the node is fully checked." />
  <api-attribute name="data-indeterminate" description="Applied when the node is partially checked." />
  <api-attribute name="data-disabled" description="Applied when the node is disabled." />
</api-reference-attributes>

### NgpTreeNodeDragHandle

<api-docs name="NgpTreeNodeDragHandle"></api-docs>

### NgpTreeDragPreview

<api-docs name="NgpTreeDragPreview"></api-docs>

### NgpTreeNodeRename

<api-docs name="NgpTreeNodeRename"></api-docs>

## Keyboard Interaction

The tree follows the [WAI-ARIA tree pattern](https://www.w3.org/WAI/ARIA/apg/patterns/treeview/)
with roving tabindex.

- <kbd>Down</kbd> / <kbd>Up</kbd> - move to the next / previous visible node.
- <kbd>Right</kbd> - expand a collapsed parent, or move to its first child if already expanded.
- <kbd>Left</kbd> - collapse an expanded parent, or move to its parent.
- Under `dir="rtl"` the horizontal arrows invert - <kbd>Left</kbd> expands and <kbd>Right</kbd> collapses.
- <kbd>Home</kbd> / <kbd>End</kbd> - move to the first / last visible node.
- <kbd>\*</kbd> - expand every expandable sibling at the focused node's level.
- **Type a letter** - move to the next node whose label starts with it; repeating the same
  letter cycles through matches.
- <kbd>F2</kbd> - rename the focused node (when `ngpTreeItemRenamable` is set); <kbd>Enter</kbd>
  commits, <kbd>Escape</kbd> cancels.
- <kbd>⌘</kbd>/<kbd>Ctrl</kbd>+<kbd>X</kbd> / <kbd>V</kbd> - cut the focused node(s), then paste them
  onto the focused node (when `ngpTreeItemDraggable` is set); <kbd>Escape</kbd> clears the cut.
- <kbd>Space</kbd> - toggle the focused node's checkbox, when it has an `ngpTreeNodeCheckbox`.
- <kbd>Enter</kbd> - activate the focused node (emits `(ngpTreeActivate)`).

When a selection mode is active:

- <kbd>Space</kbd> - toggle selection of the focused node.
- <kbd>Enter</kbd> - also selects the focused node.
- <kbd>⌘</kbd>/<kbd>Ctrl</kbd>+<kbd>A</kbd> - select all currently visible nodes (multiple mode).

Type-ahead matches the row's text content by default. If your rows contain chrome (icons,
badges) that would pollute the match, provide an `ngpTreeItemLabel` accessor. Focus is also
restored to the nearest visible ancestor if a focused node is collapsed out of view.

## Accessibility

Rows render flat, so hierarchy is conveyed with `aria-level`, `aria-setsize` and
`aria-posinset` (the same mechanism React Aria and the Angular CDK use for flat and
virtualized trees). Expandable nodes expose `aria-expanded`; leaves omit it. When a
selection mode is active, selectable nodes expose `aria-selected` and the tree sets
`aria-multiselectable` in multiple mode.
