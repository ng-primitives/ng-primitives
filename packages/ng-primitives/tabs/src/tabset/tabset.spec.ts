import { fireEvent, render } from '@testing-library/angular';
import { NgpTabButton, NgpTabList, NgpTabPanel, NgpTabset } from 'ng-primitives/tabs';

describe('NgpTabset', () => {
  it('should default to horizontal orientation', async () => {
    const { getByRole } = await render(
      `
      <div ngpTabset>
        <div ngpTabList>
          <button ngpTabButton ngpTabButtonValue="overview">Overview</button>
          <button ngpTabButton ngpTabButtonValue="features">Features</button>
        </div>
        <div ngpTabPanel ngpTabPanelValue="overview">Overview content</div>
        <div ngpTabPanel ngpTabPanelValue="features">Features content</div>
      </div>
    `,
      {
        imports: [NgpTabset, NgpTabButton, NgpTabList, NgpTabPanel],
      },
    );

    const tabset = getByRole('tablist');
    expect(tabset).toHaveAttribute('data-orientation', 'horizontal');
  });

  it('should set the orientation to vertical', async () => {
    const { getByRole } = await render(
      `
      <div ngpTabset ngpTabsetOrientation="vertical">
        <div ngpTabList>
          <button ngpTabButton ngpTabButtonValue="overview">Overview</button>
          <button ngpTabButton ngpTabButtonValue="features">Features</button>
        </div>
        <div ngpTabPanel ngpTabPanelValue="overview">Overview content</div>
        <div ngpTabPanel ngpTabPanelValue="features">Features content</div>
      </div>
    `,
      {
        imports: [NgpTabset, NgpTabButton, NgpTabList, NgpTabPanel],
      },
    );

    const tabset = getByRole('tablist');
    expect(tabset).toHaveAttribute('data-orientation', 'vertical');
  });

  it('should select the first tab by default', async () => {
    const { getByRole } = await render(
      `
      <div ngpTabset>
        <div ngpTabList>
          <button ngpTabButton ngpTabButtonValue="overview">Overview</button>
          <button ngpTabButton ngpTabButtonValue="features">Features</button>
        </div>
        <div ngpTabPanel ngpTabPanelValue="overview">Overview content</div>
        <div ngpTabPanel ngpTabPanelValue="features">Features content</div>
      </div>
    `,
      {
        imports: [NgpTabset, NgpTabButton, NgpTabList, NgpTabPanel],
      },
    );

    const tab = getByRole('tab', { name: 'Overview' });
    expect(tab).toHaveAttribute('data-active');
  });

  it('should set the selected tab based on the value input', async () => {
    const { getByRole } = await render(
      `
      <div ngpTabset ngpTabsetValue="features">
        <div ngpTabList>
          <button ngpTabButton ngpTabButtonValue="overview">Overview</button>
          <button ngpTabButton ngpTabButtonValue="features">Features</button>
        </div>
        <div ngpTabPanel ngpTabPanelValue="overview">Overview content</div>
        <div ngpTabPanel ngpTabPanelValue="features">Features content</div>
      </div>
    `,
      {
        imports: [NgpTabset, NgpTabButton, NgpTabList, NgpTabPanel],
      },
    );

    const tab = getByRole('tab', { name: 'Features' });
    expect(tab).toHaveAttribute('data-active');
  });

  it('should emit the valueChange event when the selected tab changes', async () => {
    const valueChange = jest.fn();
    const { getByRole } = await render(
      `
      <div ngpTabset (ngpTabsetValueChange)="valueChange($event)">
        <div ngpTabList>
          <button ngpTabButton ngpTabButtonValue="overview">Overview</button>
          <button ngpTabButton ngpTabButtonValue="features">Features</button>
        </div>
        <div ngpTabPanel ngpTabPanelValue="overview">Overview content</div>
        <div ngpTabPanel ngpTabPanelValue="features">Features content</div>
      </div>
    `,
      {
        imports: [NgpTabset, NgpTabButton, NgpTabList, NgpTabPanel],
        componentProperties: {
          valueChange,
        },
      },
    );

    const tab = getByRole('tab', { name: 'Features' });
    fireEvent.click(tab);

    expect(valueChange).toHaveBeenCalledWith('features');
    expect(valueChange).toHaveBeenCalledTimes(1);
  });

  it('should select the tab button when value is set but there are no tab panels', async () => {
    const { getByRole } = await render(
      `
      <div ngpTabset ngpTabsetValue="features">
        <div ngpTabList>
          <button ngpTabButton ngpTabButtonValue="overview">Overview</button>
          <button ngpTabButton ngpTabButtonValue="features">Features</button>
        </div>
      </div>
    `,
      {
        imports: [NgpTabset, NgpTabButton, NgpTabList],
      },
    );

    const tab = getByRole('tab', { name: 'Features' });
    expect(tab).toHaveAttribute('data-active');
  });

  it('should not emit valueChange if the selected tab is clicked again', async () => {
    const valueChange = jest.fn();
    const { getByRole } = await render(
      `
      <div ngpTabset ngpTabsetValue="overview" (ngpTabsetValueChange)="valueChange($event)">
        <div ngpTabList>
          <button ngpTabButton ngpTabButtonValue="overview">Overview</button>
          <button ngpTabButton ngpTabButtonValue="features">Features</button>
        </div>
        <div ngpTabPanel ngpTabPanelValue="overview">Overview content</div>
        <div ngpTabPanel ngpTabPanelValue="features">Features content</div>
      </div>
    `,
      {
        imports: [NgpTabset, NgpTabButton, NgpTabList, NgpTabPanel],
        componentProperties: {
          valueChange,
        },
      },
    );

    const tab = getByRole('tab', { name: 'Overview' });
    tab.click();

    expect(valueChange).not.toHaveBeenCalled();
  });

  it('should update orientation dynamically', async () => {
    const { getByRole, rerender, detectChanges } = await render(
      `
      <div ngpTabset [ngpTabsetOrientation]="orientation">
        <div ngpTabList>
          <button ngpTabButton ngpTabButtonValue="overview">Overview</button>
          <button ngpTabButton ngpTabButtonValue="features">Features</button>
        </div>
        <div ngpTabPanel ngpTabPanelValue="overview">Overview content</div>
        <div ngpTabPanel ngpTabPanelValue="features">Features content</div>
      </div>
    `,
      {
        imports: [NgpTabset, NgpTabButton, NgpTabList, NgpTabPanel],
        componentProperties: {
          orientation: 'horizontal',
        },
      },
    );

    const tabset = getByRole('tablist');
    expect(tabset).toHaveAttribute('data-orientation', 'horizontal');

    await rerender({
      componentProperties: {
        orientation: 'vertical',
      },
    });
    detectChanges();

    expect(tabset).toHaveAttribute('data-orientation', 'vertical');
  });

  it('should not allow interaction when disabled', async () => {
    const { getByRole } = await render(
      `
      <div ngpTabset>
        <div ngpTabList>
          <button ngpTabButton ngpTabButtonDisabled="true" ngpTabButtonValue="overview">Overview</button>
          <button ngpTabButton ngpTabButtonValue="features">Features</button>
        </div>
        <div ngpTabPanel ngpTabPanelValue="overview">Overview content</div>
        <div ngpTabPanel ngpTabPanelValue="features">Features content</div>
      </div>
    `,
      {
        imports: [NgpTabset, NgpTabButton, NgpTabList, NgpTabPanel],
      },
    );

    const tab = getByRole('tab', { name: 'Overview' });
    expect(tab).toBeDisabled();
    expect(tab).toHaveAttribute('data-disabled');
    expect(tab).not.toHaveAttribute('data-active');

    fireEvent.click(tab);
    expect(tab).toBeDisabled();
    expect(tab).not.toHaveAttribute('data-active');
  });

  it('should keep outer and inner tabsets state independent', async () => {
    const { fixture, getByRole } = await render(
      `
      <div ngpTabset>
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
      </div>
    `,
      {
        imports: [NgpTabset, NgpTabButton, NgpTabList, NgpTabPanel],
      },
    );

    const outerFirst = getByRole('tab', { name: 'Outer 1' });
    const outerSecond = getByRole('tab', { name: 'Outer 2' });
    const innerFirst = getByRole('tab', { name: 'Inner 1' });
    const innerSecond = getByRole('tab', { name: 'Inner 2' });

    expect(outerFirst).toHaveAttribute('data-active');
    expect(outerSecond).not.toHaveAttribute('data-active');
    expect(innerFirst).toHaveAttribute('data-active');
    expect(innerSecond).not.toHaveAttribute('data-active');

    innerSecond.click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(innerSecond).toHaveAttribute('data-active');
    expect(innerFirst).not.toHaveAttribute('data-active');
    expect(outerFirst).toHaveAttribute('data-active');
    expect(outerSecond).not.toHaveAttribute('data-active');

    outerSecond.click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(outerSecond).toHaveAttribute('data-active');
    expect(outerFirst).not.toHaveAttribute('data-active');
    expect(innerSecond).toHaveAttribute('data-active');
    expect(innerFirst).not.toHaveAttribute('data-active');
  });
});
