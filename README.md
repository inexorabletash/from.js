# from(js).select(awesome)

This gives JavaScript iterators capabilities similar to those in
.NET's [System.Linq](https://msdn.microsoft.com/en-us/library/system.linq(v=vs.111).aspx)
extensions for enumerable types. A few examples:

```js
from(people).join(pets, o=>o.id, p=>p.owner_id, (o,p)=>o.name + ' ♥ ' + p.name);
from(employees).where(e=>e.isFullTime).select(e.name);
from(points).orderBy(p=>p.x).thenBy(p=>p.y).select(...);
from(employees).select(e.salary).sum();
from(people).select(p=>p.name).aggregate((a, b)=>a+', '+b);
```

Note that this is _not_ [LINQ](https://msdn.microsoft.com/en-us/library/bb397926.aspx)
("Language-Integrated Query") which adds _syntax_ to languages like C#,
so you can write code like `from r in data where r.b select r.b`. No new syntax here.

### Methods

All methods:

aggregate
all
any
average
concat
contains
count
defaultIfEmpty
distinct
elementAt
elementAtOrDefault
empty
except
first
firstOrDefault
groupBy
intersect
join
last
lastOrDefault
max
min
orderBy
orderByDescending
range
repeat
reverse
select
selectMany
sequenceEqual
single
singleOrDefault
skip
skipWhile
sum
take
takeWhile
thenBy
thenByDescending
toMap
toSet
union
where
zip

By category:

* **Aggregators:** aggregate average count max min sum
* **Combiners:** concat distinct except intersect join union zip
* **Constructors:** empty range repeat
* **Converters:** toMap toSet
* **Extractors:** elementAt elementAtOrDefault first firstOrDefault last lastOrDefault single singleOrDefault
* **Filters:** skip skipWhile take takeWhile where
* **Qualifiers:** all any contains sequenceEqual
* **Sorters:** orderBy orderByDescending thenBy thenByDescending
* **Transformers:** defaultIfEmpty groupBy reverse select selectMany

See the [full documentation](DOCUMENTATION.md) for details on each method.

### Basic usage
Call the global `from()` function with an _iterable_ (array, set, generator, etc) to
get an _enumerable_ which wraps the _iterable_ and exposes several new methods.
Those methods may return a simple value or another _enumerable_ for chained operation. An _enumerable_ is itself an _iterable_ so it can be traversed with `for..of` syntax
or converted to an array using `Array.from()`.

Some methods return an _ordered enumerable_ which has additional methods for
specifying a secondary (etc) ordering.

Methods are lazy where possible, meaning the traversal of the underlying iterator and any evaluation is deferred, for efficiency.

### Advanced usage
Some methods take an optional _comparer_ which is a function for comparing two
arguments; these come in two different flavors.

* An _equality comparer_ must return `true` if the two arguments are considered equal, and `false` otherwise. The default _equality comparer_ is equivalent to `Object.is()`.
* An _order comparer_ must return a number; negative if the first argument is less than the second argument, a positive if the second argument is less than the first argument, or `0` otherwise. The default _order comparer_ is equivalent to `(a, b) => (a < b) ? -1 : (b < a) ? 1 : 0`

For complex operations like `groupBy` and `join`, the use of a custom comparer will dramatically slow down the operation; i.e. complexity increases from O(1) to O(n). A comparer that does not properly reflect identity (i.e. `a === a`) will result in undefined behavior.

Some methods (first, last, single, elementAt, min, max) throw a **RangeError** if the bounds are exceeded.

### Requirements
ECMAScript 2015 (ES6) - support for:
* classes: `class`, `extends`, `constructor`
* iterators: `for..of` and `Symbol.iterator`
* generators: `function*(){ ... yield ... }`
* arrow functions: `(a, b) => a + b`
* `let`, `const`
* `Map`, `Set`
* `Array.from`
* default arguments

It could be transpiled down to ES5, but you'd probably want to write the
application code using ES6isms anyway. (So transpile that too.)

### Related Projects
There are other similar projects:
* https://github.com/aaronpowell/linq-in-javascript
* https://jslinq.codeplex.com/
* https://linqjs.codeplex.com/
