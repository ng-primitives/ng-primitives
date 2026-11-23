import { isPlatformBrowser } from '@angular/common';
import {
  afterRenderEffect,
  DestroyRef,
  effect,
  HostAttributeToken,
  inject,
  PLATFORM_ID,
  untracked,
} from '@angular/core';

/** The tokens a primitive adds to an attribute: a list, or a space-separated string. */
type Tokens = () => string[] | string | null | undefined;

/** What the primitives on one element add to one of its space-separated attributes. */
interface TokenRegistry {
  /** The tokens of each primitive that adds to the attribute. */
  readonly owners: Set<Tokens>;
  /** The consumer's own tokens, read from the attribute whenever the consumer writes it. */
  consumer: string[];
  /** The tokens of the attribute as the consumer's template sets it, whatever the DOM holds. */
  readonly inTemplate: string[];
  /** The value the registry last wrote: an attribute that differs was written by the consumer. */
  written: string | null | undefined;
  /** Reports a consumer's binding that rewrites the attribute while it holds owners' tokens. */
  observer: MutationObserver | null;
}

const registries = new WeakMap<Element, Map<string, TokenRegistry>>();

/**
 * Keep the tokens of a primitive in a space-separated attribute of the element, next to the
 * consumer's own value, set on the element or bound to it, and to the tokens that other primitives
 * on the element add to the same attribute. An attribute no primitive has added a token to stays
 * as the consumer wrote it.
 *
 * Call it where the primitive on the element is created: the attribute its template sets is read
 * from that injection context.
 */
export function addTokens(element: HTMLElement, attr: string, tokens: Tokens): void {
  const inTemplate = tokensOf(inject(new HostAttributeToken(attr), { optional: true }));
  const registry = registerOwner(element, attr, tokens, inTemplate);
  const write = () => {
    tokens();
    untracked(() => writeTokens(element, attr, registry));
  };

  // After render, like `attrBinding`: the consumer's binding has written its value by then.
  if (isPlatformBrowser(inject(PLATFORM_ID))) {
    afterRenderEffect(write);
  } else {
    effect(write);
  }

  inject(DestroyRef).onDestroy(() => unregisterOwner(element, attr, tokens));
}

function registerOwner(
  element: HTMLElement,
  attr: string,
  tokens: Tokens,
  inTemplate: string[],
): TokenRegistry {
  const ofElement = registries.get(element) ?? new Map<string, TokenRegistry>();
  const registry: TokenRegistry = ofElement.get(attr) ?? {
    owners: new Set(),
    consumer: [],
    inTemplate,
    written: undefined,
    observer: null,
  };
  registry.owners.add(tokens);
  registries.set(element, ofElement.set(attr, registry));
  return registry;
}

function unregisterOwner(element: HTMLElement, attr: string, tokens: Tokens): void {
  const ofElement = registries.get(element);
  const registry = ofElement?.get(attr);
  if (!ofElement || !registry) {
    return;
  }
  registry.owners.delete(tokens);
  writeTokens(element, attr, registry);

  if (registry.owners.size === 0) {
    ofElement.delete(attr);
  }
  if (ofElement.size === 0) {
    registries.delete(element);
  }
}

/** Write the attribute as the consumer's tokens followed by every owner's, each token once. */
function writeTokens(element: HTMLElement, attr: string, registry: TokenRegistry): void {
  const owned = [...registry.owners].flatMap(tokens => tokensOf(tokens()));
  // Until a primitive adds a token, the consumer's value stays exactly as written.
  if (registry.written === undefined && owned.length === 0) {
    return;
  }

  const value = element.getAttribute(attr);
  if (registry.written === undefined) {
    registry.consumer = consumerTokensOnFirstRead(tokensOf(value), owned, registry.inTemplate);
  } else if (value !== registry.written) {
    registry.consumer = tokensOf(value);
  }

  const next = [...new Set([...registry.consumer, ...owned])].join(' ');
  registry.written = next || null;

  if (next !== (value ?? '')) {
    if (next) {
      element.setAttribute(attr, next);
    } else {
      element.removeAttribute(attr);
    }
  }

  observeConsumer(element, attr, registry, owned.length > 0);
}

/**
 * The consumer's tokens in an attribute the registry has not written yet. After hydration that
 * attribute already holds the tokens the owners wrote on the server, which are not the consumer's:
 * an owner's token is the consumer's too only where the consumer's template sets it.
 */
function consumerTokensOnFirstRead(
  inDom: string[],
  owned: string[],
  inTemplate: string[],
): string[] {
  return inDom.filter(token => !owned.includes(token) || inTemplate.includes(token));
}

/**
 * Watch the attribute while it holds owners' tokens: a binding of the consumer writes the whole
 * attribute when its value changes, and the tokens are added back.
 */
function observeConsumer(
  element: HTMLElement,
  attr: string,
  registry: TokenRegistry,
  holdsOwnersTokens: boolean,
): void {
  if (!holdsOwnersTokens) {
    registry.observer?.disconnect();
    registry.observer = null;
    return;
  }

  if (!registry.observer && typeof MutationObserver !== 'undefined') {
    registry.observer = new MutationObserver(() => writeTokens(element, attr, registry));
    registry.observer.observe(element, { attributeFilter: [attr] });
  }
}

function tokensOf(value: string[] | string | null | undefined): string[] {
  const values = typeof value === 'string' ? [value] : (value ?? []);
  // An owner can add several tokens in one string, such as alternative keys of one shortcut, and
  // a consumer's list can be separated by any whitespace.
  return values.flatMap(tokens => tokens.split(/\s+/)).filter(Boolean);
}
