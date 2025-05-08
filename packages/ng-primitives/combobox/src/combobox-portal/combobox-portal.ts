import { DomPortalOutlet, TemplatePortal } from '@angular/cdk/portal';
import { DOCUMENT } from '@angular/common';
import {
  Directive,
  effect,
  EmbeddedViewRef,
  inject,
  signal,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { autoUpdate, computePosition, flip, Middleware, Placement } from '@floating-ui/dom';
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

  /** Access the document. */
  private readonly document = inject<Document>(DOCUMENT);

  /**
   * Store the embedded view reference.
   * @internal
   */
  readonly viewRef = signal<EmbeddedViewRef<void> | null>(null);

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
      const dropdownElement = this.viewRef()?.rootNodes[0];
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
    const templatePortal = new TemplatePortal(this.templateRef, this.viewContainerRef);
    const domPortal = new DomPortalOutlet(this.document.body);
    this.viewRef.set(domPortal.attach(templatePortal));
    this.viewRef()?.detectChanges();

    const dropdownElement = this.viewRef()?.rootNodes[0];

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
    this.viewRef()?.destroy();
    this.viewRef.set(null);
    this.dispose?.();
    this.dispose = null;
  }
}
