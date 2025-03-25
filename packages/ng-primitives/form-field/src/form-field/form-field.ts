/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Directive, OnDestroy, contentChild, signal } from '@angular/core';
import { NgControl } from '@angular/forms';
import { onChange } from 'ng-primitives/utils';
import { Subscription } from 'rxjs';
import { NgpFormFieldToken } from './form-field-token';

@Directive({
  selector: '[ngpFormField]',
  exportAs: 'ngpFormField',
  providers: [{ provide: NgpFormFieldToken, useExisting: NgpFormField }],
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

    // set the initial values
    this.updateStatus();

    // Listen for changes to the form control.
    this.subscription = control?.valueChanges?.subscribe(this.updateStatus.bind(this));
  }

  private updateStatus(): void {
    const control = this.ngControl();

    if (!control) {
      return;
    }

    this.pristine.set(control.pristine);
    this.touched.set(control.touched);
    this.dirty.set(control.dirty);
    this.valid.set(control.valid);
    this.invalid.set(control.invalid);
    this.pending.set(control.pending);
    this.disabled.set(control.disabled);
    this.errors.set(control?.errors ? Object.keys(control.errors) : []);
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
