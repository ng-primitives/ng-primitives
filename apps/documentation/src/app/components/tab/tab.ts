import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  computed,
  inject,
} from '@angular/core';
import { TabGroupData } from '../tab-group/tab-group';

@Component({
  selector: 'docs-tab',

  templateUrl: './tab.ng.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[hidden]': '!isActive()',
  },
})
export class Tab {
  /**
   * Access the element ref.
   */
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  /**
   * Access the tab group.
   */
  private readonly tabGroup = this.elementRef.nativeElement.closest<HTMLElement & TabGroupData>(
    'tab-group',
  );

  /**
   * The label of the tab.
   */
  @Input({ required: true }) label!: string;

  /**
   * Determine if this tab is active.
   */
  protected readonly isActive = computed(() => this.tabGroup?.activeTab() === this);

  constructor() {
    this.tabGroup?.add(this);
  }
}
