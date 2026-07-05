/**
 * A minimal SpeechRecognition stand-in shared across the prompt-composer test
 * suites. Kept in a plain (non-`.test.ts`) module so the specs don't depend on
 * one another.
 */
export class MockSpeechRecognition {
  continuous = false;
  interimResults = false;
  lang = '';
  onstart: ((event: unknown) => void) | null = null;
  onend: ((event: unknown) => void) | null = null;
  onresult: ((event: unknown) => void) | null = null;
  onerror: ((event: unknown) => void) | null = null;

  start() {
    this.onstart?.({});
  }

  stop() {
    this.onend?.({});
  }

  mockResult(transcript: string, isFinal: boolean = true) {
    const event = {
      results: [
        {
          0: { transcript },
          isFinal,
          length: 1,
        },
      ],
      resultIndex: 0,
    };
    setTimeout(() => this.onresult?.(event), 0);
  }

  mockError(error: string) {
    const event = { error };
    setTimeout(() => this.onerror?.(event), 0);
  }
}
