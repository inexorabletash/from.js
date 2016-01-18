# from(js).select(awesome)

This gives JavaScript iterators capabilities similar to those in
.NET's [System.Linq](https://msdn.microsoft.com/en-us/library/system.linq(v=vs.111).aspx)
extensions for enumerable types. A few examples:

```js
from(people).join(pets, o=>o.id, p=>p.owner_id, (o,p)=>o.name + ' ♥ ' + p.name);
from(employees).where(e=>e.salary > 50000).select(e.name);
from(points).orderBy(p=>p.x).thenBy(p=>p.y).select(...);
from(employees).select(e.salary).sum();
```

Note that this is _not_ [LINQ](https://msdn.microsoft.com/en-us/library/bb397926.aspx)
("Language-Integrated Query") which adds _syntax_ to languages like C#,
so you can write code like `from r in data where r.b select r.b`. No new syntax here.

### Methods

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
sum
take
takeWhile
thenBy
thenByDescending
union
where
zip

See the [full documentation](DOCUMENTATION.md) for details on each method.

### Basic usage
Call the global `from()` function with an _iterable_ (array, generator, etc) to
get an _enumerable_ which wraps the _iterable_ and exposes several new methods.
Those methods may return a simple value or another _enumerable_ for chained operation. An _enumerable_ is itself an _iterable_ so it can be traversed with `for..of` syntax
or converted to an array using `Array.from()`.

Some methods return an _ordered enumerable_ which has additional methods for
specifying a secondary (etc) ordering.

Methods are lazy where possible, meaning the traversal of the underlying iterator and any evaluation is deferred, for efficiency.

### Advanced usage
Some methods take an optional _comparer_ which is a function for comparing two
arguments; these come in two different flavors. An _equality comparer_ must return `true` if the two arguments are considered equal, and `false` otherwise. An _order comparer_ must return a number; negative if the first argument is greater than the second argument, a positive if the first argument is less than the second argument, or `0` otherwise.
The default _equality comparer_ is equivalent to `Object.is()`. The default
_order comparer_ is equivalent to `(a, b) => (a < b) ? -1 : (b < a) ? 1 : 0`

For complex operations like `groupBy` and `join`, the use of a custom comparer will dramatically slow down the operation. A comparer that does not properly reflect identity (i.e. `a === a`) will result in undefined behavior.


### Requirements
ECMAScript 2015 (ES6) - support for:
* iterators: `for..of` and `Symbol.iterator`
* generators: `function*(){ ... yield ... }`
* arrow functions: `(a, b) => a + b`
* `let`
* `Map`, `Set`
* `Array.from`

It could be transpiled down to ES5, but you'd probably want to write the
application code using ES6isms anyway. (So transpile that too.)

### Related Projects
There are other similar projects:
* https://github.com/aaronpowell/linq-in-javascript
* https://jslinq.codeplex.com/
* https://linqjs.codeplex.com/
