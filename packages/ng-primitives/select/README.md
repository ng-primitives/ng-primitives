# ng-primitives/select

Secondary entry point of `ng-primitives`. It can be used by importing from `ng-primitives/select`.

## Displaying the selected text (DOM-based)

Use the `ngpSelectViewValue` directive to render the selected option text in the trigger. The displayed text is derived from the selected option's DOM textContent. When options are detached (e.g. dropdown is closed/ported), the last rendered text is preserved for a smooth UX.

```html
<div #s="ngpSelect" [(ngpSelectValue)]="selected" ngpSelect>
  @if (selected(); as selected) {
    <span ngpSelectViewValue></span>
  } @else {
    <span>Select an option</span>
  }

  <div *ngpSelectPortal ngpSelectDropdown>
    <div
      ngpSelectOption
      [ngpSelectOptionValue]="{ id: 1, code: 'apple' }"
    >
      Sweet Apple
    </div>
  </div>
</div>
```
