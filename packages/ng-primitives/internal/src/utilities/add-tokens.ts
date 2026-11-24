import { isPlatformBrowser } from '@angular/common';
import { DestroyRef, inject, PLATFORM_ID, untracked } from '@angular/core';
import { isomorphicEffect } from 'ng-primitives/state';

/** Where the tokens a primitive adds to an attribute come from: a list, or a space-separated string. */
type TokenSource = () => string[] | string | null | undefined;

/**
 * Keep the tokens of a primitive in a space-separated attribute of the element, next to the
 * consumer's own value, set on the element or bound to it, and to the tokens that other primitives
 * on the element add to the same attribute. An attribute no primitive has added a token to stays
 * as the consumer wrote it.
 */
export function addTokens(element: HTMLElement, attr: string, tokens: TokenSource): void {
  const onServer = !isPlatformBrowser(inject(PLATFORM_ID));
  const registry = TokenRegistry.of(element, attr, onServer);
  const removeOwner = registry.addOwner(tokens);

  // After render, like `attrBinding`: the consumer's binding has written its value by then.
  isomorphicEffect(() => {
    tokens();
    untracked(() => registry.write());
  });

  inject(DestroyRef).onDestroy(removeOwner);
}

/**
 * What the primitives on one element add to one of its space-separated attributes. It remembers
 * the tokens it added, so everything else in the attribute is the consumer's, whoever wrote it and
 * whenever. A token the consumer writes after an owner added the same one is the owner's.
 */
class TokenRegistry {
  private static readonly registries = new WeakMap<Element, Map<string, TokenRegistry>>();

  static of(element: HTMLElement, attr: string, onServer: boolean): TokenRegistry {
    const byAttribute = this.registries.get(element) ?? new Map<string, TokenRegistry>();
    const registry = byAttribute.get(attr) ?? new TokenRegistry(element, attr, onServer);
    this.registries.set(element, byAttribute.set(attr, registry));
    return registry;
  }

  /** One record per `addTokens` call: two primitives that pass one source stay two owners. */
  private readonly owners = new Set<{ readonly tokens: TokenSource }>();
  /** The owners' tokens in the attribute that the consumer had not written there itself. */
  private added: string[];
  /**
   * Carries `added` from the server render to the browser. The ids the owners have there differ,
   * so the text of the hydrated attribute cannot tell the server's ids from the consumer's tokens.
   */
  private readonly addedOnServerAttr: string;
  private observer: MutationObserver | null = null;

  private constructor(
    private readonly element: HTMLElement,
    private readonly attr: string,
    private readonly onServer: boolean,
  ) {
    this.addedOnServerAttr = `data-ngp-added-${attr}`;
    this.added = tokensOf(element.getAttribute(this.addedOnServerAttr));
    element.removeAttribute(this.addedOnServerAttr);
  }

  /** Returns the function that removes the owner, and its tokens with it. */
  addOwner(tokens: TokenSource): () => void {
    const owner = { tokens };
    this.owners.add(owner);

    return () => {
      this.owners.delete(owner);
      this.write();
    };
  }

  /** Write the attribute as the consumer's tokens followed by every owner's, each token once. */
  write(): void {
    const owned = [...this.owners].flatMap(owner => tokensOf(owner.tokens()));

    // An attribute that holds no owner's token and gets none stays exactly as the consumer wrote it.
    if (this.added.length > 0 || owned.length > 0) {
      const value = this.element.getAttribute(this.attr);
      const consumer = tokensOf(value).filter(token => !this.added.includes(token));
      this.added = [...new Set(owned)].filter(token => !consumer.includes(token));
      const next = [...new Set(consumer), ...this.added].join(' ');

      if (next !== (value ?? '')) {
        setOrRemoveAttribute(this.element, this.attr, next);
      }
      if (this.onServer) {
        setOrRemoveAttribute(this.element, this.addedOnServerAttr, this.added.join(' '));
      }
    }

    this.observeConsumer(owned.length > 0);
  }

  /**
   * Watch the attribute while it holds owners' tokens: a binding of the consumer writes the whole
   * attribute when its value changes, and the tokens are added back.
   */
  private observeConsumer(holdsOwnersTokens: boolean): void {
    if (!holdsOwnersTokens) {
      this.observer?.disconnect();
      this.observer = null;
      return;
    }

    // Not `fromMutationObserver`: it runs an effect in one injector, and the owners that share the
    // registry each have their own.
    if (!this.observer && typeof MutationObserver !== 'undefined') {
      this.observer = new MutationObserver(() => this.write());
      this.observer.observe(this.element, { attributeFilter: [this.attr] });
    }
  }
}

function setOrRemoveAttribute(element: HTMLElement, attr: string, value: string): void {
  if (value) {
    element.setAttribute(attr, value);
  } else {
    element.removeAttribute(attr);
  }
}

function tokensOf(value: string[] | string | null | undefined): string[] {
  const values = typeof value === 'string' ? [value] : (value ?? []);
  // An owner can add several tokens in one string, such as alternative keys of one shortcut, and
  // a consumer's list can be separated by any whitespace.
  return values.flatMap(tokens => tokens.split(/\s+/)).filter(Boolean);
}
