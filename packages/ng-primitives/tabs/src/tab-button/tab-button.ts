import { BooleanInput } from '@angular/cdk/coercion';
import {
  Directive,
  HOST_TAG_NAME,
  HostListener,
  OnInit,
  booleanAttribute,
  computed,
  inject,
  input,
} from '@angular/core';
import { setupInteractions } from 'ng-primitives/internal';
import { NgpRovingFocusItem } from 'ng-primitives/roving-focus';
import { injectTabsetState } from '../tabset/tabset-state';

/**
 * Apply the `ngpTabButton` directive to an element within a tab list to represent a tab button. This directive should be applied to a button element.
 */
@Directive({
  selector: '[ngpTabButton]',
  exportAs: 'ngpTabButton',
  host: {
    role: 'tab',
    '[attr.id]': 'buttonId()',
    '[attr.aria-controls]': 'ariaControls()',
    '[attr.data-active]': 'active() ? "" : null',
    '[attr.data-disabled]': 'disabled() ? "" : null',
    '[attr.disabled]': 'tagName === "button" && disabled() ? "" : null',
    '[attr.data-orientation]': 'state().orientation()',
  },
  hostDirectives: [NgpRovingFocusItem],
})
export class NgpTabButton implements OnInit {
  /**
   * Access the tag host name
   */
  protected readonly tagName = inject(HOST_TAG_NAME);

  /**
   * Access the tabset state
   */
  protected readonly state = injectTabsetState();

  /**
   * The value of the tab this trigger controls
   */
  readonly value = input<string>(undefined, { alias: 'ngpTabButtonValue' });

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
  readonly buttonId = computed(() => this.id() ?? `${this.state().id()}-button-${this.value()}`);

  /**
   * Determine the aria-controls of the tab button
   * @internal
   */
  readonly ariaControls = computed(() => `${this.state().id()}-panel-${this.value()}`);

  /**
   * Whether the tab is active
   */
  readonly active = computed(() => this.state().selectedTab() === this.value());

  constructor() {
    setupInteractions({
      hover: true,
      press: true,
      focusVisible: true,
      disabled: this.disabled,
    });
  }

  ngOnInit(): void {
    if (this.value() === undefined) {
      throw new Error('ngpTabButton: value is required');
    }
  }

  /**
   * Select the tab this trigger controls
   */
  @HostListener('click')
  select(): void {
    if (this.disabled() === false) {
      this.state().select(this.value()!);
    }
  }

  /**
   * On focus select the tab this trigger controls if activateOnFocus is true
   */
  @HostListener('focus')
  protected activateOnFocus(): void {
    if (this.state().activateOnFocus()) {
      this.select();
    }
  }
}
