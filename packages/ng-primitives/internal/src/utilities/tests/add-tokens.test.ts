import { Component, Directive, ElementRef, inject, signal } from '@angular/core';
import { render } from '@testing-library/angular';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { addTokens } from '../add-tokens';

describe('addTokens', () => {
  afterEach(() => vi.restoreAllMocks());

  @Component({ template: '' })
  class TwoOwners {
    readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    readonly first = signal<string[]>([]);
    readonly second = signal<string[]>([]);

    constructor() {
      addTokens(this.element, 'aria-describedby', this.first);
      addTokens(this.element, 'aria-describedby', this.second);
    }
  }

  it('should remove the tokens of each owner once both have withdrawn them', async () => {
    const { fixture } = await render(TwoOwners);
    const { element, first, second } = fixture.componentInstance;

    first.set(['desc']);
    await fixture.whenStable();
    second.set(['tip']);
    await fixture.whenStable();
    expect(element).toHaveAttribute('aria-describedby', 'desc tip');

    second.set([]);
    await fixture.whenStable();
    // let an observer of the attribute see the write before the next one
    await Promise.resolve();
    first.set([]);
    await fixture.whenStable();

    expect(element).not.toHaveAttribute('aria-describedby');
  });

  it('should observe only its attribute, and only while it holds a token', async () => {
    const observe = vi.spyOn(MutationObserver.prototype, 'observe');
    const disconnect = vi.spyOn(MutationObserver.prototype, 'disconnect');
    const { fixture } = await render(TwoOwners);
    const { element, first } = fixture.componentInstance;
    expect(observe).not.toHaveBeenCalledWith(element, expect.anything());

    first.set(['desc']);
    await fixture.whenStable();
    expect(observe).toHaveBeenCalledExactlyOnceWith(element, {
      attributeFilter: ['aria-describedby'],
    });

    first.set([]);
    await fixture.whenStable();
    expect(disconnect).toHaveBeenCalledOnce();
  });

  @Component({ template: '' })
  class ServerRendered {
    readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    readonly owner = signal<string[]>(['err']);

    constructor() {
      // the attribute as hydration finds it: the consumer's `hint`, then the owner's `err`
      this.element.setAttribute('aria-describedby', 'hint err');
      addTokens(this.element, 'aria-describedby', this.owner);
    }
  }

  it('should remove a token the owner wrote on the server once the owner withdraws it', async () => {
    const { fixture } = await render(ServerRendered);
    const { element, owner } = fixture.componentInstance;
    await fixture.whenStable();
    expect(element).toHaveAttribute('aria-describedby', 'hint err');

    owner.set([]);
    await fixture.whenStable();

    expect(element).toHaveAttribute('aria-describedby', 'hint');
  });

  @Directive({ selector: '[owner]' })
  class Owner {
    constructor() {
      addTokens(
        inject<ElementRef<HTMLElement>>(ElementRef).nativeElement,
        'aria-describedby',
        () => ['err'],
      );
    }
  }

  it('should add a token once to a list the consumer separates with a newline or a tab', async () => {
    const { fixture } = await render('<input owner aria-describedby="hint\n\terr" />', {
      imports: [Owner],
    });
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('input')).toHaveAttribute(
      'aria-describedby',
      'hint err',
    );
  });
});
