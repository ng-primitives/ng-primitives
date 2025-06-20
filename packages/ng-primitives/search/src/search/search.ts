import { computed, DestroyRef, Directive, HostListener, inject, signal } from '@angular/core';
import { safeTakeUntilDestroyed } from 'ng-primitives/utils';
import { fromEvent } from 'rxjs';
import { provideSearchState, searchState } from './search-state';

/**
 * The `NgpSearch` directive is a container for the search field components.
 */
@Directive({
  selector: '[ngpSearch]',
  exportAs: 'ngpSearch',
  providers: [provideSearchState()],
  host: {
    '[attr.data-empty]': 'empty() ? "" : null',
  },
})
export class NgpSearch {
  /**
   * The destroy reference.
   */
  private readonly destroyRef = inject(DestroyRef);

  /**
   * The input field.
   */
  private readonly input = signal<HTMLInputElement | null>(null);

  /**
   * The value of the input.
   */
  private readonly value = signal<string>('');

  /**
   * Whether the input field is empty.
   * @internal
   */
  protected readonly empty = computed(() => this.value() === '');

  /**
   * The search field state.
   */
  protected readonly state = searchState<NgpSearch>(this);

  @HostListener('keydown.escape')
  clear(): void {
    const input = this.input();

    if (!input) {
      return;
    }

    input.value = '';
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }

  /**
   * Register the input field.
   * @param input The input field.
   * @internal
   */
  registerInput(input: HTMLInputElement): void {
    this.input.set(input);
    this.value.set(input.value);

    fromEvent(input, 'input')
      .pipe(safeTakeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.value.set(input.value));
  }
}
