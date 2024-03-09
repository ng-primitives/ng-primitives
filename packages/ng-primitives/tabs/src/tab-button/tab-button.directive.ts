import { BooleanInput } from '@angular/cdk/coercion';
import { Directive, HostListener, booleanAttribute, computed, input } from '@angular/core';
import { NgpRovingFocusItemDirective } from '@ng-primitives/ng-primitives/roving-focus';
import { injectTabset } from '../tabset/tabset.token';

@Directive({
  standalone: true,
  selector: '[ngpTabButton]',
  exportAs: 'ngpTabButton',
  host: {
    role: 'tab',
    '[attr.id]': 'id() ?? defaultId()',
    '[attr.aria-controls]': 'ariaControls()',
    '[attr.data-state]': 'active() ? "active" : "inactive"',
    '[attr.data-disabled]': 'disabled()',
    '[attr.data-orientation]': 'tabset.orientation()',
  },
  hostDirectives: [NgpRovingFocusItemDirective],
})
export class NgpTabButtonDirective {
  /**
   * Access the tabset
   */
  protected readonly tabset = injectTabset();

  /**
   * The value of the tab this trigger controls
   */
  readonly value = input.required<string>({ alias: 'ngpTabButtonValue' });

  /**
   * Whether the tab is disabled
   * @default false
   */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpTabButtonDisabled',
    transform: booleanAttribute,
  });

  /**
   * Determine the id of the tab button
   * @internal
   */
  readonly id = input<string>();

  /**
   * Determine a unique id for the tab button if not provided
   * @internal
   */
  readonly defaultId = computed(() => `${this.tabset.id()}-button-${this.value()}`);

  /**
   * Determine the aria-controls of the tab button
   * @internal
   */
  readonly ariaControls = computed(() => `${this.tabset.id()}-panel-${this.value()}`);

  /**
   * Whether the tab is active
   */
  readonly active = computed(() => this.tabset.value() === this.value());

  /**
   * Select the tab this trigger controls
   */
  @HostListener('click')
  select(): void {
    this.tabset.select(this.value());
  }

  /**
   * On focus select the tab this trigger controls if activateOnFocus is true
   */
  @HostListener('focus')
  protected activateOnFocus(): void {
    if (this.tabset.activateOnFocus()) {
      this.select();
    }
  }
}
