export function findLastIndex<T>(arr: T[], predicate: (value: T, index: number, obj: T[]) => unknown): number {
  if (!arr || !arr.length) {
    return -1;
  }

  const indexFromEnd = arr.slice().reverse().findIndex(predicate);
  return indexFromEnd > -1 ? arr.length - indexFromEnd - 1 : -1;
}
