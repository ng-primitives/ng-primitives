import { Signal, computed } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { attrBinding, createPrimitive, dataBinding, onMount } from 'ng-primitives/state';
import { injectTabsetState } from '../tabset/tabset-state';

/**
 * The state for the NgpTabPanel directive.
 */
export interface NgpTabPanelState {
  /**
   * The unique id for the tab panel.
   */
  readonly panelId: Signal<string>;

  /**
   * The aria-labelledby attribute for the tab panel.
   */
  readonly labelledBy: Signal<string>;

  /**
   * Whether the tab panel is active.
   */
  readonly active: Signal<boolean>;
}

/**
 * The props for the NgpTabPanel state.
 */
export interface NgpTabPanelProps {
  /**
   * The value of the tab this panel represents.
   */
  readonly value: Signal<string | undefined>;

  /**
   * The id of the tab panel.
   */
  readonly id?: Signal<string | undefined>;
}

export const [NgpTabPanelStateToken, ngpTabPanel, injectTabPanelState, provideTabPanelState] =
  createPrimitive('NgpTabPanel', ({ value, id }: NgpTabPanelProps) => {
    const element = injectElementRef();
    const tabset = injectTabsetState();

    // Computed properties
    const panelId = computed(() => id?.() ?? `${tabset().id()}-panel-${value?.()}`);
    const labelledBy = computed(() => `${tabset().id()}-button-${value?.()}`);
    const active = computed(() => tabset().selectedTab() === value?.());

    // Host bindings
    attrBinding(element, 'role', 'tabpanel');
    attrBinding(element, 'tabindex', '0');
    attrBinding(element, 'id', panelId);
    attrBinding(element, 'aria-labelledby', labelledBy);
    dataBinding(element, 'data-active', active);
    dataBinding(element, 'data-orientation', () => tabset().orientation());

    // Ensure value is provided
    onMount(() => {
      if (value() === undefined) {
        throw new Error('ngpTabPanel: value is required');
      }
    });

    return {
      panelId,
      labelledBy,
      active,
    };
  });
