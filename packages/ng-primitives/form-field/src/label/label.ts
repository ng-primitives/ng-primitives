import {
  computed,
  Directive,
  effect,
  ElementRef,
  HostListener,
  inject,
  input,
} from '@angular/core';
import { uniqueId } from 'ng-primitives/utils';
import { injectFormFieldState } from '../form-field/form-field-state';

/**
 * The `NgpLabel` directive is used to mark a label element within a form field. Preferably, there should use an HTML `<label>` element.
 */
@Directive({
  selector: '[ngpLabel]',
  exportAs: 'ngpLabel',
  host: {
    '[attr.id]': 'id()',
    '[attr.for]': 'htmlFor()',
    '[attr.data-invalid]': 'formField()?.invalid() ? "" : null',
    '[attr.data-valid]': 'formField()?.valid() ? "" : null',
    '[attr.data-touched]': 'formField()?.touched() ? "" : null',
    '[attr.data-pristine]': 'formField()?.pristine() ? "" : null',
    '[attr.data-dirty]': 'formField()?.dirty() ? "" : null',
    '[attr.data-pending]': 'formField()?.pending() ? "" : null',
    '[attr.data-disabled]': 'formField()?.disabled() ? "" : null',
  },
})
export class NgpLabel {
  /**
   * The id of the label. If not provided, a unique id will be generated.
   */
  readonly id = input<string>(uniqueId('ngp-label'));
  /**
   * Access the form field that the label is associated with.
   */
  protected readonly formField = injectFormFieldState({ optional: true });
  /**
   * Derive the for attribute value if the label is an HTML label element.
   */
  protected readonly htmlFor = computed(() => this.formField()?.formControl());
  /**
   * Access the element that the label is associated with.
   */
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  /**
   * Determine if the label is an HTML label element.
   */
  protected readonly isLabel = this.elementRef.nativeElement instanceof HTMLLabelElement;

  constructor() {
    effect(onCleanup => {
      this.formField()?.addLabel(this.id());
      onCleanup(() => this.formField()?.removeLabel(this.id()));
    });
  }

  @HostListener('click', ['$event'])
  protected onClick(event: MouseEvent): void {
    // by default a label will perform a click on the associated form control, however
    // this only works if the associated form control is an input element which may not always
    // be the case, so we prevent the default behavior and handle the click event ourselves.
    // This was inspired by the HeadlessUI approach:
    // https://github.com/tailwindlabs/headlessui/blob/main/packages/%40headlessui-react/src/components/label/label.tsx#L58
    if (this.isLabel) {
      event.preventDefault();
    }

    // to find the associated form control we can lookup via the known id
    const targetId = this.htmlFor();

    if (!targetId) {
      return;
    }

    const target = document.getElementById(targetId);

    if (!target) {
      return;
    }

    // if the target is disabled then do nothing
    const disabled = target.getAttribute('disabled');
    const ariaDisabled = target.getAttribute('aria-disabled');

    if (disabled === '' || disabled === 'true' || ariaDisabled === 'true') {
      return;
    }

    // radio buttons, checkboxes and switches should all be clicked immediately as they require state changes
    if (
      (target instanceof HTMLInputElement &&
        (target.type === 'radio' || target.type === 'checkbox')) ||
      target.role === 'radio' ||
      target.role === 'checkbox' ||
      target.role === 'switch'
    ) {
      target.click();
    }

    // Move focus to the element, this allows you to start using keyboard shortcuts since the
    // bound element is now focused.
    target.focus({ preventScroll: true });
  }
}
