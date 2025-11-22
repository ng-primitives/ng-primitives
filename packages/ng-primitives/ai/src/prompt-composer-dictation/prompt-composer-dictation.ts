import { BooleanInput } from '@angular/cdk/coercion';
import {
  booleanAttribute,
  computed,
  Directive,
  HostListener,
  input,
  OnDestroy,
  signal,
} from '@angular/core';
import { ngpButton } from 'ng-primitives/button';
import { injectPromptComposerState } from '../prompt-composer/prompt-composer-state';
import {
  promptComposerDictationState,
  providePromptComposerDictationState,
} from './prompt-composer-dictation-state';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

@Directive({
  selector: 'button[ngpPromptComposerDictation]',
  exportAs: 'ngpPromptComposerDictation',
  providers: [providePromptComposerDictationState()],
  host: {
    type: 'button',
    '[attr.data-dictating]': 'isDictating() ? "" : null',
    '[attr.data-dictation-supported]': 'composer().dictationSupported ? "" : null',
    '[attr.data-prompt]': 'composer().hasPrompt() ? "" : null',
  },
})
export class NgpPromptComposerDictation implements OnDestroy {
  protected readonly composer = injectPromptComposerState();
  private recognition: any = null;
  private basePrompt = signal<string>(''); // Store the prompt before dictation started

  /** Whether the submit button should be disabled. */
  readonly disabled = input<boolean, BooleanInput>(false, {
    transform: booleanAttribute,
  });

  /** Whether dictation is currently active */
  readonly isDictating = computed(() => this.composer().isDictating());

  /** The state of the prompt composer. */
  protected readonly state = promptComposerDictationState<NgpPromptComposerDictation>(this);

  constructor() {
    ngpButton({
      disabled: computed(
        () => this.state.disabled() || this.composer().dictationSupported === false,
      ),
    });
    this.initializeSpeechRecognition();
  }

  ngOnDestroy(): void {
    if (this.recognition) {
      this.recognition.stop();
      this.recognition = null;
    }
  }

  @HostListener('click')
  protected onClick(): void {
    if (!this.recognition) {
      console.warn('Speech recognition is not supported in this browser');
      return;
    }

    if (this.composer().isDictating()) {
      this.stopDictation();
    } else {
      this.startDictation();
    }
  }

  @HostListener('document:keydown', ['$event'])
  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.composer().isDictating()) {
      event.preventDefault();
      this.stopDictation();
    }
  }

  private initializeSpeechRecognition(): void {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true; // Enable continuous listening
    this.recognition.interimResults = true; // Enable interim results for live updates
    this.recognition.lang = 'en-US';

    this.recognition.onstart = () => {
      this.composer().isDictating.set(true);
      // Store the current prompt as the base
      this.basePrompt.set(this.composer().prompt());
    };

    this.recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      // Process all results
      for (let i = 0; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      // Combine base prompt with final transcript and interim transcript
      const baseText = this.basePrompt();
      const separator = baseText ? ' ' : '';
      const newPrompt = baseText + separator + finalTranscript + interimTranscript;

      this.composer().prompt.set(newPrompt.trim());
    };

    this.recognition.onend = () => {
      this.composer().isDictating.set(false);
    };

    this.recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      this.composer().isDictating.set(false);
    };
  }

  private startDictation(): void {
    if (this.recognition && !this.composer().isDictating()) {
      this.recognition.start();
    }
  }

  private stopDictation(): void {
    if (this.recognition && this.composer().isDictating()) {
      this.recognition.stop();
    }
  }
}
