import { DomPortalOutlet, TemplatePortal } from '@angular/cdk/portal';
import { DOCUMENT } from '@angular/common';
import {
  Directive,
  EmbeddedViewRef,
  inject,
  signal,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { autoUpdate, computePosition } from '@floating-ui/dom';
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
  readonly viewRef = signal<EmbeddedViewRef<any> | null>(null);

  /** Store the dispose function. */
  private dispose: (() => void) | null = null;

  constructor() {
    this.state().registerPortal(this);
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

    this.dispose = autoUpdate(this.state().elementRef.nativeElement, dropdownElement, async () => {
      const position = await computePosition(
        this.state().elementRef.nativeElement,
        dropdownElement,
        {
          placement: 'bottom-start',
          middleware: [],
          strategy: 'absolute',
        },
      );

      Object.assign(dropdownElement.style, {
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
      });
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
