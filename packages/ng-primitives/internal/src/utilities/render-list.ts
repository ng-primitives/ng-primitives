import {
  DestroyableInjector,
  ElementRef,
  EmbeddedViewRef,
  Injector,
  Provider,
  TemplateRef,
  ViewContainerRef,
  inject,
  runInInjectionContext,
} from '@angular/core';
import { explicitEffect } from '../signals/explicit-effect';

/**
 * Options for {@link renderList}.
 */
export interface NgpRenderListOptions<T> {
  /** The view container the items are rendered into. */
  readonly viewContainer: ViewContainerRef;
  /** The template instantiated once per item. */
  readonly template: TemplateRef<unknown>;
  /**
   * A reactive source of items. Read inside an effect, so the list re-renders
   * whenever any signal it touches changes.
   */
  readonly items: () => readonly T[];
  /**
   * Build the template context for an item. Defaults to `{ $implicit: item }`.
   */
  readonly context?: (item: T, index: number) => object;
  /**
   * Providers made available to each rendered view's injector (e.g. per-item
   * injection tokens).
   */
  readonly providers?: (item: T, index: number) => Provider[];
  /**
   * The per-item state function, invoked once per rendered element inside an
   * injection context scoped to that item. The rendered element is provided as
   * `ElementRef`, so the function can call `injectElementRef()` like any other
   * `-state.ts` factory. Anything it registers (`dataBinding`, `listener`,
   * effects, `inject(DestroyRef).onDestroy`, ...) is cleaned up automatically
   * when the item is removed or the list is destroyed.
   *
   * If it returns a value (e.g. the state from a `createPrimitive` factory) that
   * value becomes the template context's `$implicit`, so `let item` exposes it.
   */
  readonly setup?: (item: T, index: number) => unknown;
  /** The injector to bind the render effect to. Defaults to the current one. */
  readonly injector?: Injector;
}

/**
 * Render a reactive list of items from a template into a view container,
 * managing the embedded-view lifecycle and per-item state wiring.
 *
 * The list re-renders whenever the reactive `items` source changes. Each item
 * runs its `setup` in its own injector, so effects registered there are torn
 * down when the item is removed or the host is destroyed - callers never manage
 * view refs or cleanup by hand.
 *
 * Must be called from an injection context (e.g. a directive constructor).
 */
export function renderList<T>(options: NgpRenderListOptions<T>): void {
  const injector = options.injector ?? inject(Injector);

  explicitEffect(
    [options.items],
    ([items], onCleanup) => {
      const views: EmbeddedViewRef<unknown>[] = [];
      const injectors: DestroyableInjector[] = [];

      // Registered before rendering so partial state is torn down even if an
      // item's `setup` throws mid-loop.
      onCleanup(() => {
        injectors.forEach(itemInjector => itemInjector.destroy());
        views.forEach(view => view.destroy());
      });

      items.forEach((item, index) => {
        const context = options.context?.(item, index) ?? { $implicit: item };
        const viewInjector = options.providers
          ? Injector.create({
              parent: options.viewContainer.injector,
              providers: options.providers(item, index),
            })
          : undefined;
        if (viewInjector) {
          injectors.push(viewInjector);
        }

        const view = options.viewContainer.createEmbeddedView(
          options.template,
          context,
          viewInjector ? { injector: viewInjector } : undefined,
        );
        views.push(view);

        const element = view.rootNodes[0];
        if (options.setup && element instanceof HTMLElement) {
          // A per-item injector exposes the rendered element via
          // `injectElementRef()` and scopes the item's effects/listeners so they
          // are torn down when the list re-renders or the host is destroyed. It
          // is parented on the view's `providers` injector so a `createPrimitive`
          // item factory can register its state (`provideXState()`) there and the
          // rendered content can inject it.
          const itemInjector = Injector.create({
            parent: viewInjector ?? injector,
            providers: [{ provide: ElementRef, useValue: new ElementRef(element) }],
          });
          injectors.push(itemInjector);
          const state = runInInjectionContext(itemInjector, () => options.setup!(item, index));
          // Expose the item factory's state as the template context.
          if (state !== undefined) {
            (context as { $implicit: unknown }).$implicit = state;
          }
        }

        // Detect changes after `setup` so the view renders with the state above.
        view.detectChanges();
      });
    },
    { injector },
  );
}
