import { DOCUMENT } from '@angular/common';
import {
  Directive,
  effect,
  inject,
  Injector,
  signal,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { autoUpdate, computePosition, flip, Middleware, Placement } from '@floating-ui/dom';
import { createPortal, NgpPortal } from 'ng-primitives/portal';
import { observeResize } from 'ng-primitives/resize';
import { injectComboboxState } from '../combobox/combobox-state';

@Directive({
  selector: '[ngpComboboxPortal]',
  exportAs: 'ngpComboboxPortal',
})
export class NgpComboboxPortal {
  /** Access the combobox state. */
  private readonly state = injectComboboxState();

  /** Access the template reference. */
  private readonly templateRef = inject(TemplateRef);

  /** Access the view container reference. */
  private readonly viewContainerRef = inject(ViewContainerRef);

  /** Access the injector. */
  private readonly injector = inject(Injector);

  /** Access the document. */
  private readonly document = inject<Document>(DOCUMENT);

  /**
   * Store the embedded view reference.
   * @internal
   */
  readonly viewRef = signal<NgpPortal | null>(null);

  /** Store the dispose function. */
  private dispose: (() => void) | null = null;

  /** The position of the dropdown. */
  readonly position = signal<{ x: number; y: number }>({ x: 0, y: 0 });

  /** The dimensions of the combobox. */
  private readonly comboboxDimensions = observeResize(() => this.state().elementRef.nativeElement);

  /** The dimensions of the combobox. */
  private readonly inputDimensions = observeResize(
    () => this.state().input()?.elementRef.nativeElement,
  );

  /** Store the combobox button dimensions. */
  private readonly buttonDimensions = observeResize(
    () => this.state().button()?.elementRef.nativeElement,
  );

  constructor() {
    this.state().registerPortal(this);

    effect(() => {
      const dropdownElement = this.viewRef()?.getElements()[0] as HTMLElement | null;

      if (!dropdownElement) {
        return;
      }

      const position = this.position();
      const comboboxWidth = this.comboboxDimensions().width;
      const inputWidth = this.inputDimensions().width;
      const buttonWidth = this.buttonDimensions().width;

      if (!dropdownElement) {
        return;
      }

      const styles = {
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        '--ngp-combobox-width': `${comboboxWidth}px`,
        '--ngp-combobox-input-width': `${inputWidth}px`,
        '--ngp-combobox-button-width': `${buttonWidth}px`,
      };

      for (const [key, value] of Object.entries(styles)) {
        dropdownElement.style.setProperty(key, value);
      }
    });
  }

  /**
   * Attach the portal.
   * @internal
   */
  attach(): void {
    const viewRef = createPortal(this.templateRef, this.viewContainerRef, this.injector);
    viewRef.attach(this.document.body);
    viewRef.detectChanges();

    this.viewRef.set(viewRef);

    const dropdownElement = this.viewRef()?.getElements()[0] as HTMLElement | null;

    if (!dropdownElement) {
      throw new Error('Dropdown element not found');
    }

    let placement: Placement;
    const middleware: Middleware[] = [];

    switch (this.state().dropdownPosition()) {
      case 'top':
        placement = 'top-start';
        break;
      case 'bottom':
        placement = 'bottom-start';
        break;
      case 'auto':
        placement = 'bottom-start';
        middleware.push(flip({ fallbackPlacements: ['top-start'] }));
        break;
    }

    this.dispose = autoUpdate(this.state().elementRef.nativeElement, dropdownElement, async () => {
      const position = await computePosition(
        this.state().elementRef.nativeElement,
        dropdownElement,
        { placement, middleware, strategy: 'absolute' },
      );

      this.position.set({ x: position.x, y: position.y });
    });
  }

  /**
   * Detach the portal.
   * @internal
   */
  detach(): void {
    this.viewRef()?.detach();
    this.viewRef.set(null);
    this.dispose?.();
    this.dispose = null;
  }
}
