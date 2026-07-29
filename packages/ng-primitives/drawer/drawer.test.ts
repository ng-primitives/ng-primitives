import { Component, signal, viewChild, viewChildren } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgpDrawer } from './drawer/drawer';
import { createDrawerHandle, NgpDrawerHandle } from './handle/drawer-handle';
import { DrawerState } from './internal/drawer-state';
import { NgpDrawerProvider } from './provider/drawer-provider';

@Component({
  imports: [NgpDrawerProvider, NgpDrawer],
  template: `
    <ng-container ngpDrawerProvider>
      <ng-container
        [defaultSnapPoint]="'120px'"
        [handle]="handle"
        [snapPoints]="['120px', 1]"
        ngpDrawer
      >
        <ng-container ngpDrawer />
      </ng-container>
    </ng-container>
    <dialog open>Unrelated native dialog</dialog>
    <div role="dialog">Unrelated ARIA dialog</div>
  `,
})
class RootHost {
  handle: NgpDrawerHandle<{ id: number }> = createDrawerHandle<{ id: number }>();
  readonly roots = viewChildren(NgpDrawer);
  readonly provider = viewChild.required(NgpDrawerProvider);
}

@Component({
  imports: [NgpDrawer],
  template: `
    @if (showOlder()) {
      <ng-container [handle]="olderHandle()" ngpDrawer />
    }
    @if (showNewer()) {
      <ng-container [handle]="newerHandle()" ngpDrawer />
    }
  `,
})
class HandleRootHost {
  readonly sharedHandle = createDrawerHandle<{ id: number }>();
  readonly alternateHandle = createDrawerHandle<{ id: number }>();
  readonly olderHandle = signal<NgpDrawerHandle<{ id: number }>>(this.sharedHandle);
  readonly newerHandle = signal<NgpDrawerHandle<{ id: number }>>(this.sharedHandle);
  readonly showOlder = signal(true);
  readonly showNewer = signal(true);
  readonly roots = viewChildren(NgpDrawer);
}

