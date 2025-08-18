# ng-primitives/select

Secondary entry point of `ng-primitives`. It can be used by importing from `ng-primitives/select`.

## Displaying the selected text (DOM-based)

Render the selected option text in the trigger using the select's exported API. The displayed text is derived from the selected option's DOM textContent. When options are detached (e.g. dropdown is closed/ported), the last rendered text is preserved for a smooth UX.

```html
<div #s="ngpSelect" [(ngpSelectValue)]="selected" ngpSelect>
  @if (selected(); as selected) {
    <span>{{ s.triggerText() }}</span>
  } @else {
  <span>Select an option</span>
  }

  <div *ngpSelectPortal ngpSelectDropdown>
    <div ngpSelectOption [ngpSelectOptionValue]="{ id: 1, code: 'apple' }">Sweet Apple</div>
  </div>
</div>
```
