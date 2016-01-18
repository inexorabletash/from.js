(function(global) {
  'use strict';

  // TODO: For performance, introduce an ArrayEnumerable subclass
  // produced when the input is an array, which optimizes elementAt,
  // last, count, etc.

  function order(a, b) { return a < b ? -1 : b < a ? 1 : 0; };

  // Return a Set, or slow O(n) partial impl. if a custom comparer is required.
  function set(comparer) {
    if (!comparer || comparer === Object.is)
      return new Set();
    let contents = [];
    return {
      add: function(v) {
        for (let i of contents)
          if (comparer(i, v)) return;
        contents.push(v);
      },
      has: function(v) {
        for (let i of contents)
          if (comparer(i, v)) return true;
        return false;
      }
    };
  }

  // Return a Map, or slow O(n) partial impl. if a custom comparer is required.
  function map(comparer) {
    if (!comparer || comparer === Object.is)
      return new Map();
    let contents = [];
    return {
      set: function(k, v) {
        for (let i of contents) {
          if (comparer(i[0], k)) {
            i[1] = v;
            return;
          }
        }
        contents.push([k, v]);
      },
      get: function(k) {
        for (let i of contents)
          if (comparer(i[0], k)) return i[1];
        return undefined;
      },
      has: function(k) {
        for (let i of contents)
          if (comparer(i[0], k)) return true;
        return false;
      },
      [Symbol.iterator]: function() {
        return contents[Symbol.iterator]();
      }
    };
  }

  // class

  function Enumerable(it) { this.it = it[Symbol.iterator](); }
  Enumerable.prototype = Object.create(Object.prototype, {

    // aggregate(func)
    // aggregate(func, seed)
    // aggregate(func, seed, resultSelector)
    aggregate: {value: function(func, seed, resultSelector) {
      let init, agg;
      if (arguments.length > 1) {
        init = false;
        agg = seed;
      } else {
        init = true;
      }
      for (let i of this.it) {
        if (init) {
          agg = i;
          init = false;
        } else {
          agg = func(agg, i);
        }
      }
      return resultSelector ? resultSelector(agg) : agg;
    }, writable: true, enumerable: false, configurable: true},

    // all(predicate)
    all: {value: function(predicate) {
      for (let i of this.it) {
        if (!predicate(i))
          return false;
      }
      return true;
    }, writable: true, enumerable: false, configurable: true},

    // any()
    // any(predicate)
    any: {value: function(predicate) {
      for (let i of this.it) {
        if (predicate(i))
          return true;
      }
      return false;
    }, writable: true, enumerable: false, configurable: true},

    // average()
    // average(selector)
    average: {value: function(selector) {
      let sum = 0, count = 0;
      for (let i of this.it) {
        sum += selector ? selector(i) : i;
        ++count;
      }
      return sum / count;
    }, writable: true, enumerable: false, configurable: true},

    // concat(iterable)
    concat: {value: function(iterable) {
      function* $(it) {
        for (let i of it)
          yield i;
        for (let i of iterable)
          yield i;
      }
      return new Enumerable($(this.it));
    }, writable: true, enumerable: false, configurable: true},

    // contains(x)
    // contains(x, comparer)
    contains: {value: function(value, comparer) {
      comparer = comparer || Object.is;
      for (let i of this.it) {
        if (comparer(i, value))
          return true;
      }
      return false;
    }, writable: true, enumerable: false, configurable: true},

    // count()
    // count(predicate)
    count: {value: function(predicate) {
      let n = 0;
      for (let i of this.it)
        if (!predicate || predicate(i)) ++n;
      return n;
    }, writable: true, enumerable: false, configurable: true},

    // defaultIfEmpty(value)
    defaultIfEmpty: {value: function(value) {
      function* $(it) {
        let empty = true;
        for (let i of it) {
          empty = false;
          yield i;
        }
        if (empty)
          yield value;
      }
      return new Enumerable($(this.it));
    }, writable: true, enumerable: false, configurable: true},


    // distinct()
    // distinct(comparer)
    distinct: {value: function(comparer) {
      function* $(it) {
        let s = set(comparer);
        for (let i of it) {
          if (!s.has(i)) {
            s.add(i);
            yield i;
          }
        }
      }
      return new Enumerable($(this.it));
    }, writable: true, enumerable: false, configurable: true},

    // elementAt(index)
    elementAt: {value: function(index) {
      let c = 0;
      if (index < 0) throw RangeError('index out of bounds');
      for (let i of this.it) {
        if (index === c++)
          return i;
      }
      throw RangeError('index out of bounds');
    }, writable: true, enumerable: false, configurable: true},

    // elementAtOrDefault(index, value)
    elementAtOrDefault: {value: function(index, value) {
      let c = 0;
      for (let i of this.it) {
        if (index === c++)
          return i;
      }
      return value;
    }, writable: true, enumerable: false, configurable: true},

    // except(iterable)
    // except(iterable, comparer)
    except: {value: function (iterable, comparer) {
      function* $(it) {
        let s = set(comparer);
        for (let i of iterable)
          s.add(i);
        for (let i of it) {
          if (!s.has(i))
            yield i;
        }
      }
      return new Enumerable($(this.it));
    }, writable: true, enumerable: false, configurable: true},

    // first()
    // first(predicate)
    first: {value: function(predicate) {
      for (let i of this.it) {
        if (!predicate || predicate(i))
          return i;
      }
      throw RangeError('sequence is empty');
    }, writable: true, enumerable: false, configurable: true},

    // firstOrDefault()
    // firstOrDefault(predicate)
    firstOrDefault: {value: function(value, predicate) {
      for (let i of this.it) {
        if (!predicate || predicate(i))
          return i;
      }
      return value;
    }, writable: true, enumerable: false, configurable: true},

    // groupBy(keySelector)
    // groupBy(keySelector, comparer)
    // TODO: ...
    groupBy: {value: function(keySelector, comparer) {
      function* $(it) {
        let m = map(comparer);
        for (let i of it) {
          let k = keySelector(i);
          if (!m.has(k)) m.set(k, []);
          m.get(k).push(i);
        }
        for (let i of m)
          yield i;
      }
      return new Enumerable($(this.it));
    }, writable: true, enumerable: false, configurable: true},

    // intersect(iterable)
    // intersect(iterable, comparer)
    intersect: {value: function (iterable, comparer) {
      function* $(it) {
        let m = map(comparer);
        for (let i of it)
          m.set(i, false);
        for (let i of iterable) {
          if (m.has(i))
            m.set(i, true);
        }
        for (let i of m) {
          if (i[1])
            yield i[0];
        }
      }
      return new Enumerable($(this.it));
    }, writable: true, enumerable: false, configurable: true},

    // join(inner, outerKeySelector, innerKeySelector, resultSelector)
    // join(inner, outerKeySelector, innerKeySelector, resultSelector, comparer)
    join: {value: function(inner, outerKeySelector, innerKeySelector, resultSelector, comparer) {
      function* $(it) {
        let m = map(comparer);
        for (let i of inner) {
          let k = innerKeySelector(i);
          if (!m.has(k)) m.set(k, []);
          m.get(k).push(i);
        }
        for (let i of it) {
          let k = outerKeySelector(i);
          if (m.has(k)) {
            for (let e of m.get(k))
              yield resultSelector(i, e);
          }
        }
      }
      return new Enumerable($(this.it));
    }, writable: true, enumerable: false, configurable: true},

    // last()
    // last(predicate)
    last: {value: function(predicate) {
      let found = false, last = undefined;
      for (let i of this.it) {
        if (!predicate || predicate(i)) {
          found = true;
          last = i;
        }
      }
      if (found)
        return last;
      throw RangeError('sequence is empty');
    }, writable: true, enumerable: false, configurable: true},

    // lastOrDefault(value)
    // lastOrDefault(value, predicate)
    lastOrDefault: {value: function(value, predicate) {
      let found = false, last = undefined;
      for (let i of this.it) {
        if (!predicate || predicate(i)) {
          last = i;
          found = true;
        }
      }
      return found ? last : value;
    }, writable: true, enumerable: false, configurable: true},

    // max()
    // max(selector)
    max: {value: function(selector) {
      let first = true, max = undefined, found = undefined;
      for (let i of this.it) {
        let v = selector ? selector(i) : i;
        if (first || max < v) {
          max = v;
          found = i;
        }
        first = false;
      }
      if (first)
        throw RangeError('sequence is empty');
      return found;
    }, writable: true, enumerable: false, configurable: true},

    // min()
    // min(selector)
    min: {value: function(selector) {
      let first = true, min = undefined, found = undefined;
      for (let i of this.it) {
        let v = selector ? selector(i) : i;
        if (first || v < min) {
          min = v;
          found = i;
        }
        first = false;
      }
      if (first)
        throw RangeError('sequence is empty');
      return found;
    }, writable: true, enumerable: false, configurable: true},

    // orderBy(keySelector)
    // orderBy(keySelector, comparer)
    orderBy: {value: function(keySelector, comparer) {
      comparer = comparer || order;
      return new OrderedEnumerable(
        this.it, (a, b) => comparer(keySelector(a), keySelector(b)));
    }, writable: true, enumerable: false, configurable: true},

    // orderByDescending(keySelector)
    // orderByDescending(keySelector, comparer)
    orderByDescending: {value: function(keySelector, comparer) {
      comparer = comparer || order;
      return new OrderedEnumerable(
        this.it, (a, b) => -comparer(keySelector(a), keySelector(b)));
    }, writable: true, enumerable: false, configurable: true},

    // reverse()
    reverse: {value: function() {
      function* $(it) {
        let a = Array.from(it);
        a.reverse();
        for (let i of a)
          yield i;
      }
      return new Enumerable($(this.it));
    }, writable: true, enumerable: false, configurable: true},

    // select(selector)
    select: {value: function(selector) {
      function* $(it) {
        let index = 0;
        for (let i of it)
          yield selector(i, index++);
      }
      return new Enumerable($(this.it));
    }, writable: true, enumerable: false, configurable: true},

    // selectMany(selector)
    // selectMany(selector, resultSelector)
    selectMany: {value: function(selector, resultSelector) {
      function* $(it) {
        let index = 0;
        for (let i of it) {
          for (let j of selector(i, index))
            yield resultSelector ? resultSelector(i, j) : j;
          ++index;
        }
      }
      return new Enumerable($(this.it));
    }, writable: true, enumerable: false, configurable: true},

    // sequenceEqual(iterator)
    // sequenceEqual(iterator, comparer)
    sequenceEqual: {value: function(iterator, comparer) {
      comparer = comparer || Object.is;
      let it1 = this.it, it2 = iterator[Symbol.iterator]();
      let a = it1.next(), b = it2.next();
      if (a.done || b.done)
        return a.done === b.done;
      if (!comparer(a.value, b.value))
        return false;
      return true;
    }, writable: true, enumerable: false, configurable: true},

    // single()
    // single(predicate)
    single: {value: function(predicate) {
      let found, count = 0;
      for (let i of this.it) {
        if (predicate && !predicate(i))
          continue;
        ++count;
        if (count > 1)
          break;
        found = i;
      }
      if (count < 1)
        throw RangeError('less than one item in sequence');
      if (count > 1)
        throw RangeError('more than one item in sequence');
      return found;
    }, writable: true, enumerable: false, configurable: true},


    // singleOrDefault(value)
    // singleOrDefault(value, predicate)
    singleOrDefault: {value: function(value, predicate) {
      let found, count = 0;
      for (let i of this.it) {
        if (predicate && !predicate(i))
          continue;
        ++count;
        if (count > 1)
          break;
        found = i;
      }
      if (count < 1)
        return value;
      if (count > 1)
        throw RangeError('more than one item in sequence');
      return found;
    }, writable: true, enumerable: false, configurable: true},

    // skip(n)
    skip: {value: function(n) {
      function* $(it) {
        let count = 0;
        for (let i of it) {
          if (count++ >= n)
            yield i;
        }
      }
      return new Enumerable($(this.it));
    }, writable: true, enumerable: false, configurable: true},

    // sum()
    // sum(selector)
    sum: {value: function(selector) {
      let sum = 0;
      for (let i of this.it)
        sum += selector ? selector(i) : i;
      return sum;
    }, writable: true, enumerable: false, configurable: true},

    // take(count)
    take: {value: function(count) {
      function* $(it) {
        let n = 0;
        for (let i of it) {
          if (n++ < count)
            yield i;
          else
            return;
        }
      }
      return new Enumerable($(this.it));
    }, writable: true, enumerable: false, configurable: true},

    // takeWhile(predicate)
    takeWhile: {value: function(predicate) {
      function* $(it) {
        let index = 0;
        for (let i of it) {
          if (predicate(i, index++))
            yield i;
          else
            return;
        }
      }
      return new Enumerable($(this.it));
    }, writable: true, enumerable: false, configurable: true},

    // union(iterable)
    // union(iterable, comparer)
    union: {value: function (iterable, comparer) {
      function* $(it) {
        let s = set(comparer);
        for (let i of it) {
          if (!s.has(i)) {
            s.add(i);
            yield i;
          }
        }
        for (let i of iterable) {
          if (!s.has(i)) {
            s.add(i);
            yield i;
          }
        }
      }
      return new Enumerable($(this.it));
    }, writable: true, enumerable: false, configurable: true},

    // where(predicate)
    where: {value: function(predicate) {
      function* $(it) {
        let index = 0;
        for (let i of it) {
          if (predicate(i, index++))
            yield i;
        }
      }
      return new Enumerable($(this.it));
    }, writable: true, enumerable: false, configurable: true},

    // zip(iterable)
    zip: {value: function(iterable) {
      function* $(it1, it2) {
        while (true) {
          let a = it1.next(), b = it2.next();
          if (a.done || b.done)
            return;
          yield [a.value, b.value];
        }
      }
      return new Enumerable($(this.it, iterable[Symbol.iterator]()));
    }, writable: true, enumerable: false, configurable: true},

    [Symbol.iterator]: {value: function() {
      return this.it;
    }, writable: true, enumerable: false, configurable: true}
  });

  // statics

  Enumerable.empty = function() {
    return new Enumerable([]);
  };

  Enumerable.range = function(start, count) {
    start = Number(start);
    count = Number(count);
    function* $() {
      while (count-- > 0) {
        yield start++;
      }
    }
    return new Enumerable($());
  };

  Enumerable.repeat = function(element, count) {
    count = Number(count);
    function* $() {
      while (count-- > 0) {
        yield element;
      }
    }
    return new Enumerable($());
  };

  // subclass

  function OrderedEnumerable(it, func) {
    let funcs = [func];
    this.funcs = funcs;
    function* $() {
      let a = Array.from(it);
      a.sort(function(a, b) {
        for (let func of funcs) {
          let r = func(a, b);
          if (r) return r;
        }
        return 0;
      });
      for (let e of a)
        yield e;
    };
    Enumerable.call(this, $());
  }
  OrderedEnumerable.prototype = Object.create(Enumerable.prototype, {
    // thenBy(keySelector)
    // thenBy(keySelector, comparer)
    thenBy: {value: function(keySelector, comparer) {
      comparer = comparer || order;
      this.funcs.push((a, b) => comparer(keySelector(a), keySelector(b)));
      return this;
    }, writable: true, enumerable: false, configurable: true},

    // thenByDescending(keySelector)
    // thenByDescending(keySelector, comparer)
    thenByDescending: {value: function(keySelector, comparer) {
      comparer = comparer || order;
      this.funcs.push((a, b) => -comparer(keySelector(a), keySelector(b)));
      return this;
    }, writable: true, enumerable: false, configurable: true}
  });

  // exports

  global.from = function from(it) {
    return new Enumerable(it);
  };
  global.Enumerable = Enumerable;
  global.OrderedEnumerable = OrderedEnumerable;

}(self));