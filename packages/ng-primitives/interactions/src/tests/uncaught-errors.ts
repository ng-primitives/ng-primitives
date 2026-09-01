/**
 * Collect errors the browser reports as uncaught while `run` and the macrotask after it
 * complete. RxJS rethrows a subscriber error asynchronously, so it never reaches the call
 * that triggered it. Swallowing each error as well as recording it keeps it from failing the
 * whole file as an unhandled error.
 */
export async function collectUncaughtErrors(run: () => void): Promise<string> {
  const messages: string[] = [];
  const onError = (event: ErrorEvent): void => {
    messages.push(String(event.error?.message ?? event.message));
    event.preventDefault();
    event.stopImmediatePropagation();
  };

  window.addEventListener('error', onError, true);

  try {
    run();
  } finally {
    await new Promise(resolve => setTimeout(resolve));
    window.removeEventListener('error', onError, true);
  }

  return messages.join('\n');
}
