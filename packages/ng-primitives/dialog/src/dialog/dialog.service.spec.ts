import { Component, TemplateRef, ViewContainerRef, inject, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { NgpDialogContext, NgpDialogManager } from './dialog.service';

@Component({
  template: `
    <ng-template #dialog>
      <div>Dialog content</div>
    </ng-template>
  `,
})
class DialogTestComponent {
  readonly dialog = viewChild.required<TemplateRef<NgpDialogContext>>('dialog');
  readonly viewContainerRef = inject(ViewContainerRef);
}

describe('NgpDialogManager', () => {
  let dialogManager: NgpDialogManager;
  let fixture: ReturnType<typeof TestBed.createComponent<DialogTestComponent>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogTestComponent],
      providers: [provideRouter([{ path: '**', component: DialogTestComponent }])],
    }).compileComponents();

    fixture = TestBed.createComponent(DialogTestComponent);
    fixture.detectChanges();
    dialogManager = TestBed.inject(NgpDialogManager);
  });

  afterEach(() => {
    dialogManager.closeAll();
    fixture.destroy();
  });

  it('should close dialog on route navigation', async () => {
    const template = fixture.componentInstance.dialog();
    const vcr = fixture.componentInstance.viewContainerRef;
    dialogManager.open(template, { viewContainerRef: vcr });

    expect(dialogManager.openDialogs.length).toBe(1);

    const router = TestBed.inject(Router);
    await router.navigateByUrl('/other');

    expect(dialogManager.openDialogs.length).toBe(0);
  });

  it('should not close dialog with closeOnNavigation set to false', async () => {
    const template = fixture.componentInstance.dialog();
    const vcr = fixture.componentInstance.viewContainerRef;
    dialogManager.open(template, { viewContainerRef: vcr, closeOnNavigation: false });

    expect(dialogManager.openDialogs.length).toBe(1);

    const router = TestBed.inject(Router);
    await router.navigateByUrl('/other');

    expect(dialogManager.openDialogs.length).toBe(1);
  });

  it('should only close dialogs with closeOnNavigation enabled', async () => {
    const template = fixture.componentInstance.dialog();
    const vcr = fixture.componentInstance.viewContainerRef;
    dialogManager.open(template, { viewContainerRef: vcr, closeOnNavigation: false });
    dialogManager.open(template, { viewContainerRef: vcr });

    expect(dialogManager.openDialogs.length).toBe(2);

    const router = TestBed.inject(Router);
    await router.navigateByUrl('/other');

    expect(dialogManager.openDialogs.length).toBe(1);
    expect(dialogManager.openDialogs[0].config.closeOnNavigation).toBe(false);
  });
});
