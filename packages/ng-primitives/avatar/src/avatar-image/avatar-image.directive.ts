/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the CC BY-ND 4.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Directive, ElementRef, HostListener, OnInit, inject } from '@angular/core';
import { NgpVisuallyHidden, injectVisuallyHidden } from 'ng-primitives/a11y';
import { NgpAvatarState } from '../avatar/avatar.directive';
import { injectAvatar } from '../avatar/avatar.token';

@Directive({
  selector: 'img[ngpAvatarImage]',
  standalone: true,
  hostDirectives: [NgpVisuallyHidden],
})
export class NgpAvatarImage implements OnInit {
  /**
   * Control the visibility of the image.
   */
  protected readonly visuallyHidden = injectVisuallyHidden();

  /**
   * Access the avatar
   */
  private readonly avatar = injectAvatar();

  /**
   * Access the image element ref.
   */
  private readonly elementRef = inject<ElementRef<HTMLImageElement>>(ElementRef);

  ngOnInit(): void {
    // mark the avatar as loading
    this.setState(NgpAvatarState.Loading);

    // if there is no src, we can report this as an error
    if (!this.elementRef.nativeElement.src) {
      this.setState(NgpAvatarState.Error);
    }

    // if the image has already loaded, we can report this to the avatar
    if (this.elementRef.nativeElement.complete) {
      this.setState(NgpAvatarState.Loaded);
    }
  }

  @HostListener('load')
  protected onLoad(): void {
    this.setState(NgpAvatarState.Loaded);
  }

  @HostListener('error')
  protected onError(): void {
    this.setState(NgpAvatarState.Error);
  }

  private setState(state: NgpAvatarState) {
    this.avatar.setState(state);

    // if the state is loaded then we should make the image visible
    this.visuallyHidden.setVisibility(state === NgpAvatarState.Loaded);
  }
}
