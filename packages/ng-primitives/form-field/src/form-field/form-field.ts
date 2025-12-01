import {
  Directive,
  Injector,
  OnDestroy,
  contentChild,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { NgControl } from '@angular/forms';
import { onChange } from 'ng-primitives/utils';
import { Subscription } from 'rxjs';
import { formFieldState, provideFormFieldState } from './form-field-state';

/**
 * The `NgpFormField` directive is a container for form field elements. Any labels, form controls, or descriptions should be placed within this directive.
 */
@Directive({
  selector: '[ngpFormField]',
  exportAs: 'ngpFormField',
  providers: [provideFormFieldState()],
  host: {
    '[attr.data-invalid]': 'invalid() ? "" : null',
    '[attr.data-valid]': 'valid() ? "" : null',
    '[attr.data-touched]': 'touched() ? "" : null',
    '[attr.data-pristine]': 'pristine() ? "" : null',
    '[attr.data-dirty]': 'dirty() ? "" : null',
    '[attr.data-pending]': 'pending() ? "" : null',
    '[attr.data-disabled]': 'disabled() ? "" : null',
  },
})
export class NgpFormField implements OnDestroy {
  /**
   * Store the form label.
   * @internal
   */
  readonly labels = signal<string[]>([]);

  /**
   * Store the form descriptions.
   * @internal
   */
  readonly descriptions = signal<string[]>([]);

  /**
   * Store the id of the associated form control.
   * @internal
   */
  readonly formControl = signal<string | null>(null);

  /**
   * Find any NgControl within the form field.
   * @internal
   */
  private readonly ngControl = contentChild(NgControl);

  /**
   * Store the validation error messages.
   * @internal
   */
  readonly errors = signal<string[]>([]);

  /**
   * Whether the control is pristine.
   * @internal
   */
  readonly pristine = signal<boolean | null>(null);

  /**
   * Whether the control is touched.
   * @internal
   */
  readonly touched = signal<boolean | null>(null);

  /**
   * Whether the control is dirty.
   * @internal
   */
  readonly dirty = signal<boolean | null>(null);

  /**
   * Whether the control is valid.
   */
  readonly valid = signal<boolean | null>(null);

  /**
   * Whether the control is invalid.
   * @internal
   */
  readonly invalid = signal<boolean | null>(null);

  /**
   * Whether the control is pending.
   * @internal
   */
  readonly pending = signal<boolean | null>(null);

  /**
   * Whether the control is disabled.
   * @internal
   */
  readonly disabled = signal<boolean | null>(null);

  /**
   * Store the current status subscription.
   */
  private subscription?: Subscription;

  /**
   * Injector for creating effects outside the constructor.
   */
  private readonly injector = inject(Injector);

  /**
   * The form field state.
   */
  protected readonly state = formFieldState<NgpFormField>(this);

  constructor() {
    // any time the ngControl changes, setup the subscriptions.
    onChange(this.ngControl, this.setupSubscriptions.bind(this));
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  /**
   * Setup a listener for the form control status.
   * @param control
   */
  private setupSubscriptions(control: NgControl | null | undefined): void {
    // Unsubscribe from the previous subscriptions.
    this.subscription?.unsubscribe();

    if (!control) {
      return;
    }

    // For signal-forms interop controls, use an effect to reactively track status.
    // For classic controls, also use an effect but additionally subscribe to events.
    effect(
      () => {
        this.updateStatus();
      },
      { injector: this.injector },
    );

    // Classic controls also have an events observable we can subscribe to.
    const underlyingControl = control?.control;
    if (underlyingControl?.events) {
      this.subscription = underlyingControl.events.subscribe(() => this.updateStatus());
    }
  }

  private updateStatus(): void {
    const control = this.ngControl();

    if (!control) {
      return;
    }

    // Wrap in try-catch to handle signal-forms interop controls where
    // the `field` input may not be available yet (throws NG0950).
    // Reading the signal still establishes a dependency, so the effect
    // will re-run when the input becomes available.
    try {
      const pristine = control.pristine;
      const touched = control.touched;
      const dirty = control.dirty;
      const valid = control.valid;
      const invalid = control.invalid;
      const pending = control.pending;
      const disabled = control.disabled;
      const errors = control.errors;

      untracked(() => {
        this.pristine.set(pristine);
        this.touched.set(touched);
        this.dirty.set(dirty);
        this.valid.set(valid);
        this.invalid.set(invalid);
        this.pending.set(pending);
        this.disabled.set(disabled);
        this.errors.set(errors ? Object.keys(errors) : []);
      });
    } catch {
      // NG0950: Required input not available yet. The effect will re-run
      // when the signal input becomes available.
    }
  }

  /**
   * Register the id of the associated form control.
   * @param id
   * @internal
   */
  setFormControl(id: string): void {
    this.formControl.set(id);
  }

  /**
   * Register a label with the form field.
   * @param label
   * @internal
   */
  addLabel(label: string): void {
    this.labels.update(labels => [...labels, label]);
  }

  /**
   * Register a description with the form field.
   * @param description
   * @internal
   */
  addDescription(description: string): void {
    this.descriptions.update(descriptions => [...descriptions, description]);
  }

  /**
   * Remove the associated form control.
   * @internal
   */
  removeFormControl(): void {
    this.formControl.set(null);
  }

  /**
   * Remove a label from the form field.
   * @param label
   * @internal
   */
  removeLabel(label: string): void {
    this.labels.update(labels => labels.filter(l => l !== label));
  }

  /**
   * Remove a description from the form field.
   * @param description
   * @internal
   */
  removeDescription(description: string): void {
    this.descriptions.update(descriptions => descriptions.filter(d => d !== description));
  }
}
