import { Directive, ElementRef, HostListener, inject, OnInit } from '@angular/core';
import { injectVisuallyHiddenState, NgpVisuallyHidden } from 'ng-primitives/a11y';
import { NgpAvatarStatus } from '../avatar/avatar';
import { injectAvatarState } from '../avatar/avatar-state';

/**
 * Apply the `ngpAvatarImage` directive to an element that represents the avatar image. This would typically be an `img` element or a `div` with a background image.
 */
@Directive({
  selector: 'img[ngpAvatarImage]',
  exportAs: 'ngpAvatarImage',
  hostDirectives: [NgpVisuallyHidden],
})
export class NgpAvatarImage implements OnInit {
  /**
   * Control the visibility of the image.
   */
  protected readonly visuallyHidden = injectVisuallyHiddenState();

  /**
   * Access the avatar
   */
  private readonly avatar = injectAvatarState();

  /**
   * Access the image element ref.
   */
  private readonly elementRef = inject<ElementRef<HTMLImageElement>>(ElementRef);

  ngOnInit(): void {
    // mark the avatar as loading
    this.setState(NgpAvatarStatus.Loading);

    // if there is no src, we can report this as an error
    if (!this.elementRef.nativeElement.src) {
      this.setState(NgpAvatarStatus.Error);
    }

    // if the image has already loaded, we can report this to the avatar
    if (this.elementRef.nativeElement.complete) {
      this.setState(NgpAvatarStatus.Loaded);
    }
  }

  @HostListener('load')
  protected onLoad(): void {
    this.setState(NgpAvatarStatus.Loaded);
  }

  @HostListener('error')
  protected onError(): void {
    this.setState(NgpAvatarStatus.Error);
  }

  private setState(state: NgpAvatarStatus) {
    this.avatar().setStatus(state);

    // if the state is loaded then we should make the image visible
    this.visuallyHidden().setVisibility(state === NgpAvatarStatus.Loaded);
  }
}
