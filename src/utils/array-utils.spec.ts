import { findLastIndex } from './array-utils';

describe('findLastIndex array helper', () => {
  it('should find the last item that matches the predicate', () => {
    const fruits = ['apple', 'peach', 'orange', 'pear', 'apricot', 'lemon'];
    const lastIndex = findLastIndex(fruits, f => f.startsWith('a'));
    expect(lastIndex).toEqual(4);
  });

  it('should find the item that matches the predicate when there is only one matching item', () => {
    const fruits = ['apple', 'kiwi'];
    const lastIndex = findLastIndex(fruits, f => f.startsWith('a'));
    expect(lastIndex).toEqual(0);
  });

  it('should return -1 if non of the array items match the predicate', () => {
    const fruits = ['apple', 'peach', 'orange', 'pear', 'apricot', 'lemon'];
    const lastIndex = findLastIndex(fruits, f => f.startsWith('x'));
    expect(lastIndex).toEqual(-1);
  });

  it('should return -1 if an empty array is provided, regardless of the predicate', () => {
    const fruits = [];
    const lastIndex = findLastIndex(fruits, f => f.startsWith('a'));
    expect(lastIndex).toEqual(-1);
  });

  it('should return -1 if the array is null or empty', () => {
    expect(findLastIndex(null, f => true)).toEqual(-1);
    expect(findLastIndex(undefined, f => true)).toEqual(-1);
  });
});