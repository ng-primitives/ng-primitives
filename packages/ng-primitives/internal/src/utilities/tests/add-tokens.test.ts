import {
  Component,
  createEnvironmentInjector,
  Directive,
  ElementRef,
  EnvironmentInjector,
  inject,
  PLATFORM_ID,
  runInInjectionContext,
  signal,
} from '@angular/core';
import { By } from '@angular/platform-browser';
import { render } from '@testing-library/angular';
import { afterEach, describe, expect, it, onTestFinished, vi } from 'vitest';
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
    // the spies see every observer on the page: only those of the element count
    const ofElement = ([target]: [Node, ...unknown[]]) => target === element;
    const observations = () => observe.mock.calls.filter(ofElement);
    expect(observations()).toHaveLength(0);

    first.set(['desc']);
    await fixture.whenStable();
    expect(observations()).toEqual([[element, { attributeFilter: ['aria-describedby'] }]]);
    const observer = observe.mock.contexts[observe.mock.calls.findIndex(ofElement)];

    first.set([]);
    await fixture.whenStable();
    expect(disconnect.mock.contexts.filter(context => context === observer)).toHaveLength(1);
  });

  it("should keep a token appended from outside as the consumer's", async () => {
    const { fixture } = await render(TwoOwners);
    const { element, first } = fixture.componentInstance;
    first.set(['tip']);
    await fixture.whenStable();

    // as the CDK's `AriaDescriber` does
    element.setAttribute('aria-describedby', `${element.getAttribute('aria-describedby')} x`);
    await Promise.resolve();
    first.set([]);
    await fixture.whenStable();

    expect(element).toHaveAttribute('aria-describedby', 'x');
  });

  @Component({ template: '' })
  class SharedSource {
    readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    private readonly shared = signal(['desc']);
    private readonly parent = inject(EnvironmentInjector);

    addOwner(): EnvironmentInjector {
      const injector = createEnvironmentInjector([], this.parent);
      runInInjectionContext(injector, () =>
        addTokens(this.element, 'aria-describedby', this.shared),
      );
      // also when an assertion fails before the test destroys it
      onTestFinished(() => {
        if (!injector.destroyed) {
          injector.destroy();
        }
      });
      return injector;
    }
  }

  it('should keep the tokens of an owner when another owner with the same source is destroyed', async () => {
    const { fixture } = await render(SharedSource);
    const { element } = fixture.componentInstance;
    fixture.componentInstance.addOwner();
    const second = fixture.componentInstance.addOwner();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(element).toHaveAttribute('aria-describedby', 'desc');

    second.destroy();

    expect(element).toHaveAttribute('aria-describedby', 'desc');
  });

  it("should leave the attribute to the consumer's tokens on the server", async () => {
    const { fixture } = await render(TwoOwners, {
      providers: [{ provide: PLATFORM_ID, useValue: 'server' }],
    });
    const { element, first } = fixture.componentInstance;
    element.setAttribute('aria-describedby', 'hint');

    first.set(['ngp-description-57']);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(element).toHaveAttribute('aria-describedby', 'hint');
  });

  @Directive({ selector: '[owner]' })
  class Owner {
    readonly tokens = signal(['err']);

    constructor() {
      addTokens(
        inject<ElementRef<HTMLElement>>(ElementRef).nativeElement,
        'aria-describedby',
        this.tokens,
      );
    }
  }

  it('should keep a token the consumer binds once an owner with the same token withdraws it', async () => {
    const { fixture } = await render('<input owner [attr.aria-describedby]="hint" />', {
      imports: [Owner],
      componentProperties: { hint: 'err' },
    });
    await fixture.whenStable();

    fixture.debugElement.query(By.directive(Owner)).injector.get(Owner).tokens.set([]);
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('input')).toHaveAttribute('aria-describedby', 'err');
  });

  it('should add a token once to a list the consumer separates with a newline or a tab', async () => {
    const { fixture } = await render('<input owner aria-describedby="hint\n\terr" />', {
      imports: [Owner],
    });
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('input')).toHaveAttribute(
      'aria-describedby',
      'hint\n\terr',
    );
  });

  it('should keep a non-breaking space inside a token of the consumer', async () => {
    const { fixture } = await render('<input owner aria-describedby="help\u00a0text" />', {
      imports: [Owner],
    });
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('input')).toHaveAttribute(
      'aria-describedby',
      'help\u00a0text err',
    );
  });

  it('should leave the attribute as the consumer wrote it when it already holds the tokens of the owners', async () => {
    const { fixture } = await render('<input owner aria-describedby="err  hint err" />', {
      imports: [Owner],
    });
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('input')).toHaveAttribute(
      'aria-describedby',
      'err  hint err',
    );
  });
});
