/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Directive, ElementRef, HostListener, Renderer2, effect, inject } from '@angular/core';
import { NgpSearchField } from 'ng-primitives/search';

@Directive({
  standalone: true,
  selector: '[ngpSearchFieldClear]',
  exportAs: 'ngpSearchFieldClear',
})
export class NgpSearchFieldClear {
  private readonly renderer = inject(Renderer2);
  private readonly element = inject<ElementRef<HTMLButtonElement>>(ElementRef);

  /**
   * Access the Search Field instance.
   */
  private readonly ngpSearchField = inject(NgpSearchField);

  constructor() {
    this.setButtonStyle();

    /**
     * Determine if the clear button is visible.
     */
    effect(() => {
      if (this.ngpSearchField.empty()) {
        this.renderer.setStyle(this.element.nativeElement, 'display', 'none');
      } else {
        this.renderer.setStyle(this.element.nativeElement, 'display', 'block');
      }
    });
  }

  /**
   * Clear the input field.
   */
  @HostListener('click')
  click(): void {
    this.ngpSearchField.clear();
  }

  /**
   * Set button default style.
   */
  private setButtonStyle(): void {
    this.renderer.setStyle(this.element.nativeElement, 'position', 'absolute');
    this.renderer.setStyle(this.element.nativeElement, 'top', '0');
    this.renderer.setStyle(this.element.nativeElement, 'right', '0');
    this.renderer.setStyle(this.element.nativeElement, 'height', '36px');
    this.renderer.setStyle(this.element.nativeElement, 'padding', '0 16px');
    this.renderer.setStyle(this.element.nativeElement, 'border', 'none');
    this.renderer.setStyle(this.element.nativeElement, 'border-radius', '0 8px 8px 0');
    this.renderer.setStyle(this.element.nativeElement, 'background-color', 'transparent');
    this.renderer.setStyle(this.element.nativeElement, 'color', 'rgb(59, 130, 246)');
    this.renderer.setStyle(this.element.nativeElement, 'font-size', '0.875rem');
    this.renderer.setStyle(this.element.nativeElement, 'line-height', '1.25rem');
    this.renderer.setStyle(this.element.nativeElement, 'cursor', 'pointer');
    this.renderer.setStyle(this.element.nativeElement, 'outline', 'none');
  }
}
