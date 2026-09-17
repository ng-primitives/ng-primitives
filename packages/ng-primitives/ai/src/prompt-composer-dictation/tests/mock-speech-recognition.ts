interface MockSpeechRecognitionResult {
  0: { transcript: string };
  isFinal: boolean;
  length: number;
}

/**
 * A minimal SpeechRecognition stand-in shared across the prompt-composer test
 * suites. Kept in a plain (non-`.test.ts`) module so the specs don't depend on
 * one another.
 *
 * Like the real API in continuous mode, `results` accumulates for the whole session: an interim
 * result is refined and finalised in place, and each new phrase takes the next index.
 */
export class MockSpeechRecognition {
  continuous = false;
  interimResults = false;
  lang = '';
  onstart: ((event: unknown) => void) | null = null;
  onend: ((event: unknown) => void) | null = null;
  onresult: ((event: unknown) => void) | null = null;
  onerror: ((event: unknown) => void) | null = null;

  /** Every result heard in the current session. */
  private results: MockSpeechRecognitionResult[] = [];

  start() {
    this.results = [];
    this.onstart?.({});
  }

  stop() {
    this.onend?.({});
  }

  mockResult(transcript: string, isFinal: boolean = true) {
    const pending = this.results[this.results.length - 1];

    if (pending && !pending.isFinal) {
      // the phrase in flight is refined, and finalised, at the index it already occupies
      pending[0].transcript = transcript;
      pending.isFinal = isFinal;
    } else {
      this.results.push({ 0: { transcript }, isFinal, length: 1 });
    }

    const event = { results: this.results, resultIndex: this.results.length - 1 };
    setTimeout(() => this.onresult?.(event), 0);
  }

  mockError(error: string) {
    const event = { error };
    setTimeout(() => this.onerror?.(event), 0);
  }
}
