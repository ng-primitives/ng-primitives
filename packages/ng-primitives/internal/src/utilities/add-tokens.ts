import { isPlatformServer } from '@angular/common';
import { afterRenderEffect, DestroyRef, inject, PLATFORM_ID, untracked } from '@angular/core';

/** Where the tokens a primitive adds to an attribute come from: a list, or a space-separated string. */
type TokenSource = () => string[] | string | null | undefined;

/**
 * Keep the tokens of a primitive in a space-separated attribute of the element, next to the
 * consumer's own value, set on the element or bound to it, and to the tokens that other primitives
 * on the element add to the same attribute. An attribute no primitive has added a token to stays
 * as the consumer wrote it. The tokens are added in the browser only: the ids a primitive generates
 * differ between the server and the browser, so one written on the server could not be told from a
 * consumer's token after hydration. Must be called in an injection context.
 */
export function addTokens(element: HTMLElement, attr: string, tokens: TokenSource): void {
  if (isPlatformServer(inject(PLATFORM_ID))) {
    return;
  }

  const registry = TokenRegistry.of(element, attr);
  const removeOwner = registry.addOwner(tokens);

  // After render, like `attrBinding`: the consumer's binding has written its value by then.
  afterRenderEffect(() => {
    tokens();
    untracked(() => registry.write());
  });

  inject(DestroyRef).onDestroy(removeOwner);
}

/**
 * What the primitives on one element add to one of its space-separated attributes. Owners' tokens
 * are added in the browser only, so on the first read every token in the attribute is the
 * consumer's. After that it remembers the tokens it added: everything else is the consumer's,
 * whoever wrote it and whenever. A token the consumer writes after an owner added the same one is
 * the owner's.
 */
class TokenRegistry {
  private static readonly registries = new WeakMap<Element, Map<string, TokenRegistry>>();

  static of(element: HTMLElement, attr: string): TokenRegistry {
    const byAttribute = this.registries.get(element) ?? new Map<string, TokenRegistry>();
    const registry = byAttribute.get(attr) ?? new TokenRegistry(element, attr);
    this.registries.set(element, byAttribute.set(attr, registry));
    return registry;
  }

  /** One record per `addTokens` call: two primitives that pass one source stay two owners. */
  private readonly owners = new Set<{ readonly tokens: TokenSource }>();
  /** The owners' tokens in the attribute that the consumer had not written there itself. */
  private added: string[] = [];
  private observer: MutationObserver | null = null;

  private constructor(
    private readonly element: HTMLElement,
    private readonly attr: string,
  ) {}

  /** Returns the function that removes the owner, and its tokens with it. */
  addOwner(tokens: TokenSource): () => void {
    const owner = { tokens };
    this.owners.add(owner);

    return () => {
      this.owners.delete(owner);
      this.write();
    };
  }

  /**
   * Write the attribute as the consumer's tokens followed by the owners' tokens it lacks, each
   * token once. While the registry has no token to add and none of its own to remove, the
   * attribute is left exactly as the consumer wrote it.
   */
  write(): void {
    const owned = [...this.owners].flatMap(owner => tokensOf(owner.tokens()));

    const value = this.element.getAttribute(this.attr);
    const consumer = tokensOf(value).filter(token => !this.added.includes(token));
    const nextAdded = [...new Set(owned)].filter(token => !consumer.includes(token));
    const changesOwnTokens = this.added.length > 0 || nextAdded.length > 0;

    if (changesOwnTokens) {
      const rewritten = [...new Set(consumer), ...nextAdded].join(' ');

      if (rewritten !== (value ?? '')) {
        setOrRemoveAttribute(this.element, this.attr, rewritten);
      }
    }

    this.added = nextAdded;
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
    if (!this.observer) {
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

/** What separates tokens in HTML: ASCII whitespace only, so a token can hold a non-breaking space. */
const TOKEN_SEPARATOR = /[\t\n\f\r ]+/;

function tokensOf(value: string[] | string | null | undefined): string[] {
  const values = typeof value === 'string' ? [value] : (value ?? []);
  // An owner can add several tokens in one string, such as alternative keys of one shortcut.
  return values.flatMap(tokens => tokens.split(TOKEN_SEPARATOR)).filter(Boolean);
}
