## Global

### `from(iterable)` &rarr; _Enumerable_
```js
from([1, 2, 3]).select(i => i + 7); // « 8, 9, 10 »

// e.g.
for (x of from([1, 2, 3]).select(i => i + 7)) {
  console.log(x);
}
```

## _Enumerable_ methods
### `aggregate(func[, seed[, resultSelector]])` &rarr; _any_
```js
from([1,2,3,4]).aggregate((a, b) => a + b); // 10
from([1,2,3,4]).aggregate((a, b) => a + b, 100); // 110
from([1,2,3,4]).aggregate((a, b) => a + b, 0, r => '$' + r); // '$10'
```
Like `Array.prototype.reduce()` the optional seed is always the second argument.

### `all(predicate)` &rarr; _Boolean_
```js
from([1,2,3,4]).all(i => i > 0); // true
from([1,2,3,4]).all(i => i < 3); // false
```

### `any([predicate])` &rarr; _Boolean_
```js
from([]).any(); // false
from([1, 2, 3]).any(); // true
from([1, 2, 3]).any(i => i > 4); // false
```

### `average([selector])` &rarr; _Number_
```js
from([1, 2, 3, 4, 5]).average(); // 3
from([1, 2, 3, 4, 5]).average(i=>i*10); // 30
```

### `concat(iterable)` &rarr; _Enumerable_
```js
from([1, 2, 3]).concat([4, 5, 6]); // « 1, 2, 3, 4, 5, 6 »
```

### `contains(element[, comparer])` &rarr; _Boolean_
```js
from([1, 2, 3]).contains(2); // true
from([1, 2, 3]).contains('2'); // false
from([1, 2, 3]).contains('2', (a, b) => a == b); // true
```
If specified, _`comparer`_ must be an _equality comparer_ and return `true` if the two arguments should be considered the same, `false` otherwise.

### `count([predicate])` &rarr; _Number_
```js
from([1, 2, 3]).count(); // 3
from([1, 2, 3]).count(i=>i>2); // 1
```
### `defaultIfEmpty(value)` &rarr; _Enumerable_
```js
from([1, 2]).defaultIfEmpty(0); // « 1, 2 »
from([]).defaultIfEmpty(0); // « 0 »
```

### `distinct([comparer])` &rarr; _Enumerable_
```js
from([1, 2, 3, 1, 2, 3]).distinct(); // « 1, 2, 3 »
from([1, '2', 3, '1', 2, '3']).distinct((a, b) => a == b); // « 1, '2', 3 »
```
If specified, _`comparer`_ must be an _equality comparer_ and return `true` if the two arguments should be considered the same, `false` otherwise.

### `elementAt(index)` &rarr; _any_
```js
from([1, 2, 3]).elementAt(0); // 1
from([1, 2, 3]).elementAt(-1); // throws RangeError
from([1, 2, 3]).elementAt(7); // throws RangeError
```
Throws **RangeError** if index is less than 0 or greater than the length of the sequence.

### `elementAtOrDefault(index, value)` &rarr; _any_
```js
from([1, 2, 3]).elementAtOrDefault(0, NaN); // 1
from([1, 2, 3]).elementAtOrDefault(-1, NaN); // NaN
from([1, 2, 3]).elementAtOrDefault(7, NaN); // NaN
```

### `except(iterable[, comparer])` &rarr; _Enumerable_
```js
from([1, 2, 3]).except([3, 4]); // « 1, 2 »
from([1, 2, 3]).except(['3', '4'], (a, b) => a == b); // « 1, 2 »
```
If specified, _`comparer`_ must be an _equality comparer_ and return `true` if the two arguments should be considered the same, `false` otherwise.

### `first([predicate])` &rarr; _any_
```js
from([1, 2, 3]).first(); // 1
from([1, 2, 3]).first(i => i > 1); // 2
```
Throws **RangeError** if the sequence is empty.

### `firstOrDefault(value[, predicate])` &rarr; _any_
```js
from([1, 2, 3]).firstOrDefault(0); // 1
from([]).firstOrDefault(0); // 0
from([1, 2, 3]).firstOrDefault(NaN); // 1
from([1, 2, 3]).firstOrDefault(NaN, i => i > 7); // NaN
```

### `groupBy(keySelector[, comparer])` &rarr; _Enumerable of [ key, [ values ... ] ]_
```js
from([
  {name: 'daisy', owner: 'alice'},
  {name: 'fido', owner: 'bob'},
  {name: 'speak', owner: 'alice'}
]).groupBy(pet => pet.owner);
//  « ["alice", [{name: "daisy", owner: "alice"}, {name: "speak", owner: "alice"}]],
//    ["bob", [{name: "fido", owner: "bob"}]] »
```
If specified, _`comparer`_ must be an _equality comparer_ and return `true` if the two arguments should be considered the same, `false` otherwise.

