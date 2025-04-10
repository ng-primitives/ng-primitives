/**
 * Store a map of unique ids for elements so that there are no collisions.
 */
const uniqueIdMap = new Map<string, number>();

/**
 * Generate a unique id for an element
 * @param prefix - The prefix to use for the id
 * @returns The generated id
 */
export function uniqueId(prefix: string): string {
  const id = uniqueIdMap.get(prefix) ?? 0;
  uniqueIdMap.set(prefix, id + 1);
  return `${prefix}-${id}`;
}
