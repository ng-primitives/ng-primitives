import { DOCUMENT } from '@angular/common';
import { Component, computed, ElementRef, inject, signal, viewChild } from '@angular/core';
import {
  createFragmentMatcher,
  NgpAutocomplete,
  NgpAutocompleteDropdown,
  NgpAutocompleteFragment,
  NgpAutocompleteOption,
  NgpAutocompletePortal,
} from 'ng-primitives/autocomplete';

interface Person {
  readonly handle: string;
  readonly name: string;
}

/** The mention being typed, in the text node that holds the caret. */
interface Mention {
  readonly node: Text;
  readonly fragment: NgpAutocompleteFragment;
}

@Component({
  selector: 'app-autocomplete-editor',
  imports: [NgpAutocomplete, NgpAutocompleteDropdown, NgpAutocompleteOption, NgpAutocompletePortal],
  host: {
    '(document:selectionchange)': 'onSelectionChange()',
  },
  template: `
    <div
      #autocomplete="ngpAutocomplete"
      [ngpAutocompleteMinLength]="0"
      (ngpAutocompleteSelected)="insertMention($event)"
      ngpAutocomplete
      ngpAutocompleteAutoActivate
      ngpAutocompleteDropdownPlacement="bottom-start"
    >
      <div
        class="editor"
        #editor
        [attr.aria-controls]="autocomplete.open() ? autocomplete.dropdownId() : null"
        [attr.aria-activedescendant]="autocomplete.activeOptionId()"
        (input)="onInput()"
        (keydown)="autocomplete.onKeydown($event)"
        contenteditable="true"
        role="textbox"
        aria-label="Message"
        aria-multiline="true"
        aria-haspopup="listbox"
        aria-autocomplete="list"
        data-placeholder="Write a message, type @ to mention someone"
      ></div>

      <div *ngpAutocompletePortal ngpAutocompleteDropdown>
        @for (person of matchingPeople(); track person.handle) {
          <div [ngpAutocompleteOptionValue]="person" ngpAutocompleteOption>
            <span class="name">{{ person.name }}</span>
            <span class="handle">&#64;{{ person.handle }}</span>
          </div>
        } @empty {
          <div class="empty-message">No one found</div>
        }
      </div>
    </div>

    <p class="summary">
      Mentioned:
      @for (handle of mentioned(); track $index) {
        <span>&#64;{{ handle }}</span>
      } @empty {
        <span>nobody yet</span>
      }
    </p>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 8px;
      width: 90%;
      max-width: 420px;
    }

    .editor {
      min-height: 96px;
      padding: 10px 14px;
      border-radius: 0.625rem;
      background-color: var(--ngp-background);
      box-shadow: var(--ngp-input-shadow);
      box-sizing: border-box;
      color: var(--ngp-text-primary);
      font-size: 0.875rem;
      letter-spacing: -0.006em;
      line-height: 1.5;
      outline: none;
      white-space: pre-wrap;
    }

    .editor:focus {
      outline: 2px solid var(--ngp-focus-ring);
      outline-offset: 2px;
    }

    .editor:empty::before {
      content: attr(data-placeholder);
      color: var(--ngp-text-tertiary);
    }

    /* the chips are created in code, so they don't carry the component's style scope */
    .editor ::ng-deep .mention {
      display: inline-block;
      padding: 0 8px;
      border-radius: 9999px;
      background-color: var(--ngp-background-active);
      box-shadow: inset 0 0 0 1px var(--ngp-border);
      color: var(--ngp-text-primary);
      font-weight: 510;
      line-height: 1.375rem;
      white-space: nowrap;
      cursor: default;
    }

    .editor ::ng-deep .mention::before {
      content: '@';
      color: var(--ngp-text-tertiary);
    }

    .summary {
      margin: 0;
      color: var(--ngp-text-secondary);
      font-size: 12px;
      letter-spacing: -0.011em;
    }

    .summary span {
      margin-left: 4px;
      color: var(--ngp-text-primary);
    }

    [ngpAutocompleteDropdown] {
      position: absolute;
      width: 220px;
      max-height: 200px;
      margin-top: 4px;
      padding: 0.25rem;
      overflow-y: auto;
      border: 1px solid var(--ngp-border);
      border-radius: 0.75rem;
      background-color: var(--ngp-background);
      box-shadow: var(--ngp-shadow-lg);
      box-sizing: border-box;
      outline: none;
      z-index: 1001;
    }

    [ngpAutocompleteOption] {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
      height: 2.125rem;
      padding: 0 0.75rem;
      border-radius: 0.5rem;
      font-size: 14px;
      letter-spacing: -0.006em;
      cursor: pointer;
      box-sizing: border-box;
      transition: background-color 150ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    [ngpAutocompleteOption][data-hover],
    [ngpAutocompleteOption][data-active] {
      background-color: var(--ngp-background-hover);
    }

    [ngpAutocompleteOption][data-press] {
      background-color: var(--ngp-background-active);
    }

    .name {
      color: var(--ngp-text-primary);
      font-weight: 510;
    }

    .handle {
      color: var(--ngp-text-tertiary);
      font-size: 12px;
      letter-spacing: -0.011em;
    }

    .empty-message {
      padding: 0.5rem;
      color: var(--ngp-text-secondary);
      font-size: 14px;
      text-align: center;
    }
  `,
})
export default class AutocompleteEditorExample {
  private readonly document = inject(DOCUMENT);
  private readonly autocomplete = viewChild.required(NgpAutocomplete);
  private readonly editor = viewChild.required<ElementRef<HTMLElement>>('editor');

