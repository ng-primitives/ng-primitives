import { afterRenderEffect, computed, signal, Signal } from '@angular/core';
import {
  explicitEffect,
  fromMutationObserver,
  injectDimensions,
  injectElementRef,
} from 'ng-primitives/internal';
import { attrBinding, createPrimitive, dataBinding, listener } from 'ng-primitives/state';
import { safeTakeUntilDestroyed, uniqueId } from 'ng-primitives/utils';
import { debounceTime } from 'rxjs/operators';
import { injectCollapsibleState } from '../collapsible/collapsible-state';

export interface NgpCollapsibleContentState {
  /**
   * The id of the content region.
   */
  readonly id: Signal<string>;
}

export interface NgpCollapsibleContentProps {
  /**
   * The id of the content region.
   */
  readonly id?: Signal<string>;
  /**
   * The CSS custom property prefix for the measured dimensions. The content's
   * width and height are exposed as `--<prefix>-width` and `--<prefix>-height`.
   * @default 'ngp-collapsible-content'
   */
  readonly cssVarPrefix?: string;
}

export const [
  NgpCollapsibleContentStateToken,
  ngpCollapsibleContent,
  injectCollapsibleContentState,
  provideCollapsibleContentState,
] = createPrimitive(
  'NgpCollapsibleContent',
  ({
    id = signal(uniqueId('ngp-collapsible-content')),
    cssVarPrefix = 'ngp-collapsible-content',
  }: NgpCollapsibleContentProps): NgpCollapsibleContentState => {
    const element = injectElementRef<HTMLElement>();
    const collapsible = injectCollapsibleState();
    const dimensions = injectDimensions();

    const widthVar = `--${cssVarPrefix}-width`;
    const heightVar = `--${cssVarPrefix}-height`;

    const hidden = computed(() =>
      !collapsible().open() && dimensions().height === 0 ? 'until-found' : null,
    );

    // Host bindings
    attrBinding(element, 'id', id);
    attrBinding(element, 'hidden', hidden);

    dataBinding(element, 'data-orientation', collapsible().orientation);
    dataBinding(element, 'data-open', collapsible().open);
    dataBinding(element, 'data-closed', () => !collapsible().open());
    dataBinding(element, 'data-disabled', collapsible().disabled);

    // data-enter is set when the collapsible opens (user interaction), data-exit when it closes.
    // Neither is set on initial render, preventing animation on page load.
    const enter = signal(false);
    const exit = signal(false);
    dataBinding(element, 'data-enter', enter);
    dataBinding(element, 'data-exit', exit);

    listener(element, 'beforematch', onBeforeMatch);
    const clearAnimation = (event: AnimationEvent) => {
      if (event.target === element.nativeElement) {
        enter.set(false);
        exit.set(false);
      }
    };
    listener(element, 'animationend', clearAnimation);
    listener(element, 'animationcancel', clearAnimation);

    // Register the content with the collapsible state
    collapsible().setContent(id());

    /**
     * Handle the beforematch event to automatically open the collapsible
     * when the browser's find-in-page functionality tries to reveal hidden content.
     * The disabled guard lives in the collapsible state's toggle().
     */
    function onBeforeMatch(): void {
      if (collapsible().open()) {
        return;
      }
      collapsible().toggle();
    }

    function updateDimensions(): void {
      if (collapsible().open()) {
        const scrollHeight = element.nativeElement.scrollHeight;

        // Element is inside a hidden container (e.g. inactive tab with display:none).
        // All three dimensions are 0 only when the element has no layout at all.
        // Checking dimensions() (from ResizeObserver) prevents misidentifying
        // legitimately empty content (e.g. all children removed) as a hidden container.
        const { width, height } = dimensions();
        if (scrollHeight === 0 && width === 0 && height === 0) {
          return;
        }

        const scrollWidth = element.nativeElement.scrollWidth;

        // remove the inline styles to reset them
        element.nativeElement.style.removeProperty(widthVar);
        element.nativeElement.style.removeProperty(heightVar);
        // set the dimensions based on the content
        element.nativeElement.style.setProperty(widthVar, `${scrollWidth}px`);
        element.nativeElement.style.setProperty(heightVar, `${scrollHeight}px`);
      }
    }

    // Track dimensions() so this effect re-runs when the element becomes visible.
    // Handles the case where the collapsible is initialized inside a hidden container.
    afterRenderEffect(() => {
      dimensions(); // reactive dep — re-runs when element resizes (e.g. container becomes visible)
      updateDimensions();
    });

    // Drive enter/exit attributes based on open state changes.
    // Skips the initial run so no animation plays on page load.
    let initialized = false;
    explicitEffect([collapsible().open], ([isOpen]) => {
      if (!initialized) {
        initialized = true;
        return;
      }
      if (isOpen) {
        exit.set(false);
        enter.set(true);
      } else {
        enter.set(false);
        exit.set(true);
      }
    });

    // update dimensions when the content changes
    fromMutationObserver(element.nativeElement, {
      childList: true,
      subtree: true,
      disabled: computed(() => !collapsible().open()),
    })
      .pipe(debounceTime(0), safeTakeUntilDestroyed())
      .subscribe(() => updateDimensions());

    return { id } satisfies NgpCollapsibleContentState;
  },
);
