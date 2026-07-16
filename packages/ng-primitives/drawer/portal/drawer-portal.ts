import { Overlay } from '@angular/cdk/overlay';
import { DOCUMENT } from '@angular/common';
import {
  afterRenderEffect,
  ApplicationRef,
  booleanAttribute,
  computed,
  DestroyRef,
  Directive,
  ElementRef,
  inject,
  Injector,
  input,
  TemplateRef,
  untracked,
  ViewContainerRef,
} from '@angular/core';
import { injectDrawerState, requireDrawerState } from '../internal/drawer-state';
import { DrawerPortalAdapter } from '../internal/portal-adapter';
import { nextDrawerFrame, waitForDrawerTransition } from '../internal/transition-coordinator';

type DrawerPortalPhase = 'detached' | 'entering' | 'open' | 'exiting' | 'hidden';

interface PortalRenderState {
  readonly open: boolean;
  readonly mounted: boolean;
  readonly container: HTMLElement | null;
  readonly unmountGeneration: number;
  readonly keepMounted: boolean;
  readonly preventUnmount: boolean;
}

@Directive({ selector: 'ng-template[ngpDrawerPortal]', standalone: true })
export class NgpDrawerPortal {
  readonly keepMounted = input(false, { transform: booleanAttribute });
  readonly container = input<HTMLElement | ElementRef<HTMLElement> | null>(null);

  private readonly document = inject(DOCUMENT);
  private readonly overlay = inject(Overlay);
  private readonly templateRef = inject<TemplateRef<unknown>>(TemplateRef);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly applicationRef = inject(ApplicationRef);
  private readonly injector = inject(Injector);
  private adapter: DrawerPortalAdapter | null = null;
  private currentContainer: HTMLElement | null = null;
  private phase: DrawerPortalPhase = 'detached';
  private destroyed = false;
  private readonly portalRenderState = computed<PortalRenderState>(() => ({
    open: this.state.open(),
    mounted: this.state.mounted(),
    container: this.resolveContainer(),
    unmountGeneration: this.state.unmountGeneration(),
    keepMounted: this.keepMounted(),
    preventUnmount: this.state.preventUnmount(),
  }));

  private readonly state = requireDrawerState(
    injectDrawerState({ optional: true }),
    'ngpDrawerPortal',
  );

  constructor() {
    const releasePart = this.state.claimPart('portal');
    afterRenderEffect({
      mixedReadWrite: () => {
        const renderState = this.portalRenderState();
        untracked(() => this.syncPortal(renderState));
      },
    });

    inject(DestroyRef).onDestroy(() => {
      this.destroyed = true;
      releasePart();
      this.detachImmediately();
    });
  }

  private syncPortal(renderState: PortalRenderState): void {
    if (renderState.container !== this.currentContainer) {
      this.detachImmediately();
      this.currentContainer = renderState.container;
    }

    if (!renderState.mounted) {
      this.detachImmediately();
    } else if (renderState.open) {
      if (this.phase === 'detached' || this.phase === 'hidden' || this.phase === 'exiting') {
        void this.enter();
      }
    } else if (this.phase === 'open' || this.phase === 'entering') {
      void this.exit();
    } else if (this.phase === 'detached') {
      if (renderState.keepMounted || renderState.preventUnmount) {
        this.attachHidden();
      } else {
        this.state.requestUnmount();
      }
    } else if (this.phase === 'hidden' && !renderState.keepMounted && !renderState.preventUnmount) {
      this.state.requestUnmount();
    }
  }

  private async enter(): Promise<void> {
    const generation = this.state.nextTransitionGeneration();
    this.phase = 'entering';
    const adapter = this.adapter ?? this.createAdapter();
    this.state.endingStyle.set(false);
    this.state.startingStyle.set(true);
    this.state.portalVisible.set(true);
    adapter.attach();
    adapter.show();
    this.state.portalAttached.set(true);

    await nextDrawerFrame(this.document);
    if (!this.isCurrent(generation, adapter) || !this.state.open()) {
      return;
    }
    this.state.startingStyle.set(false);
    await waitForDrawerTransition(this.transitionElements(), this.document);
    if (this.isCurrent(generation, adapter) && this.state.open()) {
      this.phase = 'open';
      this.state.completeOpenChange(true);
    }
  }

  private async exit(): Promise<void> {
    const generation = this.state.nextTransitionGeneration();
    const adapter = this.adapter;
    this.phase = 'exiting';
    this.state.startingStyle.set(false);
    this.state.endingStyle.set(true);
    await waitForDrawerTransition(this.transitionElements(), this.document);
    if (!this.isCurrent(generation, adapter) || this.state.open()) {
      return;
    }

    this.state.completeOpenChange(false);
    if (this.keepMounted() || this.state.preventUnmount()) {
      adapter?.hide();
      this.state.portalVisible.set(false);
      this.phase = 'hidden';
      this.state.endingStyle.set(false);
    } else {
      this.state.requestUnmount();
      this.detachImmediately();
    }
  }

  private transitionElements(): HTMLElement[] {
    return [this.state.backdrop(), this.state.viewport(), this.state.popup()].filter(
      (element): element is HTMLElement => element !== null,
    );
  }

  private isCurrent(generation: number, adapter: DrawerPortalAdapter | null): boolean {
    return (
      !this.destroyed &&
      this.adapter === adapter &&
      this.state.transitionGeneration() === generation
    );
  }

  private detachImmediately(): void {
    this.state.nextTransitionGeneration();
    const adapter = this.adapter;
    this.adapter = null;
    adapter?.destroy();
    this.state.portalAttached.set(false);
    this.state.portalVisible.set(false);
    this.phase = 'detached';
    this.state.startingStyle.set(false);
    this.state.endingStyle.set(false);
  }

  private attachHidden(): void {
    const adapter = this.createAdapter();
    this.state.startingStyle.set(false);
    this.state.endingStyle.set(false);
    adapter.attach();
    adapter.hide();
    this.state.portalAttached.set(true);
    this.state.portalVisible.set(false);
    this.phase = 'hidden';
  }

  private createAdapter(): DrawerPortalAdapter {
    const adapter = new DrawerPortalAdapter(
      this.overlay,
      this.templateRef,
      this.viewContainerRef,
      this.applicationRef,
      this.injector,
      this.document,
      this.currentContainer,
      () => this.handleExternalDetach(adapter),
    );
    this.adapter = adapter;
    return adapter;
  }

  private handleExternalDetach(adapter: DrawerPortalAdapter): void {
    if (this.destroyed || this.adapter !== adapter) {
      return;
    }
    this.state.nextTransitionGeneration();
    this.adapter = null;
    this.state.portalAttached.set(false);
    this.state.portalVisible.set(false);
    this.phase = 'detached';
    this.state.requestUnmount();
  }

  private resolveContainer(): HTMLElement | null {
    const value = this.container();
    return value instanceof ElementRef ? value.nativeElement : value;
  }
}