  readonly people: Person[] = [
    { handle: 'marty', name: 'Marty McFly' },
    { handle: 'doc', name: 'Emmett Brown' },
    { handle: 'lorraine', name: 'Lorraine Baines' },
    { handle: 'george', name: 'George McFly' },
    { handle: 'biff', name: 'Biff Tannen' },
    { handle: 'jennifer', name: 'Jennifer Parker' },
  ];

  /** Find the word starting with @ under the caret. */
  private readonly matchMention = createFragmentMatcher('@');

  /** The mention being typed, if the caret is in one. */
  private mention: Mention | null = null;

  /** The text typed after the @. */
  readonly query = signal('');

  /** The handles of the mentions in the message. */
  readonly mentioned = signal<string[]>([]);

  protected readonly matchingPeople = computed(() => {
    const query = this.query().toLowerCase();
    return this.people.filter(
      person => person.handle.startsWith(query) || person.name.toLowerCase().includes(query),
    );
  });

  protected onInput(): void {
    this.updateMention();
    this.query.set(this.mention?.fragment.query ?? '');
    // like typing in ngpAutocompleteInput: opens for a mention, closes without one
    this.autocomplete().setQuery(this.mention ? this.mention.fragment.query : null);
    this.updateMentioned();
  }

  protected onSelectionChange(): void {
    if (this.document.activeElement !== this.editor().nativeElement) {
      return;
    }

    // leaving the mention closes the dropdown, coming back to one waits for typing
    this.updateMention();

    if (!this.mention) {
      this.autocomplete().closeDropdown();
    }
  }

  protected insertMention(person: Person): void {
    if (!this.mention) {
      return;
    }

    const { node, fragment } = this.mention;
    const range = this.document.createRange();
    range.setStart(node, fragment.start);
    range.setEnd(node, fragment.end);
    range.deleteContents();

    // the caret steps over the chip as a whole, so a name can hold spaces
    const chip = this.document.createElement('span');
    chip.className = 'mention';
    chip.contentEditable = 'false';
    chip.dataset['handle'] = person.handle;
    chip.textContent = person.name;

    // a non-breaking space, as a plain one at the end of a line would collapse
    const space = this.document.createTextNode('\u00a0');
    range.insertNode(space);
    range.insertNode(chip);
    this.document.getSelection()?.collapse(space, 1);

    this.mention = null;
    this.updateMentioned();
  }

  private findMention(): Mention | null {
    const selection = this.document.getSelection();
    const node = selection?.focusNode;

    if (!selection?.isCollapsed || !(node instanceof Text)) {
      return null;
    }

    // chips are separate nodes, so the text node alone holds the mention being typed
    const fragment = this.matchMention(node.data, selection.focusOffset);
    return fragment ? { node, fragment } : null;
  }

  private updateMention(): void {
    const mention = this.findMention();
    this.mention = mention;
    // a function, so the autocomplete measures it again when the page scrolls
    this.autocomplete().setPosition(mention ? () => this.measure(mention) : null);
  }

  /** The bottom left corner of the @, measured from a range around it. */
  private measure({ node, fragment }: Mention) {
    const range = this.document.createRange();
    range.setStart(node, fragment.start);
    range.setEnd(node, fragment.start + 1);
    const rect = range.getBoundingClientRect();
    return { x: rect.left, y: rect.bottom };
  }

  private updateMentioned(): void {
    const chips = this.editor().nativeElement.querySelectorAll<HTMLElement>('.mention');
    this.mentioned.set(Array.from(chips, chip => chip.dataset['handle'] ?? ''));
  }
}
