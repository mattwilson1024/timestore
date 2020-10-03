/**
 * Finds the index of the _last_ item that matches the given predicate
 * Similar to Array.prototype.findIndex but searches from the end of the array backwards.
 * @param arr
 * @param predicate
 */
export function findLastIndex<T>(arr: T[], predicate: (value: T, index: number, obj: T[]) => unknown): number {
  if (!arr || !arr.length) {
    return -1;
  }

  const indexFromEnd = arr.slice().reverse().findIndex(predicate);
  return indexFromEnd > -1 ? arr.length - indexFromEnd - 1 : -1;
}
