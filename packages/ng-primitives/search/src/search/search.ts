import { Directive, signal } from '@angular/core';
import { ngpSearchPattern, provideSearchPattern } from './search-pattern';

/**
 * The `NgpSearch` directive is a container for the search field components.
 */
@Directive({
  selector: '[ngpSearch]',
  exportAs: 'ngpSearch',
  providers: [provideSearchPattern(NgpSearch, instance => instance.pattern)],
})
export class NgpSearch {
  /**
   * The input field.
   */
  private readonly input = signal<HTMLInputElement | null>(null);

  /**
   * The pattern instance.
   */
  protected readonly pattern = ngpSearchPattern({
    input: this.input,
  });

  clear(): void {
    this.pattern.clear();
  }

  /**
   * Register the input field.
   * @param input The input field.
   * @internal
   */
  registerInput(input: HTMLInputElement): void {
    this.input.set(input);
  }
}
