import {
  ConfigurableFocusTrap,
  ConfigurableFocusTrapFactory,
  InteractivityChecker,
} from '@angular/cdk/a11y';
import { Signal } from '@angular/core';
import { NgpDrawerFocusTarget, NgpDrawerModal } from '../drawer.types';
import { resolveFocusTarget } from './dom';
import { DrawerStackService } from './drawer-stack.service';
import { DrawerState } from './drawer-state';
import { isolateDrawerModal } from './modal-isolation';
import { nextDrawerFrame } from './transition-coordinator';

export class DrawerFocusManager {
  private trap: ConfigurableFocusTrap | null = null;
  private restoreIsolation: (() => void) | null = null;
  private priorFocus: HTMLElement | null = null;
  private active = false;

  constructor(
    private readonly state: DrawerState,
    private readonly popup: HTMLElement,
    private readonly initialFocus: Signal<NgpDrawerFocusTarget>,
    private readonly finalFocus: Signal<NgpDrawerFocusTarget>,
    private readonly document: Document,
    private readonly focusTrapFactory: ConfigurableFocusTrapFactory,
    private readonly checker: InteractivityChecker,
    private readonly stack: DrawerStackService,
  ) {}

  activate(): void {
    if (!this.active) {
      this.active = true;
      this.priorFocus = this.activeElement();
      void this.focusInitial();
    }
    this.syncMode(this.state.modal());
  }

  deactivate(): void {
    if (!this.active) {
      return;
    }
    const mode = this.state.modal();
    this.active = false;
    this.destroyTrap();
    this.restoreIsolation?.();
    this.restoreIsolation = null;
    this.restoreFocus(mode);
    this.priorFocus = null;
  }

  destroy(): void {
    this.deactivate();
  }

  private syncMode(mode: NgpDrawerModal): void {
    if (mode === false) {
      this.destroyTrap();
    } else if (!this.trap) {
      this.trap = this.focusTrapFactory.create(this.popup, { defer: false });
    }

    if (mode === true && !this.restoreIsolation) {
      this.restoreIsolation = isolateDrawerModal(this.document, this.popup, this.state.backdrop());
    } else if (mode !== true && this.restoreIsolation) {
      this.restoreIsolation();
      this.restoreIsolation = null;
    }
  }

  private async focusInitial(): Promise<void> {
    await nextDrawerFrame(this.document);
    if (!this.active || !this.state.open() || !this.stack.isTop(this.state)) {
      return;
    }
    const requested = this.initialFocus();
    if (requested === false) {
      return;
    }
    const explicit = resolveFocusTarget(requested, this.document);
    const marked = this.popup.querySelector<HTMLElement>('[cdkFocusInitial]');
    const target = explicit ?? marked ?? this.popup;
    if (target === this.popup || this.checker.isFocusable(target)) {
      target.focus({ preventScroll: true });
    } else {
      this.popup.focus({ preventScroll: true });
    }
  }

  private restoreFocus(mode: NgpDrawerModal): void {
    const requested = this.finalFocus();
    if (requested === false) {
      return;
    }
    const explicit = resolveFocusTarget(requested, this.document);
    if (explicit?.isConnected) {
      explicit.focus({ preventScroll: true });
      return;
    }

    const activeElement = this.activeElement();
    if (mode === false && activeElement && !this.popup.contains(activeElement)) {
      return;
    }

    const triggerId = this.state.triggerId();
    const triggerById = triggerId ? this.document.getElementById(triggerId) : null;
    const target = [triggerById, this.state.activeTrigger(), this.priorFocus].find(
      candidate => candidate?.isConnected,
    );
    target?.focus({ preventScroll: true });
  }

  private activeElement(): HTMLElement | null {
    return this.document.activeElement instanceof HTMLElement ? this.document.activeElement : null;
  }

  private destroyTrap(): void {
    this.trap?.destroy();
    this.trap = null;
  }
}
