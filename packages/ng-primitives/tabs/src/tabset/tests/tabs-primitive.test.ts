import { Dir } from '@angular/cdk/bidi';
import { By } from '@angular/platform-browser';
import { fireEvent, render } from '@testing-library/angular';
import { NgpTabButton, NgpTabList, NgpTabPanel, NgpTabset } from 'ng-primitives/tabs';
import { describe, expect, it, vi } from 'vitest';

const imports = [NgpTabset, NgpTabButton, NgpTabList, NgpTabPanel];

/**
 * A standard three-tab tabset used across many tests.
 */
function threeTabs(attrs = ''): string {
  return `<div ngpTabset ${attrs}>
      <div ngpTabList>
        <button ngpTabButton ngpTabButtonValue="overview">Overview</button>
        <button ngpTabButton ngpTabButtonValue="features">Features</button>
        <button ngpTabButton ngpTabButtonValue="docs">Docs</button>
      </div>
      <div ngpTabPanel ngpTabPanelValue="overview">Overview content</div>
      <div ngpTabPanel ngpTabPanelValue="features">Features content</div>
      <div ngpTabPanel ngpTabPanelValue="docs">Docs content</div>
    </div>`;
}

describe('NgpTabset (primitive)', () => {
  describe('roles & attributes', () => {
    it('should set role="tablist" on the tab list', async () => {
      const { getByRole } = await render(threeTabs(), { imports });
      expect(getByRole('tablist')).toBeTruthy();
    });

    it('should set role="tab" on each tab button', async () => {
      const { getAllByRole } = await render(threeTabs(), { imports });
      expect(getAllByRole('tab')).toHaveLength(3);
    });

    it('should set role="tabpanel" on the active panel', async () => {
      const { getByRole } = await render(threeTabs(), { imports });
      expect(getByRole('tabpanel', { name: 'Overview' })).toHaveAttribute('role', 'tabpanel');
    });

    it('should apply a generated id by default', async () => {
      const { container } = await render(threeTabs(), { imports });
      expect(container.querySelector('[ngpTabset]')?.id).toMatch(/^ngp-tabset-/);
    });

    it('should reflect a custom id', async () => {
      const { container } = await render(threeTabs('id="my-tabs"'), { imports });
      expect(container.querySelector('[ngpTabset]')).toHaveAttribute('id', 'my-tabs');
    });

    it('should mirror the tabset orientation onto the tab list via aria-orientation', async () => {
      const { getByRole } = await render(threeTabs(), { imports });
      expect(getByRole('tablist')).toHaveAttribute('aria-orientation', 'horizontal');
    });
  });

  describe('selection', () => {
    it('should select the first tab by default', async () => {
      const { getByRole } = await render(threeTabs(), { imports });
      expect(getByRole('tab', { name: 'Overview' })).toHaveAttribute('data-active');
      expect(getByRole('tab', { name: 'Features' })).not.toHaveAttribute('data-active');
    });

    it('should select the tab named by the value input', async () => {
      const { getByRole } = await render(threeTabs('ngpTabsetValue="features"'), { imports });
      expect(getByRole('tab', { name: 'Features' })).toHaveAttribute('data-active');
      expect(getByRole('tab', { name: 'Overview' })).not.toHaveAttribute('data-active');
    });

    it('should select a tab when clicked and emit valueChange', async () => {
      const valueChange = vi.fn();
      const { getByRole } = await render(
        threeTabs('(ngpTabsetValueChange)="valueChange($event)"'),
        { imports, componentProperties: { valueChange } },
      );

      const features = getByRole('tab', { name: 'Features' });
      fireEvent.click(features);

      expect(features).toHaveAttribute('data-active');
      expect(getByRole('tab', { name: 'Overview' })).not.toHaveAttribute('data-active');
      expect(valueChange).toHaveBeenCalledWith('features');
      expect(valueChange).toHaveBeenCalledTimes(1);
    });

    it('should not re-emit when the already-selected tab is clicked', async () => {
      const valueChange = vi.fn();
      const { getByRole } = await render(
        threeTabs('ngpTabsetValue="overview" (ngpTabsetValueChange)="valueChange($event)"'),
        { imports, componentProperties: { valueChange } },
      );

      fireEvent.click(getByRole('tab', { name: 'Overview' }));
      expect(valueChange).not.toHaveBeenCalled();
    });

    it('should reflect a two-way bound value that changes from the host', async () => {
      const { getByRole, rerender, detectChanges } = await render(
        `<div ngpTabset [ngpTabsetValue]="value">
          <div ngpTabList>
            <button ngpTabButton ngpTabButtonValue="overview">Overview</button>
            <button ngpTabButton ngpTabButtonValue="features">Features</button>
          </div>
          <div ngpTabPanel ngpTabPanelValue="overview">Overview content</div>
          <div ngpTabPanel ngpTabPanelValue="features">Features content</div>
        </div>`,
        { imports, componentProperties: { value: 'overview' } },
      );

      expect(getByRole('tab', { name: 'Overview' })).toHaveAttribute('data-active');

      await rerender({ componentProperties: { value: 'features' } });
      detectChanges();

      expect(getByRole('tab', { name: 'Features' })).toHaveAttribute('data-active');
      expect(getByRole('tab', { name: 'Overview' })).not.toHaveAttribute('data-active');
    });

    it('should select the tab button even when there are no tab panels', async () => {
      const { getByRole } = await render(
        `<div ngpTabset ngpTabsetValue="features">
          <div ngpTabList>
            <button ngpTabButton ngpTabButtonValue="overview">Overview</button>
            <button ngpTabButton ngpTabButtonValue="features">Features</button>
          </div>
        </div>`,
        { imports: [NgpTabset, NgpTabButton, NgpTabList] },
      );

      expect(getByRole('tab', { name: 'Features' })).toHaveAttribute('data-active');
    });
  });

  describe('aria-selected & panel wiring', () => {
    it('should expose aria-selected reflecting the active state', async () => {
      const { getByRole } = await render(threeTabs(), { imports });

      expect(getByRole('tab', { name: 'Overview' })).toHaveAttribute('aria-selected', 'true');
      expect(getByRole('tab', { name: 'Features' })).toHaveAttribute('aria-selected', 'false');
    });

    it('should update aria-selected & data-active when selection changes', async () => {
      const { getByRole } = await render(threeTabs(), { imports });

      const overview = getByRole('tab', { name: 'Overview' });
      const features = getByRole('tab', { name: 'Features' });

      fireEvent.click(features);

      expect(features).toHaveAttribute('aria-selected', 'true');
      expect(features).toHaveAttribute('data-active');
      expect(overview).toHaveAttribute('aria-selected', 'false');
      expect(overview).not.toHaveAttribute('data-active');
    });

    it('should point each tab aria-controls at its panel id', async () => {
      const { getByRole } = await render(threeTabs(), { imports });

      const tab = getByRole('tab', { name: 'Overview' });
      const panel = getByRole('tabpanel', { name: 'Overview' });

      expect(tab.getAttribute('aria-controls')).toBe(panel.id);
    });

    it('should point each panel aria-labelledby at its tab id', async () => {
      const { getByRole } = await render(threeTabs(), { imports });

      const tab = getByRole('tab', { name: 'Overview' });
      const panel = getByRole('tabpanel', { name: 'Overview' });

      expect(panel.getAttribute('aria-labelledby')).toBe(tab.id);
    });

    it('should only expose the active panel and hide the inactive ones', async () => {
      const { getByRole, container } = await render(threeTabs(), { imports });

      const activePanel = getByRole('tabpanel', { name: 'Overview' });
      const hiddenPanel = container.querySelector('[ngpTabPanelValue="features"]') as HTMLElement;

      expect(activePanel).toHaveAttribute('tabindex', '0');
      expect(activePanel).not.toHaveAttribute('aria-hidden');

      expect(hiddenPanel).not.toHaveAttribute('tabindex');
      expect(hiddenPanel).toHaveAttribute('aria-hidden', 'true');
    });

    it('should move tabindex/aria-hidden between panels when switching tabs', async () => {
      const { getByRole, container } = await render(threeTabs(), { imports });

      fireEvent.click(getByRole('tab', { name: 'Features' }));

      const overviewPanel = container.querySelector('[ngpTabPanelValue="overview"]') as HTMLElement;
      const featuresPanel = getByRole('tabpanel', { name: 'Features' });

      expect(featuresPanel).toHaveAttribute('tabindex', '0');
      expect(featuresPanel).not.toHaveAttribute('aria-hidden');
      expect(overviewPanel).not.toHaveAttribute('tabindex');
      expect(overviewPanel).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('roving focus (tabindex)', () => {
    it('should place tabindex="0" on one tab and "-1" on the others', async () => {
      const { getByRole } = await render(threeTabs(), { imports });

      expect(getByRole('tab', { name: 'Overview' })).toHaveAttribute('tabindex', '0');
      expect(getByRole('tab', { name: 'Features' })).toHaveAttribute('tabindex', '-1');
      expect(getByRole('tab', { name: 'Docs' })).toHaveAttribute('tabindex', '-1');
    });

    it('should move the tabbable tab as focus roves with the arrow keys', async () => {
      const { getByRole } = await render(threeTabs(), { imports });

      const overview = getByRole('tab', { name: 'Overview' });
      const features = getByRole('tab', { name: 'Features' });

      overview.focus();
      fireEvent.keyDown(overview, { key: 'ArrowRight' });

      expect(features).toHaveAttribute('tabindex', '0');
      expect(overview).toHaveAttribute('tabindex', '-1');
    });

    it('should make the selected tab the tab stop (ARIA APG)', async () => {
      const { getByRole } = await render(threeTabs('ngpTabsetValue="features"'), { imports });

      const overview = getByRole('tab', { name: 'Overview' });
      const features = getByRole('tab', { name: 'Features' });

      // the selected tab (Features) is the single tab in the focus order
      expect(features).toHaveAttribute('data-active');
      expect(features).toHaveAttribute('aria-selected', 'true');
      expect(features).toHaveAttribute('tabindex', '0');
      expect(overview).toHaveAttribute('tabindex', '-1');
    });

    it('should make the first tab the tab stop when none is selected', async () => {
      const { getByRole } = await render(threeTabs(), { imports });
      expect(getByRole('tab', { name: 'Overview' })).toHaveAttribute('tabindex', '0');
    });

    it('should move the tab stop when the selection changes programmatically (focus outside)', async () => {
      const { getByRole, rerender, fixture } = await render(threeTabs('[ngpTabsetValue]="value"'), {
        imports,
        componentProperties: { value: 'overview' },
      });

      const overview = getByRole('tab', { name: 'Overview' });
      const features = getByRole('tab', { name: 'Features' });
      expect(overview).toHaveAttribute('tabindex', '0');

      // change the selected tab from outside the tablist (nothing focused here)
      await rerender({ componentProperties: { value: 'features' } });
      await fixture.whenStable();

      // the tab stop follows the selection
      expect(features).toHaveAttribute('tabindex', '0');
      expect(overview).toHaveAttribute('tabindex', '-1');
    });
  });

  describe('keyboard navigation', () => {
    it('should move focus & activate with ArrowRight/ArrowLeft (horizontal)', async () => {
      const { getByRole } = await render(threeTabs(), { imports });

      const overview = getByRole('tab', { name: 'Overview' });
      const features = getByRole('tab', { name: 'Features' });
      const docs = getByRole('tab', { name: 'Docs' });

      overview.focus();

      fireEvent.keyDown(overview, { key: 'ArrowRight' });
      expect(features).toHaveFocus();
      expect(features).toHaveAttribute('data-active');

      fireEvent.keyDown(features, { key: 'ArrowRight' });
      expect(docs).toHaveFocus();
      expect(docs).toHaveAttribute('data-active');

      fireEvent.keyDown(docs, { key: 'ArrowLeft' });
      expect(features).toHaveFocus();
      expect(features).toHaveAttribute('data-active');
    });

    it('should move focus & activate with ArrowDown/ArrowUp (vertical)', async () => {
      const { getByRole } = await render(threeTabs('ngpTabsetOrientation="vertical"'), { imports });

      const overview = getByRole('tab', { name: 'Overview' });
      const features = getByRole('tab', { name: 'Features' });
      const docs = getByRole('tab', { name: 'Docs' });

      overview.focus();

      fireEvent.keyDown(overview, { key: 'ArrowDown' });
      expect(features).toHaveFocus();

      fireEvent.keyDown(features, { key: 'ArrowDown' });
      expect(docs).toHaveFocus();

      fireEvent.keyDown(docs, { key: 'ArrowUp' });
      expect(features).toHaveFocus();
    });

    it('should jump to the first and last tabs with Home and End', async () => {
      const { getByRole } = await render(threeTabs('ngpTabsetValue="features"'), { imports });

      const overview = getByRole('tab', { name: 'Overview' });
      const features = getByRole('tab', { name: 'Features' });
      const docs = getByRole('tab', { name: 'Docs' });

      features.focus();

      fireEvent.keyDown(features, { key: 'Home' });
      expect(overview).toHaveFocus();
      expect(overview).toHaveAttribute('data-active');

      fireEvent.keyDown(overview, { key: 'End' });
      expect(docs).toHaveFocus();
      expect(docs).toHaveAttribute('data-active');
    });

    it('should ignore vertical keys in horizontal orientation', async () => {
      const { getByRole } = await render(threeTabs(), { imports });

      const overview = getByRole('tab', { name: 'Overview' });
      overview.focus();

      fireEvent.keyDown(overview, { key: 'ArrowDown' });
      fireEvent.keyDown(overview, { key: 'ArrowUp' });

      expect(overview).toHaveFocus();
      expect(overview).toHaveAttribute('data-active');
    });

    it('should ignore horizontal keys in vertical orientation', async () => {
      const { getByRole } = await render(threeTabs('ngpTabsetOrientation="vertical"'), { imports });

      const overview = getByRole('tab', { name: 'Overview' });
      overview.focus();

      fireEvent.keyDown(overview, { key: 'ArrowLeft' });
      fireEvent.keyDown(overview, { key: 'ArrowRight' });

      expect(overview).toHaveFocus();
      expect(overview).toHaveAttribute('data-active');
    });

    it('should wrap arrow navigation around the tab list (config wrap defaults to true)', async () => {
      const { getByRole } = await render(threeTabs(), { imports });

      const overview = getByRole('tab', { name: 'Overview' });
      const features = getByRole('tab', { name: 'Features' });
      const docs = getByRole('tab', { name: 'Docs' });

      // navigate to the last tab
      overview.focus();
      fireEvent.keyDown(overview, { key: 'ArrowRight' });
      fireEvent.keyDown(features, { key: 'ArrowRight' });
      expect(docs).toHaveFocus();

      // one more ArrowRight wraps to the first
      fireEvent.keyDown(docs, { key: 'ArrowRight' });
      expect(overview).toHaveFocus();

      // and ArrowLeft from the first wraps back to the last
      fireEvent.keyDown(overview, { key: 'ArrowLeft' });
      expect(docs).toHaveFocus();
    });

    it('should not wrap when ngpTabsetWrap is false', async () => {
      const { getByRole } = await render(threeTabs('ngpTabsetWrap="false"'), { imports });

      const overview = getByRole('tab', { name: 'Overview' });
      const features = getByRole('tab', { name: 'Features' });
      const docs = getByRole('tab', { name: 'Docs' });

      overview.focus();
      fireEvent.keyDown(overview, { key: 'ArrowRight' });
      fireEvent.keyDown(features, { key: 'ArrowRight' });
      expect(docs).toHaveFocus();

      // at the end, ArrowRight stays put (no wrap)
      fireEvent.keyDown(docs, { key: 'ArrowRight' });
      expect(docs).toHaveFocus();
    });
  });

  describe('orientation', () => {
    it('should default to horizontal', async () => {
      const { getByRole } = await render(threeTabs(), { imports });
      expect(getByRole('tablist')).toHaveAttribute('data-orientation', 'horizontal');
    });

    it('should honour the vertical orientation input', async () => {
      const { getByRole } = await render(threeTabs('ngpTabsetOrientation="vertical"'), { imports });
      expect(getByRole('tablist')).toHaveAttribute('data-orientation', 'vertical');
    });

    it('should update orientation dynamically', async () => {
      const { getByRole, rerender, detectChanges } = await render(
        `<div ngpTabset [ngpTabsetOrientation]="orientation">
          <div ngpTabList>
            <button ngpTabButton ngpTabButtonValue="overview">Overview</button>
            <button ngpTabButton ngpTabButtonValue="features">Features</button>
          </div>
          <div ngpTabPanel ngpTabPanelValue="overview">Overview content</div>
          <div ngpTabPanel ngpTabPanelValue="features">Features content</div>
        </div>`,
        { imports, componentProperties: { orientation: 'horizontal' } },
      );

      const tablist = getByRole('tablist');
      expect(tablist).toHaveAttribute('data-orientation', 'horizontal');

      await rerender({ componentProperties: { orientation: 'vertical' } });
      detectChanges();

      expect(tablist).toHaveAttribute('data-orientation', 'vertical');
      expect(tablist).toHaveAttribute('aria-orientation', 'vertical');
    });
  });

  describe('activation mode', () => {
    it('should activate on focus by default (automatic activation)', async () => {
      const { getByRole } = await render(threeTabs(), { imports });

      const overview = getByRole('tab', { name: 'Overview' });
      const features = getByRole('tab', { name: 'Features' });

      fireEvent.focus(features);

      expect(features).toHaveAttribute('data-active');
      expect(overview).not.toHaveAttribute('data-active');
    });

    it('should not activate on focus in manual mode; click activates', async () => {
      const { getByRole } = await render(threeTabs('ngpTabsetActivateOnFocus="false"'), {
        imports,
      });

      const overview = getByRole('tab', { name: 'Overview' });
      const features = getByRole('tab', { name: 'Features' });

      features.focus();
      // focus alone does not change the selected tab in manual mode
      expect(overview).toHaveAttribute('data-active');
      expect(features).not.toHaveAttribute('data-active');

      fireEvent.click(features);
      expect(features).toHaveAttribute('data-active');
      expect(overview).not.toHaveAttribute('data-active');
    });

    it('should rove focus without activating in manual mode', async () => {
      const { getByRole } = await render(threeTabs('ngpTabsetActivateOnFocus="false"'), {
        imports,
      });

      const overview = getByRole('tab', { name: 'Overview' });
      const features = getByRole('tab', { name: 'Features' });

      overview.focus();
      fireEvent.keyDown(overview, { key: 'ArrowRight' });

      expect(features).toHaveFocus();
      // still not activated - only focus moved
      expect(overview).toHaveAttribute('data-active');
      expect(features).not.toHaveAttribute('data-active');
    });
  });

  describe('disabled tabs', () => {
    it('should expose disabled/data-disabled and block click selection', async () => {
      const valueChange = vi.fn();
      const { getByRole } = await render(
        `<div ngpTabset (ngpTabsetValueChange)="valueChange($event)">
          <div ngpTabList>
            <button ngpTabButton ngpTabButtonValue="overview">Overview</button>
            <button ngpTabButton ngpTabButtonDisabled ngpTabButtonValue="features">Features</button>
          </div>
          <div ngpTabPanel ngpTabPanelValue="overview">Overview content</div>
          <div ngpTabPanel ngpTabPanelValue="features">Features content</div>
        </div>`,
        { imports, componentProperties: { valueChange } },
      );

      const features = getByRole('tab', { name: 'Features' });
      expect(features).toBeDisabled();
      expect(features).toHaveAttribute('data-disabled');

      fireEvent.click(features);
      expect(features).not.toHaveAttribute('data-active');
      expect(valueChange).not.toHaveBeenCalled();
    });

    it('should skip disabled tabs during keyboard navigation', async () => {
      const { getByRole } = await render(
        `<div ngpTabset>
          <div ngpTabList>
            <button ngpTabButton ngpTabButtonValue="overview">Overview</button>
            <button ngpTabButton ngpTabButtonDisabled ngpTabButtonValue="features">Features</button>
            <button ngpTabButton ngpTabButtonValue="docs">Docs</button>
          </div>
          <div ngpTabPanel ngpTabPanelValue="overview">Overview content</div>
          <div ngpTabPanel ngpTabPanelValue="features">Features content</div>
          <div ngpTabPanel ngpTabPanelValue="docs">Docs content</div>
        </div>`,
        { imports },
      );

      const overview = getByRole('tab', { name: 'Overview' });
      const docs = getByRole('tab', { name: 'Docs' });

      overview.focus();
      fireEvent.keyDown(overview, { key: 'ArrowRight' });

      expect(docs).toHaveFocus();
      expect(docs).toHaveAttribute('data-active');
    });

    it('should default selection to the first non-disabled tab', async () => {
      const { getByRole } = await render(
        `<div ngpTabset>
          <div ngpTabList>
            <button ngpTabButton ngpTabButtonDisabled ngpTabButtonValue="overview">Overview</button>
            <button ngpTabButton ngpTabButtonValue="features">Features</button>
          </div>
          <div ngpTabPanel ngpTabPanelValue="overview">Overview content</div>
          <div ngpTabPanel ngpTabPanelValue="features">Features content</div>
        </div>`,
        { imports },
      );

      expect(getByRole('tab', { name: 'Overview' })).not.toHaveAttribute('data-active');
      expect(getByRole('tab', { name: 'Features' })).toHaveAttribute('data-active');
    });
  });

  describe('direction (RTL)', () => {
    it('should move to the NEXT tab on ArrowLeft in horizontal RTL', async () => {
      const { getByRole } = await render(`<div dir="rtl">${threeTabs()}</div>`, {
        imports: [...imports, Dir],
      });

      const overview = getByRole('tab', { name: 'Overview' });
      const features = getByRole('tab', { name: 'Features' });

      overview.focus();
      fireEvent.keyDown(overview, { key: 'ArrowLeft' });

      expect(features).toHaveFocus();
    });

    it('should move to the PREVIOUS tab on ArrowRight in horizontal RTL', async () => {
      const { getByRole } = await render(`<div dir="rtl">${threeTabs()}</div>`, {
        imports: [...imports, Dir],
      });

      const overview = getByRole('tab', { name: 'Overview' });
      const features = getByRole('tab', { name: 'Features' });

      // in RTL, ArrowLeft advances to the next tab
      overview.focus();
      fireEvent.keyDown(overview, { key: 'ArrowLeft' });
      expect(features).toHaveFocus();

      // ArrowRight moves back to the previous tab
      fireEvent.keyDown(features, { key: 'ArrowRight' });
      expect(overview).toHaveFocus();
    });

    it('should keep Home=first / End=last (not flipped) in RTL', async () => {
      const { getByRole } = await render(`<div dir="rtl">${threeTabs()}</div>`, {
        imports: [...imports, Dir],
      });

      const overview = getByRole('tab', { name: 'Overview' });
      const docs = getByRole('tab', { name: 'Docs' });

      overview.focus();
      fireEvent.keyDown(overview, { key: 'End' });
      expect(docs).toHaveFocus();

      fireEvent.keyDown(docs, { key: 'Home' });
      expect(overview).toHaveFocus();
    });
  });

  describe('nested tabsets', () => {
    it('should keep outer and inner tabset state independent', async () => {
      const { fixture, getByRole } = await render(
        `<div ngpTabset>
          <div ngpTabList>
            <button ngpTabButton ngpTabButtonValue="outer-1">Outer 1</button>
            <button ngpTabButton ngpTabButtonValue="outer-2">Outer 2</button>
          </div>
          <div ngpTabPanel ngpTabPanelValue="outer-1">
            <div ngpTabset>
              <div ngpTabList>
                <button ngpTabButton ngpTabButtonValue="inner-1">Inner 1</button>
                <button ngpTabButton ngpTabButtonValue="inner-2">Inner 2</button>
              </div>
              <div ngpTabPanel ngpTabPanelValue="inner-1">Inner 1 content</div>
              <div ngpTabPanel ngpTabPanelValue="inner-2">Inner 2 content</div>
            </div>
          </div>
          <div ngpTabPanel ngpTabPanelValue="outer-2">Outer 2 content</div>
        </div>`,
        { imports },
      );

      const outerFirst = getByRole('tab', { name: 'Outer 1' });
      const outerSecond = getByRole('tab', { name: 'Outer 2' });
      const innerFirst = getByRole('tab', { name: 'Inner 1' });
      const innerSecond = getByRole('tab', { name: 'Inner 2' });

      expect(outerFirst).toHaveAttribute('data-active');
      expect(innerFirst).toHaveAttribute('data-active');

      innerSecond.click();
      await fixture.whenStable();
      fixture.detectChanges();

      expect(innerSecond).toHaveAttribute('data-active');
      expect(innerFirst).not.toHaveAttribute('data-active');
      expect(outerFirst).toHaveAttribute('data-active');

      outerSecond.click();
      await fixture.whenStable();
      fixture.detectChanges();

      expect(outerSecond).toHaveAttribute('data-active');
      expect(outerFirst).not.toHaveAttribute('data-active');
    });
  });

  describe('edge cases', () => {
    it('should render an empty tab list gracefully', async () => {
      const { container } = await render(`<div ngpTabset><div ngpTabList></div></div>`, {
        imports,
      });
      expect(container.querySelector('[ngpTabList]')).toBeInTheDocument();
    });

    it('should fall back to the first tab for an unknown initial value', async () => {
      const { getByRole } = await render(threeTabs('ngpTabsetValue="nonexistent"'), { imports });
      expect(getByRole('tab', { name: 'Overview' })).toHaveAttribute('data-active');
    });
  });

  describe('directive API', () => {
    it('should select a tab via the select() method', async () => {
      const valueChange = vi.fn();
      const { fixture, getByRole } = await render(
        threeTabs('(ngpTabsetValueChange)="valueChange($event)"'),
        { imports, componentProperties: { valueChange } },
      );

      const tabset = fixture.debugElement.query(By.directive(NgpTabset)).injector.get(NgpTabset);

      tabset.select('docs');
      await fixture.whenStable();
      fixture.detectChanges();

      expect(getByRole('tab', { name: 'Docs' })).toHaveAttribute('data-active');
      expect(valueChange).toHaveBeenCalledWith('docs');
    });

    it('should update orientation via the setOrientation() method', async () => {
      const { fixture, getByRole } = await render(threeTabs(), { imports });

      const tabset = fixture.debugElement.query(By.directive(NgpTabset)).injector.get(NgpTabset);

      tabset.setOrientation('vertical');
      await fixture.whenStable();
      fixture.detectChanges();

      expect(getByRole('tablist')).toHaveAttribute('data-orientation', 'vertical');
    });
  });
});
