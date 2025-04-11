import { computed, contentChild, Directive, ElementRef, HostListener } from '@angular/core';
import { NgpInputToken } from 'ng-primitives/input';
import { NgpSearchToken } from './search-token';

@Directive({
  selector: '[ngpSearch]',
  exportAs: 'ngpSearch',
  providers: [{ provide: NgpSearchToken, useExisting: NgpSearch }],
  host: {
    '[attr.data-empty]': 'empty() ? "" : null',
  },
})
export class NgpSearch {
  /**
   * Access the child input field.
   */
  protected readonly input = contentChild.required(NgpInputToken, {
    descendants: true,
    read: ElementRef,
  });

  /**
   * Whether the input field is empty.
   * @internal
   */
  protected readonly empty = computed(() => this.input().nativeElement.value === '');

  @HostListener('keydown.escape')
  clear(): void {
    this.input().nativeElement.value = '';
    this.input().nativeElement.dispatchEvent(new Event('input', { bubbles: true }));
  }
}