describe('NgpDrawer', () => {
  let fixture: ComponentFixture<RootHost>;
  let roots: NgpDrawer[];
  let provider: NgpDrawerProvider;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RootHost, HandleRootHost],
    }).compileComponents();
    fixture = TestBed.createComponent(RootHost);
    fixture.detectChanges();
    roots = [...fixture.componentInstance.roots()];
    provider = fixture.componentInstance.provider();
  });

  it('keeps external model writes authoritative', () => {
    const before: boolean[] = [];
    roots[0].beforeOpenChange.subscribe(event => before.push(event.nextOpen));

    roots[0].open.set(true);
    fixture.detectChanges();

    expect(roots[0].open()).toBe(true);
    expect(before).toEqual([]);
    expect(provider.anyOpen()).toBe(true);
  });

  it('cancels internal open requests before model writes', () => {
    roots[0].beforeOpenChange.subscribe(event => event.cancel());
    roots[0].show({ id: 1 });

    expect(roots[0].open()).toBe(false);
    expect(roots[0].payload()).toBeUndefined();
  });

  it('forwards payload and actions through a handle and detaches on destroy', () => {
    const handle = fixture.componentInstance.handle;

    handle.open({ id: 7 }, 'detached-trigger');
    expect(roots[0].open()).toBe(true);
    expect(roots[0].triggerId()).toBe('detached-trigger');
    expect(handle.payload()).toEqual({ id: 7 });

    fixture.destroy();
    handle.close();
    expect(handle.opened()).toBe(false);
  });

  it('leaves the trigger id untouched when a handle open is canceled', () => {
    const emitted: (string | null)[] = [];
    roots[0].triggerIdChange.subscribe(triggerId => emitted.push(triggerId));
    roots[0].beforeOpenChange.subscribe(event => event.cancel());

    fixture.componentInstance.handle.open({ id: 3 }, 'detached-trigger');

    expect(roots[0].open()).toBe(false);
    expect(roots[0].triggerId()).toBeNull();
    expect(emitted).toEqual([]);
  });

  it('resets snap point on a successful close and allows canceling the reset', () => {
    roots[0].open.set(true);
    roots[0].snapPoint.set(1);
    roots[0].beforeSnapPointChange.subscribe(event => event.cancel());

    roots[0].hide();

    expect(roots[0].open()).toBe(false);
    expect(roots[0].snapPoint()).toBe(1);
  });

  it('discovers a nested root without counting unrelated DOM dialogs', () => {
    const parentState = (roots[0] as unknown as { state: DrawerState }).state;
    roots[1].open.set(true);
    fixture.detectChanges();

    expect(parentState.nestedOpen()).toBe(true);
    expect(parentState.nestedCount()).toBe(1);
  });

  it('keeps a prevented close mounted until public unmount', () => {
    roots[0].show();
    roots[0].beforeOpenChange.subscribe(event => event.preventUnmountOnClose());
    roots[0].hide();

    expect(roots[0].mounted()).toBe(true);
    roots[0].unmount();
    expect(roots[0].open()).toBe(false);
    expect(roots[0].mounted()).toBe(false);
  });

  it('authoritatively closes and unmounts an open root', () => {
    roots[0].show();
    const before: boolean[] = [];
    roots[0].beforeOpenChange.subscribe(event => before.push(event.nextOpen));

    roots[0].unmount();

    expect(roots[0].open()).toBe(false);
    expect(roots[0].mounted()).toBe(false);
    expect(before).toEqual([]);
  });

  it('detaches the previous handle when its public input is replaced', () => {
    const handleFixture = TestBed.createComponent(HandleRootHost);
    handleFixture.componentInstance.showNewer.set(false);
    handleFixture.detectChanges();
    const host = handleFixture.componentInstance;
    const root = host.roots()[0];

    host.sharedHandle.open({ id: 1 });
    expect(root.open()).toBe(true);
    expect(host.sharedHandle.payload()).toEqual({ id: 1 });

    host.olderHandle.set(host.alternateHandle);
    handleFixture.detectChanges();

    expect(host.sharedHandle.opened()).toBe(false);
    expect(host.sharedHandle.payload()).toBeUndefined();
    expect(host.alternateHandle.opened()).toBe(true);
    expect(host.alternateHandle.payload()).toEqual({ id: 1 });

    host.sharedHandle.close();
    expect(root.open()).toBe(true);
    host.alternateHandle.close();
    expect(root.open()).toBe(false);
    handleFixture.destroy();
  });

  it('restores the older mounted Root after the newer Root is destroyed', () => {
    const handleFixture = TestBed.createComponent(HandleRootHost);
    const host = handleFixture.componentInstance;
    host.showNewer.set(false);
    handleFixture.detectChanges();
    const olderRoot = host.roots()[0];
    host.sharedHandle.open({ id: 1 });

    host.showNewer.set(true);
    handleFixture.detectChanges();
    const newerRoot = host.roots()[1];
    host.sharedHandle.open({ id: 2 });

    expect(olderRoot.open()).toBe(true);
    expect(newerRoot.open()).toBe(true);
    expect(host.sharedHandle.payload()).toEqual({ id: 2 });

    host.showNewer.set(false);
    handleFixture.detectChanges();

    expect(host.sharedHandle.opened()).toBe(true);
    expect(host.sharedHandle.payload()).toEqual({ id: 1 });
    host.sharedHandle.close();
    expect(olderRoot.open()).toBe(false);

    host.showOlder.set(false);
    handleFixture.detectChanges();
    expect(host.sharedHandle.opened()).toBe(false);
    expect(host.sharedHandle.payload()).toBeUndefined();
    expect(() => host.sharedHandle.open({ id: 3 })).not.toThrow();
    handleFixture.destroy();
  });

  it('keeps the newer Root active when the older Root is destroyed first', () => {
    const handleFixture = TestBed.createComponent(HandleRootHost);
    handleFixture.detectChanges();
    const host = handleFixture.componentInstance;
    const [olderRoot, newerRoot] = host.roots();

    host.sharedHandle.open({ id: 2 });
    expect(olderRoot.open()).toBe(false);
    expect(newerRoot.open()).toBe(true);

    host.showOlder.set(false);
    handleFixture.detectChanges();

    expect(host.sharedHandle.opened()).toBe(true);
    expect(host.sharedHandle.payload()).toEqual({ id: 2 });
    host.sharedHandle.close();
    expect(newerRoot.open()).toBe(false);

    host.showNewer.set(false);
    handleFixture.detectChanges();
    expect(host.sharedHandle.opened()).toBe(false);
    expect(host.sharedHandle.payload()).toBeUndefined();
    handleFixture.destroy();
  });
});