### `intersect(iterable[, comparer])` &rarr; _Enumerable_
```js
from([1, 2, 3]).intersect([2, 3, 4]); // « 2, 3 »
from([1, 2, 3]).intersect(['2', '3', '4'], (a, b) => a == b); // « 2, 3 »
```
If specified, _`comparer`_ must be an _equality comparer_ and return `true` if the two arguments should be considered the same, `false` otherwise.

### `join(inner, outerKeySelector, innerKeySelector, resultSelector[, comparer])` &rarr; _Enumerable_
```js
var people = [{id: 1, name: 'alice'}, {id: 2, name: 'bob'}];
var pets = [{name: 'daisy', owner: 1}, {name: 'fido', owner: 2}, {name: 'speak', owner: 1}];
from(people).join(pets, o => o.id, p => p.owner, (o, p) => o.name + ' ♥ ' + p.name);
// « "alice ♥ daisy", "alice ♥ speak", "bob ♥ fido" »
```
If specified, _`comparer`_ must be an _equality comparer_ and return `true` if the two arguments should be considered the same, `false` otherwise.

### `last([predicate])` &rarr; _any_
```js
from([1, 2, 3]).last(); // 3
from([1, 2, 3]).last(i => i < 2); // 1
```
Throws **RangeError** if the sequence is empty.

### `lastOrDefault(value[, predicate])` &rarr; _any_
```js
from([1, 2, 3]).lastOrDefault(NaN); // 3
from([]).lastOrDefault(NaN); // NaN
from([1, 2, 3]).lastOrDefault(NaN, i => i < 2); // 1
from([1, 2, 3]).lastOrDefault(NaN, i => i > 5); // NaN
```

### `max([selector])` &rarr; _any_
```js
from([1, 2, 3]).max(); // 3
from([1, 2, 3]).max(i=>-i); // 1
```
Throws **RangeError** if the sequence is empty.

### `min([selector])` &rarr; _any_
```js
from([1, 2, 3]).min(); // 1
from([1, 2, 3]).min(i=>-i); // 3
```
Throws **RangeError** if the sequence is empty.

### `orderBy(keySelector[, comparer])` &rarr; _OrderedEnumerable_
```js
from([{id: 1, name: 'bob'}, {id: 2, name: 'alice'}]).orderBy(r => r.name);
// « [{id: 2, name: 'alice'}, {id: 1, name: 'bob'}] »

from([{id: 1, name: 'Bob'}, {id: 2, name: 'alice'}])
  .orderBy(r => r.name, (a, b) => a.localeCompare(b));
// « [{id: 2, name: 'alice'}, {id: 1, name: 'Bob'}] »
```
If specified, _`comparer`_ must be an _order comparer_ and return a number; negative if the first argument is greater than the second argument, a positive if the first argument is less than the second argument, or zero otherwise.

### `orderByDescending(keySelector[, comparer])` &rarr; _OrderedEnumerable_
```js
from([{id: 1, name: 'bob'}, {id: 2, name: 'alice'}]).orderByDescending(r => r.name);
// « [{id: 1, name: 'bob'}, {id: 2, name: 'alice'}] »

from([{id: 1, name: 'Bob'}, {id: 2, name: 'alice'}])
  .orderByDescending(r => r.name, (a, b) => a.localeCompare(b));
// « [{id: 1, name: 'Bob'}, {id: 2, name: 'alice'}] »
```
If specified, _`comparer`_ must be an _order comparer_ and return a number; negative if the first argument is greater than the second argument, a positive if the first argument is less than the second argument, or zero otherwise.

### `reverse()` &rarr; _Enumerable_
```js
from([1, 2, 3]).reverse(); // « 3, 2, 1 »
```

### `select(selector)` &rarr; _Enumerable_
```js
from([1, 2, 3]).select(i => i * i); // « 1, 4, 9 »
```
For each item, _`selector`_ is called with the item as the first argument and index as the second argument.

### `selectMany(selector[, resultSelector])` &rarr; _Enumerable_
```js
from([{ns: [1, 2, 3]}, {ns: [4, 5, 6]}]).selectMany(i => i.ns); // « 1, 2, 3, 4, 5, 6 »
from([{name: 'a', ns: [1, 2, 3]}, {name: 'b', ns: [4, 5, 6]}])
  .selectMany(i => i.ns, (a, b) => a.name + '/' + b); // « 'a1', 'a2', 'a3', 'b4', 'b5', 'b6' »
```
For each item, _`selector`_ is called with the sequence item as the first argument and index as the second argument.
If specified, _`resultSelector`_ is called for each selected item with the sequence item as the first argument and the selected item as the second argument.

