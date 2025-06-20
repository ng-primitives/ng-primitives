import { ActiveDescendantKeyManager, FocusOrigin } from '@angular/cdk/a11y';
import { BooleanInput } from '@angular/cdk/coercion';
import {
  AfterContentInit,
  booleanAttribute,
  computed,
  DestroyRef,
  Directive,
  HostListener,
  inject,
  Injector,
  input,
  output,
  signal,
} from '@angular/core';
import { NgpSelectionMode } from 'ng-primitives/common';
import { explicitEffect, setupFocusVisible } from 'ng-primitives/internal';
import { injectPopoverTriggerState } from 'ng-primitives/popover';
import { uniqueId } from 'ng-primitives/utils';
import { safeTakeUntilDestroyed } from 'ng-primitives/utils';
import type { NgpListboxOption } from '../listbox-option/listbox-option';
import { listboxState, provideListboxState } from './listbox-state';

@Directive({
  selector: '[ngpListbox]',
  exportAs: 'ngpListbox',
  providers: [provideListboxState()],
  host: {
    '[id]': 'state.id()',
    role: 'listbox',
    '[attr.tabindex]': 'tabindex()',
    '[attr.aria-disabled]': 'state.disabled()',
    '[attr.aria-multiselectable]': 'state.mode() === "multiple"',
    '[attr.aria-activedescendant]': 'activeDescendant()',
    '(focusin)': 'isFocused.set(true)',
    '(focusout)': 'isFocused.set(false)',
  },
})
export class NgpListbox<T> implements AfterContentInit {
  /**
   * Access the injector.
   */
  private readonly injector = inject(Injector);

  /**
   * Access the destroy ref.
   */
  private readonly destroyRef = inject(DestroyRef);

  /**
   * The listbox may be used within a popover, which we may want to close on selection.
   */
  private readonly popoverTrigger = injectPopoverTriggerState({ optional: true });

  /**
   * The id of the listbox.
   */
  readonly id = input(uniqueId('ngp-listbox'));

  /**
   * The listbox selection mode.
   */
  readonly mode = input<NgpSelectionMode>('single', {
    alias: 'ngpListboxMode',
  });

  /**
   * The listbox selection.
   */
  readonly value = input<T[]>([], {
    alias: 'ngpListboxValue',
  });

  /**
   * Emits when the listbox selection changes.
   */
  readonly valueChange = output<T[]>({
    alias: 'ngpListboxValueChange',
  });

  /**
   * The listbox disabled state.
   */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpListboxDisabled',
    transform: booleanAttribute,
  });

  /**
   * The comparator function to use when comparing values.
   * If not provided, strict equality (===) is used.
   */
  readonly compareWith = input<(a: T, b: T) => boolean>((a, b) => a === b, {
    alias: 'ngpListboxCompareWith',
  });

  /**
   * The tabindex of the listbox.
   */
  protected readonly tabindex = computed(() => (this.state.disabled() ? -1 : 0));

  /**
   * Access the options in the listbox.
   */
  protected readonly options = signal<NgpListboxOption<T>[]>([]);

  /**
   * The active descendant of the listbox.
   */
  protected readonly keyManager = new ActiveDescendantKeyManager(this.options, this.injector);

  /**
   * Gets the active descendant of the listbox.
   */
  protected readonly activeDescendant = signal<string | undefined>(undefined);

  /**
   * @internal
   * Whether the listbox is focused.
   */
  readonly isFocused = signal(false);

  /**
   * The listbox state
   */
  private readonly state = listboxState<NgpListbox<T>>(this);

  constructor() {
    setupFocusVisible({ disabled: this.state.disabled });
  }

  ngAfterContentInit(): void {
    this.keyManager.withHomeAndEnd().withTypeAhead().withVerticalOrientation();

    this.keyManager.change
      .pipe(safeTakeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.activeDescendant.set(this.keyManager.activeItem?.id()));

    // On initialization, set the first selected option as the active descendant if there is one.
    this.updateActiveItem();

    // if the options change, update the active item, for example the item that was previously active may have been removed
    // any time the value changes we should make sure that the active item is updated
    explicitEffect([this.options], () => this.updateActiveItem(), {
      injector: this.injector,
    });
  }

  private updateActiveItem(): void {
    const selectedOption = this.options().find(o => o.selected());

    if (selectedOption) {
      this.keyManager.setActiveItem(selectedOption);
    } else {
      this.keyManager.setFirstItemActive();
    }
  }

  @HostListener('keydown', ['$event'])
  protected onKeydown(event: KeyboardEvent): void {
    this.keyManager.onKeydown(event);

    // if the keydown was enter or space, select the active descendant if there is one
    if (event.key === 'Enter' || event.key === ' ') {
      this.keyManager.activeItem?.select('keyboard');
    }

    // if this is an arrow key or selection key, prevent the default action to prevent the page from scrolling
    if (
      event.key === 'ArrowDown' ||
      event.key === 'ArrowUp' ||
      event.key === 'Enter' ||
      event.key === ' '
    ) {
      event.preventDefault();
    }
  }

  /**
   * @internal
   * Selects an option in the listbox.
   */
  selectOption(value: T, origin: FocusOrigin): void {
    if (this.state.mode() === 'single') {
      const newValue = [value];
      this.state.value.set(newValue);
      this.valueChange.emit(newValue);
    } else {
      // if the value is already selected, remove it, otherwise add it
      if (this.isSelected(value)) {
        const newValue = this.state.value().filter(v => !this.state.compareWith()(v, value));
        this.state.value.set(newValue);
        this.valueChange.emit(newValue);
      } else {
        const newValue = [...this.state.value(), value];
        this.state.value.set(newValue);
        this.valueChange.emit(newValue);
      }
    }

    // Set the active descendant to the selected option.
    const option = this.options().find(o => this.state.compareWith()(o.value(), value));

    if (option) {
      this.keyManager.setActiveItem(option);
    }

    // If the listbox is within a popover, close the popover on selection if it is not in a multiple selection mode.
    if (this.state.mode() !== 'multiple') {
      this.popoverTrigger()?.hide(origin);
    }
  }

  /**
   * @internal
   * Determine if an option is selected using the compareWith function.
   */
  isSelected(value: T): boolean {
    return this.state.value().some(v => this.state.compareWith()(v, value));
  }

  /**
   * @internal
   * Activate an option in the listbox.
   */
  activateOption(value: T) {
    const option = this.options().find(o => this.state.compareWith()(o.value(), value));

    if (option) {
      this.keyManager.setActiveItem(option);
    }
  }

  /**
   * Registers an option with the listbox.
   * @internal
   */
  addOption(option: NgpListboxOption<T>): void {
    // if the option already exists, do not add it again
    if (!this.options().includes(option)) {
      this.options.update(options => [...options, option]);
    }
  }

  /**
   * Deregisters an option with the listbox.
   * @internal
   */
  removeOption(option: NgpListboxOption<T>): void {
    this.options.update(options => options.filter(o => o !== option));
  }
}
