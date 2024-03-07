import { Directive, ElementRef, HostListener, OnInit, inject } from '@angular/core';
import { NgpAvatarState } from '../avatar/avatar.directive';
import { injectAvatar } from '../avatar/avatar.token';

@Directive({
  selector: 'img[ngpAvatarImage]',
  standalone: true,
})
export class NgpAvatarImageDirective implements OnInit {
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
    this.avatar.setState(NgpAvatarState.Loading);

    // if there is no src, we can report this as an error
    if (!this.elementRef.nativeElement.src) {
      this.avatar.setState(NgpAvatarState.Error);
    }

    // if the image has already loaded, we can report this to the avatar
    if (this.elementRef.nativeElement.complete) {
      this.avatar.setState(NgpAvatarState.Loaded);
    }
  }

  @HostListener('load')
  protected onLoad(): void {
    this.avatar.setState(NgpAvatarState.Loaded);
  }

  @HostListener('error')
  protected onError(): void {
    this.avatar.setState(NgpAvatarState.Error);
  }
}