### `sequenceEqual(iterator[, comparer])` &rarr; _Boolean_
```js
from([1, 2, 3]).sequenceEqual([1, 2, 3]); // true
from([1, 2, 3]).sequenceEqual([1, 2]); // false
from([1, 2, 3]).sequenceEqual(['1', '2', '3'], (a, b) => a == b); // true
```
If specified, _`comparer`_ must be an _equality comparer_ and return `true` if the two arguments should be considered the same, `false` otherwise.

### `single([predicate])` &rarr; _any_
```js
from([1]).single(); // 1
from([]).single(); // throws RangeError
from([1, 2]).single(); // throws RangeError
from([1, 2]).single(i => i > 1); // 2
from([1, 2, 3]).single(i => i > 1); // throws RangeError
```
Throws **RangeError** if the sequence is empty or has more than one element.

### `singleOrDefault(value[, predicate])` &rarr; _any_
```js
from([1]).singleOrDefault(NaN); // 1
from([]).singleOrDefault(NaN); // NaN
from([1, 2]).singleOrDefault(NaN); // throws RangeError
from([1, 2]).singleOrDefault(NaN, i => i > 1); // 2
from([1, 2]).singleOrDefault(NaN, i => i < 1); // NaN
from([1, 2]).singleOrDefault(NaN, i => i > 0); // throws RangeError
```
Throws **RangeError** if the sequence has more than one element.

### `skip(count)` &rarr; _Enumerable_
```js
from([1, 2, 3, 4]).skip(2); // « 3, 4 »
```

### `skipWhile(predicate)` &rarr; _Enumerable_
```js
from([1, 2, 3, 4]).skipWhile(i => i < 2); // « 2, 3, 4 »
```
For each item, _`predicate`_ is called with the item as the first argument and index as the second argument.

### `sum([selector])` &rarr; _Number_
```js
from([1, 2, 3, 4]).sum(); // 10
from([1, 2, 3, 4]).sum(i=>i*10); // 100
```

### `take(count)` &rarr; _Enumerable_
```js
from([1, 2, 3, 4]).take(2); // « 1, 2 »
```

### `takeWhile(predicate)` &rarr; _Enumerable_
```js
from([1, 2, 3, 4]).takeWhile(i => i < 4); // « 1, 2, 3 »
```
For each item, _`predicate`_ is called with the item as the first argument and index as the second argument.

### `union(iterable[, comparer])` &rarr; _Enumerable_
```js
from([1, 2, 3]).union([3, 4, 5]); // « 1, 2, 3, 4, 5 »
from([1, 2, 3]).union(['3', '4', '5'], (a, b) => a == b); // « 1, 2, 3, '4', '5' »
```
If specified, _`comparer`_ must be an _equality comparer_ and return `true` if the two arguments should be considered the same, `false` otherwise.

### `where(predicate)` &rarr; _Enumerable_
```js
from([1, 2, 3]).where(i => i % 2); // « 1, 3 »
```
For each item, _`selector`_ is called with the item as the first argument and index as the second argument.

### `zip(iterable)` &rarr; _Enumerable of [any, any]_
```js
from([1, 2, 3]).zip([4, 5, 6]); // « [1, 4], [2, 5], [3, 6] »
```

## _Enumerable_ statics

### `Enumerable.empty()` &rarr; _Enumerable_
```js
Enumerable.empty(); // « »
Enumerable.empty().count(); // 0
```

### `Enumerable.range(start, count)` &rarr; _Enumerable_
```js
Enumerable.range(2, 3); // « 2, 3, 4 »
```

### `Enumerable.repeat(element, count)` &rarr; _Enumerable_
```js
Enumerable.repeat(2, 3); // « 2, 2, 2 »
```

## _OrderedEnumerable_ methods

### `thenBy(keySelector[, comparer])` &rarr; _OrderedEnumerable_
```js
from([
 {name: 'alice', age: 10, score: 50},
 {name: 'bob', age: 6, score: 33},
 {name: 'carol', age: 10, score: 40},
 {name: 'dan', age: 7, score: 12},
])
  .orderBy(p => p.age)
  .thenBy(p => p.score)
  .select(p => p.name); // « "bob", "dan", "carol", "alice" »
```
If specified, _`comparer`_ must be an _order comparer_ and return a number; negative if the first argument is greater than the second argument, a positive if the first argument is less than the second argument, or zero otherwise.

### `thenByDescending(keySelector[, comparer])` &rarr; _OrderedEnumerable_
```js
from([
 {name: 'alice', age: 10, score: 50},
 {name: 'bob', age: 6, score: 33},
 {name: 'carol', age: 10, score: 40},
 {name: 'dan', age: 7, score: 12},
])
  .orderBy(p => p.age)
  .thenByDescending(p => p.score)
  .select(p => p.name); // « "bob", "dan", "alice", "carol" »
```
If specified, _`comparer`_ must be an _order comparer_ and return a number; negative if the first argument is greater than the second argument, a positive if the first argument is less than the second argument, or zero otherwise.
