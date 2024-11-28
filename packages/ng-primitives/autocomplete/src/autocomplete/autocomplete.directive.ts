/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { ActiveDescendantKeyManager } from '@angular/cdk/a11y';
import { BooleanInput } from '@angular/cdk/coercion';
import {
  Directive,
  Injector,
  OnInit,
  booleanAttribute,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { uniqueId } from 'ng-primitives/utils';
import type { NgpAutocompleteOption } from '../autocomplete-option/autocomplete-option.directive';
import { injectAutocompleteTrigger } from '../autocomplete-trigger/autocomplete-trigger.token';
import { injectAutocompleteConfig } from '../config/autocomplete.config';
import { NgpAutocompleteToken } from './autocomplete.token';

@Directive({
  standalone: true,
  selector: '[ngpAutocomplete]',
  exportAs: 'ngpAutocomplete',
  providers: [{ provide: NgpAutocompleteToken, useExisting: NgpAutocomplete }],
  host: {
    '[id]': 'id()',
  },
})
export class NgpAutocomplete<T> implements OnInit {
  /** Access the autcomplete trigger. */
  private readonly trigger = injectAutocompleteTrigger();

  /** Access the injector */
  private readonly injector = inject(Injector);

  /** Access the global autocomplete config */
  private readonly config = injectAutocompleteConfig();

  /**
   * Store the list of options
   * @internal
   */
  readonly options = signal<NgpAutocompleteOption<T>[]>([]);

  /**
   * Get the options sorted by their position in the document
   */
  private sortedOptions = computed(() => {
    // sort the items by their position in the document
    return this.options().sort((a, b) =>
      a.elementRef.nativeElement.compareDocumentPosition(b.elementRef.nativeElement) &
      Node.DOCUMENT_POSITION_FOLLOWING
        ? -1
        : 1,
    );
  });

  /** The id of the autocomplete */
  readonly id = input<string>(uniqueId('ngp-autocomplete'));

  /** Whether the first item should automatically activate */
  readonly autoActiveFirstOption = input<boolean, BooleanInput>(this.config.autoActiveFirstOption, {
    alias: 'ngpAutocompleteAutoActiveFirstOption',
    transform: booleanAttribute,
  });

  /** A function to map the option value to its display value. */
  readonly displayWith = input<(value: T) => string>(value => `${value}`, {
    alias: 'ngpAutocompleteDisplayWith',
  });

  /**
   * Handle the active descendant
   * @internal
   */
  readonly keyManager = new ActiveDescendantKeyManager<NgpAutocompleteOption<T>>(
    this.sortedOptions,
    this.injector,
  );

  ngOnInit(): void {
    this.trigger.registerAutocomplete(this);

    this.keyManager
      .withVerticalOrientation()
      .withWrap()
      .withTypeAhead()
      .withHomeAndEnd()
      .skipPredicate(option => option.optionDisabled());
  }

  /**
   * Register an autcomplete option
   * @internal
   */
  registerOption(option: NgpAutocompleteOption<T>): void {
    this.options.update(options => [...options, option]);
  }

  /**
   * Unregister an autcomplete option
   * @internal
   */
  unregisterOption(option: NgpAutocompleteOption<T>): void {
    this.options.update(options => options.filter(o => o !== option));
  }
}
