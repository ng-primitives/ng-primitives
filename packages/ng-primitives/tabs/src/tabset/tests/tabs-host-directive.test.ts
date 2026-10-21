import { NgTemplateOutlet } from '@angular/common';
import {
  Component,
  computed,
  contentChildren,
  Directive,
  input,
  signal,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { By } from '@angular/platform-browser';
import { fireEvent, render, screen } from '@testing-library/angular';
import { NgpOrientation } from 'ng-primitives/common';
import {
  injectRovingFocusGroupState,
  injectRovingFocusItemState,
} from 'ng-primitives/roving-focus';
import {
  injectTabsetState,
  NgpTabButton,
  NgpTabList,
  NgpTabPanel,
  NgpTabset,
  provideTabsetState,
} from 'ng-primitives/tabs';
import { describe, expect, it } from 'vitest';

@Directive({ selector: '[testTabStopProbe]' })
class TabStopProbe {
  readonly #group = injectRovingFocusGroupState();
  readonly #item = injectRovingFocusItemState();

  readonly isTabStop = computed(() => this.#group().activeItem() === this.#item().id());
}

@Directive({
  selector: '[testForwardKeys]',
  host: { '(keydown)': 'onKeydown($event)' },
})
class ForwardKeys {
  readonly #group = injectRovingFocusGroupState({ optional: true });

  onKeydown(event: KeyboardEvent): void {
    this.#group()?.onKeydown(event);
  }
}

@Component({
  selector: 'test-tab',
  imports: [NgpTabButton, TabStopProbe, ForwardKeys],
  template: `
    <ng-template #button>
      <button
        [ngpTabButtonValue]="value()"
        [ngpTabButtonDisabled]="disabled()"
        ngpTabButton
        testTabStopProbe
      >
        {{ value() }}
      </button>
      <span [attr.data-testid]="value() + '-action'" tabindex="-1" testForwardKeys>Action</span>
    </ng-template>
  `,
})
class TestTab {
  readonly value = input.required<string>();
  readonly disabled = input(false);
  readonly button = viewChild.required<TemplateRef<void>>('button');
}

@Component({
  selector: 'test-tabs',
  providers: [provideTabsetState()],
  hostDirectives: [
    {
      directive: NgpTabset,
      inputs: ['ngpTabsetOrientation: orientation'],
      outputs: ['ngpTabsetValueChange'],
    },
  ],
  imports: [NgpTabList, NgpTabPanel, NgTemplateOutlet],
  template: `
    <div ngpTabList>
      @for (tab of tabs(); track tab.value()) {
        <ng-container [ngTemplateOutlet]="tab.button()" />
      }
    </div>
    <div [ngpTabPanelValue]="selected() ?? ''" ngpTabPanel>Panel {{ selected() }}</div>
  `,
})
class TestTabs {
  readonly #state = injectTabsetState();
  readonly tabs = contentChildren(TestTab);
  readonly selected = computed(() => this.#state().selectedTab());

  constructor() {
    this.#state().setActivateOnFocus(false);
  }
}

@Component({
  imports: [TestTabs, TestTab],
  template: `
    <test-tabs [orientation]="orientation()" (ngpTabsetValueChange)="changes.push($event)">
      <test-tab value="one" />
      <test-tab [disabled]="twoDisabled()" value="two" />
      <test-tab value="three" />
    </test-tabs>
  `,
})
class TabsHost {
  readonly orientation = signal<NgpOrientation>('horizontal');
  readonly twoDisabled = signal(false);
  readonly changes: string[] = [];
}

async function renderTabs() {
  const result = await render(TabsHost);
  const tab = (name: string) => screen.getByRole('tab', { name });
  return { ...result, tab };
}

describe('NgpTabset composed as a host directive', () => {
  it('should apply manual activation set through the injected state', async () => {
    const { fixture, tab } = await renderTabs();

    tab('one').focus();
    fireEvent.keyDown(tab('one'), { key: 'ArrowRight' });

    expect(tab('two')).toHaveFocus();
    expect(tab('one')).toHaveAttribute('data-active');
    expect(tab('two')).not.toHaveAttribute('data-active');

    fireEvent.click(tab('two'));
    fixture.detectChanges();

    expect(tab('two')).toHaveAttribute('data-active');
    expect(fixture.componentInstance.changes).toEqual(['two']);
  });

  it('should report the focused tab, not the selected one, as the roving tab stop', async () => {
    const { fixture, tab } = await renderTabs();
    const probes = fixture.debugElement
      .queryAll(By.directive(TabStopProbe))
      .map(el => el.injector.get(TabStopProbe));

    tab('one').focus();
    fireEvent.keyDown(tab('one'), { key: 'ArrowRight' });

    expect(probes.map(probe => probe.isTabStop())).toEqual([false, true, false]);
    expect(tab('one')).toHaveAttribute('data-active');
  });

  it('should move between tabs when another element forwards its keydown to the group state', async () => {
    const { tab } = await renderTabs();

    fireEvent.keyDown(screen.getByTestId('one-action'), { key: 'ArrowRight' });

    expect(tab('two')).toHaveFocus();
  });

  it('should expose data-orientation on the tab list and tab buttons and update it', async () => {
    const { fixture, tab } = await renderTabs();
    const tabList = screen.getByRole('tablist');

    expect(tabList).toHaveAttribute('data-orientation', 'horizontal');
    expect(tab('one')).toHaveAttribute('data-orientation', 'horizontal');

    fixture.componentInstance.orientation.set('vertical');
    fixture.detectChanges();

    expect(tabList).toHaveAttribute('data-orientation', 'vertical');
    expect(tab('one')).toHaveAttribute('data-orientation', 'vertical');
  });

  it('should skip a tab disabled at runtime during keyboard navigation', async () => {
    const { fixture, tab } = await renderTabs();

    fixture.componentInstance.twoDisabled.set(true);
    fixture.detectChanges();

    expect(tab('two')).toHaveAttribute('data-disabled');

    tab('one').focus();
    fireEvent.keyDown(tab('one'), { key: 'ArrowRight' });

    expect(tab('three')).toHaveFocus();
  });

  it('should link a single panel bound to the selected value to the active tab', async () => {
    const { fixture, tab } = await renderTabs();
    const panel = screen.getByRole('tabpanel');

    expect(panel).toHaveAttribute('aria-labelledby', tab('one').id);

    fireEvent.click(tab('three'));
    fixture.detectChanges();

    expect(screen.getByRole('tabpanel')).toHaveAttribute('aria-labelledby', tab('three').id);
    expect(tab('three')).toHaveAttribute('aria-controls', screen.getByRole('tabpanel').id);
  });
});
