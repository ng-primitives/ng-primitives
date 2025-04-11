import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Signal,
  inject,
  signal,
} from '@angular/core';
import type { Tab } from '../tab/tab';

@Component({
  selector: 'docs-tab-group',
  templateUrl: './tab-group.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass],
})
export class TabGroup {
  private readonly elementRef = inject<ElementRef<HTMLElement & TabGroupData>>(ElementRef);
  protected readonly activeTab = signal<Tab | null>(null);
  protected readonly tabs = signal<Tab[]>([]);

  constructor() {
    // expose the add method to the custom element
    this.elementRef.nativeElement.activeTab = this.activeTab;
    this.elementRef.nativeElement.add = this.add.bind(this);
  }

  add(tab: Tab): void {
    this.tabs.update(prev => [...prev, tab]);

    // if no tab is active, set the first tab as active
    if (!this.activeTab()) {
      this.activeTab.update(() => tab);
    }
  }
}

export interface TabGroupData {
  activeTab: Signal<Tab | null>;
  add(tab: Tab): void;
}
