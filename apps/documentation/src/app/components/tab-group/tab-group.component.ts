import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Signal,
  inject,
  signal,
} from '@angular/core';
import type { TabComponent } from '../tab/tab.component';

@Component({
  selector: 'docs-tab-group',
  templateUrl: './tab-group.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass],
})
export class TabGroupComponent {
  private readonly elementRef = inject<ElementRef<HTMLElement & TabGroup>>(ElementRef);
  protected readonly activeTab = signal<TabComponent | null>(null);
  protected readonly tabs = signal<TabComponent[]>([]);

  constructor() {
    // expose the add method to the custom element
    this.elementRef.nativeElement.activeTab = this.activeTab;
    this.elementRef.nativeElement.add = this.add.bind(this);
  }

  add(tab: TabComponent): void {
    this.tabs.update(prev => [...prev, tab]);

    // if no tab is active, set the first tab as active
    if (!this.activeTab()) {
      this.activeTab.update(() => tab);
    }
  }
}

export interface TabGroup {
  activeTab: Signal<TabComponent | null>;
  add(tab: TabComponent): void;
}
