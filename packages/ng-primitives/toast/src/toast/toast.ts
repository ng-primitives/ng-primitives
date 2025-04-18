import { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import { DomPortalOutlet, TemplatePortal } from '@angular/cdk/portal';
import { DOCUMENT } from '@angular/common';
import {
  booleanAttribute,
  Directive,
  inject,
  Injector,
  input,
  numberAttribute,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { injectToastConfig } from '../config/toast-config';
import { NgpToastGravity, NgpToastPosition, NgpToastRef } from './toast-ref';

export interface NgpToastContext {
  dismiss: () => void;
}

@Directive({
  selector: '[ngpToast]',
  exportAs: 'ngpToast',
})
export class NgpToast {
  private readonly config = injectToastConfig();

  /** Access the ng-template */
  private readonly template = inject<TemplateRef<NgpToastContext>>(TemplateRef);

  /** Access the view container */
  private readonly viewContainer = inject(ViewContainerRef);

  /** Access the injector */
  private readonly injector = inject(Injector);

  /** Access the document */
  private readonly document = inject(DOCUMENT);

  /**
   * The duration the toast will display for before it is automatically dismissed in milliseconds.
   * @default 3000
   */
  readonly duration = input<number, NumberInput>(this.config.duration, {
    alias: 'ngpToastDuration',
    transform: numberAttribute,
  });

  /**
   * The direction the toast will appear from.
   * @default 'top'
   */
  readonly gravity = input<NgpToastGravity>(this.config.gravity, {
    alias: 'ngpToastGravity',
  });

  /**
   * The position the toast will on the horizontal axis.
   * @default 'end'
   */
  readonly position = input<NgpToastPosition>(this.config.position, {
    alias: 'ngpToastPosition',
  });

  /**
   * Whether the automatic dismissal of the toast should be paused when the user hovers over it.
   * @default true
   */
  readonly stopOnHover = input<boolean, BooleanInput>(this.config.stopOnHover, {
    alias: 'ngpToastStopOnHover',
    transform: booleanAttribute,
  });

  /**
   * Whether the toast should be announced to assistive technologies.
   * @default 'polite'
   */
  readonly ariaLive = input(this.config.ariaLive, {
    alias: 'ngpToastAriaLive',
  });

  /** Store the list of toasts */
  private toasts: NgpToastRef[] = [];

  /** Show the toast. */
  show(): void {
    this.createToast();
    this.reposition();
  }

  /** Build the toast */
  private createToast(): void {
    const portal = new TemplatePortal<NgpToastContext>(
      this.template,
      this.viewContainer,
      {
        dismiss: () => toastRef.dismiss(),
      },
      this.injector,
    );

    const domOutlet = new DomPortalOutlet(
      this.document.body,
      undefined,
      undefined,
      Injector.create({
        parent: this.injector,
        providers: [],
      }),
    );

    const viewRef = domOutlet.attach(portal);
    viewRef.detectChanges();

    const toastElement = viewRef.rootNodes[0];

    const toastRef = new NgpToastRef(
      toastElement,
      this.duration(),
      this.position(),
      this.gravity(),
      this.stopOnHover(),
      this.ariaLive(),
      () => {
        this.toasts = this.toasts.filter(t => t !== toastRef);
        this.reposition();
      },
    );

    this.toasts = [...this.toasts, toastRef];
  }

  /** Position the toast on the DOM */
  private reposition(): void {
    const topStartOffsetSize = {
      top: this.config.gap,
      bottom: this.config.gap,
    };

    const topEndOffsetSize = {
      top: this.config.gap,
      bottom: this.config.gap,
    };

    let position: 'top' | 'bottom';

    // update the position of the toasts
    for (const toast of this.toasts) {
      // Getting the applied gravity
      position = toast.gravity;

      const height = toast.height;

      if (toast.position === 'start') {
        toast.setInset(position, `${topStartOffsetSize[position]}px`);
        topStartOffsetSize[position] += height + this.config.gap;
      } else {
        toast.setInset(position, `${topEndOffsetSize[position]}px`);
        topEndOffsetSize[position] += height + this.config.gap;
      }
    }
  }
}
