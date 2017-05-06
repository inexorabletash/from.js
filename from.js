(function(global) {
  'use strict';

  function order(a, b) { return a < b ? -1 : b < a ? 1 : 0; };

  // Return a Set, or slow O(n) partial impl. if a custom comparer is required.
  function set(comparer) {
    return (comparer === Object.is) ? new Set() : new SlowSet(comparer);
  }
  class SlowSet {
    constructor(comparer) {
      this.comparer = comparer;
      this.contents = [];
    }
    add(v) {
      for (let i of this.contents)
          if ( this.comparer(i, v)) return;
         this.contents.push(v);
    }
    has(v) {
      for (let i of this.contents)
        if (this.comparer(i, v)) return true;
      return false;
    }
  }

  // Return a Map, or slow O(n) partial impl. if a custom comparer is required.
  function map(comparer) {
    return (comparer === Object.is) ? new Map() : new SlowMap(comparer);
  }
  class SlowMap {
    constructor(comparer) {
      this.comparer = comparer;
      this.contents = [];
    }
    set(k, v) {
      for (let i of this.contents) {
        if (this.comparer(i[0], k)) {
          i[1] = v;
          return;
        }
      }
      this.contents.push([k, v]);
    }
    get(k) {
      for (let i of this.contents)
        if (this.comparer(i[0], k)) return i[1];
      return undefined;
    }
    has(k) {
      for (let i of this.contents)
        if (this.comparer(i[0], k)) return true;
      return false;
    }
    [Symbol.iterator]() {
      return this.contents[Symbol.iterator]();
    }
  }

  // class

  class Enumerable {
    constructor(it) {
      this.it = it[Symbol.iterator]();
    }

    // aggregate(func)
    // aggregate(func, seed)
    // aggregate(func, seed, resultSelector)
    aggregate(func, seed = undefined, resultSelector = undefined) {
      if (typeof func !== 'function')
        throw TypeError('func must be a function');
      if (resultSelector && typeof resultSelector !== 'function')
        throw TypeError('resultSelector must be a function');
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
    }

    // all(predicate)
    all(predicate) {
      if (typeof predicate !== 'function')
        throw TypeError('predicate must be a function');
      for (let i of this.it) {
        if (!predicate(i))
          return false;
      }
      return true;
    }

    // any(predicate)
    any(predicate) {
      if (typeof predicate !== 'function')
        throw TypeError('predicate must be a function');
      for (let i of this.it) {
        if (predicate(i))
          return true;
      }
      return false;
    }

    // average()
    // average(selector)
    average(selector = undefined) {
      if (selector && typeof selector !== 'function')
        throw TypeError('selector must be a function');
      let sum = 0, count = 0;
      for (let i of this.it) {
        sum += selector ? selector(i) : i;
        ++count;
      }
      return sum / count;
    }

    // concat(iterable)
    concat(iterable) {
      return new Enumerable((function*(it) {
        for (let i of it)
          yield i;
        for (let i of iterable)
          yield i;
      })(this.it));
    }

    // contains(x)
    // contains(x, comparer)
    contains(value, comparer = Object.is) {
      if (typeof comparer !== 'function')
        throw TypeError('comparer must be a function');
      for (let i of this.it) {
        if (comparer(i, value))
          return true;
      }
      return false;
    }

    // count()
    // count(predicate)
    count(predicate = undefined) {
      if (predicate && typeof predicate !== 'function')
        throw TypeError('predicate must be a function');
      let n = 0;
      for (let i of this.it)
        if (!predicate || predicate(i)) ++n;
      return n;
    }

    // defaultIfEmpty(value)
    defaultIfEmpty(value) {
      return new Enumerable((function*(it) {
        let empty = true;
        for (let i of it) {
          empty = false;
          yield i;
        }
        if (empty)
          yield value;
      })(this.it));
    }


    // distinct()
    // distinct(comparer)
    distinct(comparer = Object.is) {
      if (typeof comparer !== 'function')
        throw TypeError('comparer must be a function');
      return new Enumerable((function*(it) {
        const s = set(comparer);
        for (let i of it) {
          if (!s.has(i)) {
            s.add(i);
            yield i;
          }
        }
      })(this.it));
    }

    // elementAt(index)
    elementAt(index) {
      let c = 0;
      if (index < 0) throw RangeError('index out of bounds');
      for (let i of this.it) {
        if (index === c++)
          return i;
      }
      throw RangeError('index out of bounds');
    }

    // elementAtOrDefault(index, value)
    elementAtOrDefault(index, value) {
      let c = 0;
      for (let i of this.it) {
        if (index === c++)
          return i;
      }
      return value;
    }

    // except(iterable)
    // except(iterable, comparer)
    except(iterable, comparer = Object.is) {
      if (typeof comparer !== 'function')
        throw TypeError('comparer must be a function');
      return new Enumerable((function*(it) {
        const s = set(comparer);
        for (let i of iterable)
          s.add(i);
        for (let i of it) {
          if (!s.has(i))
            yield i;
        }
      })(this.it));
    }

    // first()
    // first(predicate)
    first(predicate = undefined) {
      if (predicate && typeof predicate !== 'function')
        throw TypeError('predicate must be a function');
      for (let i of this.it) {
        if (!predicate || predicate(i))
          return i;
      }
      throw RangeError('sequence is empty');
    }

    // firstOrDefault(value)
    // firstOrDefault(value, predicate)
    firstOrDefault(value, predicate = undefined) {
      if (predicate && typeof predicate !== 'function')
        throw TypeError('predicate must be a function');
      for (let i of this.it) {
        if (!predicate || predicate(i))
          return i;
      }
      return value;
    }

    // groupBy(keySelector)
    // groupBy(keySelector, comparer)
    groupBy(keySelector, comparer = Object.is) {
      if (typeof keySelector !== 'function')
        throw TypeError('keySelector must be a function');
      if (typeof comparer !== 'function')
        throw TypeError('comparer must be a function');
      return new Enumerable((function*(it) {
        const m = map(comparer);
        for (let i of it) {
          const k = keySelector(i);
          if (!m.has(k)) m.set(k, []);
          m.get(k).push(i);
        }
        for (let i of m)
          yield i;
      })(this.it));
    }

    // intersect(iterable)
    // intersect(iterable, comparer)
    intersect(iterable, comparer = Object.is) {
      if (typeof comparer !== 'function')
        throw TypeError('comparer must be a function');
      return new Enumerable((function*(it) {
        const m = map(comparer);
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
      })(this.it));
    }

    // join(inner, outerKeySelector, innerKeySelector, resultSelector)
    // join(inner, outerKeySelector, innerKeySelector, resultSelector, comparer)
    join(inner, outerKeySelector, innerKeySelector, resultSelector, comparer = Object.is) {
      if (typeof outerKeySelector !== 'function')
        throw TypeError('outerKeySelector must be a function');
      if (typeof innerKeySelector !== 'function')
        throw TypeError('innerKeySelector must be a function');
      if (typeof resultSelector !== 'function')
        throw TypeError('resultSelector must be a function');
      if (typeof comparer !== 'function')
        throw TypeError('comparer must be a function');
      return new Enumerable((function*(it) {
        const m = map(comparer);
        for (let i of inner) {
          const k = innerKeySelector(i);
          if (!m.has(k)) m.set(k, []);
          m.get(k).push(i);
        }
        for (let i of it) {
          const k = outerKeySelector(i);
          if (m.has(k)) {
            for (let e of m.get(k))
              yield resultSelector(i, e);
          }
        }
      })(this.it));
    }

    // last()
    // last(predicate)
    last(predicate = undefined) {
      if (predicate && typeof predicate !== 'function')
        throw TypeError('predicate must be a function');
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
    }

    // lastOrDefault(value)
    // lastOrDefault(value, predicate)
    lastOrDefault(value, predicate = undefined) {
      if (predicate && typeof predicate !== 'function')
        throw TypeError('predicate must be a function');
      let found = false, last = undefined;
      for (let i of this.it) {
        if (!predicate || predicate(i)) {
          last = i;
          found = true;
        }
      }
      return found ? last : value;
    }

    // max()
    // max(selector)
    max(selector = undefined) {
      if (selector && typeof selector !== 'function')
        throw TypeError('selector must be a function');
      let first = true, max = undefined, found = undefined;
      for (let i of this.it) {
        const v = selector ? selector(i) : i;
        if (first || max < v) {
          max = v;
          found = i;
        }
        first = false;
      }
      if (first)
        throw RangeError('sequence is empty');
      return found;
    }

    // min()
    // min(selector)
    min(selector = undefined) {
      if (selector && typeof selector !== 'function')
        throw TypeError('selector must be a function');
      let first = true, min = undefined, found = undefined;
      for (let i of this.it) {
        const v = selector ? selector(i) : i;
        if (first || v < min) {
          min = v;
          found = i;
        }
        first = false;
      }
      if (first)
        throw RangeError('sequence is empty');
      return found;
    }

    // orderBy(keySelector)
    // orderBy(keySelector, comparer)
    orderBy(keySelector, comparer = order) {
      if (typeof keySelector !== 'function')
        throw TypeError('keySelector must be a function');
      if (typeof comparer !== 'function')
        throw TypeError('comparer must be a function');
      return new OrderedEnumerable(
        this.it, (a, b) => comparer(keySelector(a), keySelector(b)));
    }

    // orderByDescending(keySelector)
    // orderByDescending(keySelector, comparer)
    orderByDescending(keySelector, comparer = order) {
      if (typeof keySelector !== 'function')
        throw TypeError('keySelector must be a function');
      if ( typeof comparer !== 'function')
        throw TypeError('comparer must be a function');
      return new OrderedEnumerable(
        this.it, (a, b) => -comparer(keySelector(a), keySelector(b)));
    }

    // reverse()
    reverse() {
      return new Enumerable((function*(it) {
        const a = Array.from(it);
        a.reverse();
        for (let i of a)
          yield i;
      })(this.it));
    }

    // select(selector)
    select(selector) {
      if (typeof selector !== 'function')
        throw TypeError('selector must be a function');
      return new Enumerable((function*(it) {
        let index = 0;
        for (let i of it)
          yield selector(i, index++);
      })(this.it));
    }

    // selectMany(selector)
    // selectMany(selector, resultSelector)
    selectMany(selector, resultSelector = undefined) {
      if (typeof selector !== 'function')
        throw TypeError('selector must be a function');
      if (resultSelector && typeof resultSelector !== 'function')
        throw TypeError('resultSelector must be a function');
      return new Enumerable((function*(it) {
        let index = 0;
        for (let i of it) {
          for (let j of selector(i, index))
            yield resultSelector ? resultSelector(i, j) : j;
          ++index;
        }
      })(this.it));
    }

    // sequenceEqual(iterator)
    // sequenceEqual(iterator, comparer)
    sequenceEqual(iterator, comparer = Object.is) {
      if (typeof comparer !== 'function')
        throw TypeError('comparer must be a function');
      const it1 = this.it, it2 = iterator[Symbol.iterator]();
      while (true) {
        const a = it1.next(), b = it2.next();
        if (a.done || b.done)
          return a.done === b.done;
        if (!comparer(a.value, b.value))
          return false;
      }
      return true;
    }

    // single()
    // single(predicate)
    single(predicate = undefined) {
      if (predicate && typeof predicate !== 'function')
        throw TypeError('predicate must be a function');
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
    }


    // singleOrDefault(value)
    // singleOrDefault(value, predicate)
    singleOrDefault(value, predicate = undefined) {
      if (predicate && typeof predicate !== 'function')
        throw TypeError('predicate must be a function');
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
    }

    // skip(n)
    skip(n) {
      return new Enumerable((function*(it) {
        let count = 0;
        for (let i of it) {
          if (count++ >= n)
            yield i;
        }
      })(this.it));
    }

    // skipWhile(predicate)
    skipWhile(predicate) {
      if (typeof predicate !== 'function')
        throw TypeError('predicate must be a function');
      return new Enumerable((function*(it) {
        let index = 0;
        for (let i of it) {
          if (!predicate(i, index++)) {
            yield i;
            break;
          }
        }
        for (let i of it) {
          yield i;
        }
      })(this.it));
    }

    // sum()
    // sum(selector)
    sum(selector = undefined) {
      if (selector && typeof selector !== 'function')
        throw TypeError('selector must be a function');
      let sum = 0;
      for (let i of this.it)
        sum += selector ? selector(i) : i;
      return sum;
    }

    // take(count)
    take(count) {
      return new Enumerable((function*(it) {
        let n = 0;
        for (let i of it) {
          if (n++ < count)
            yield i;
          else
            return;
        }
      })(this.it));
    }

    // takeWhile(predicate)
    takeWhile(predicate) {
      if (typeof predicate !== 'function')
        throw TypeError('predicate must be a function');
      return new Enumerable((function*(it) {
        let index = 0;
        for (let i of it) {
          if (predicate(i, index++))
            yield i;
          else
            return;
        }
      })(this.it));
    }

    // union(iterable)
    // union(iterable, comparer)
    union(iterable, comparer = Object.is) {
      if (typeof comparer !== 'function')
        throw TypeError('comparer must be a function');
      return new Enumerable((function*(it) {
        const s = set(comparer);
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
      })(this.it));
    }

    // where(predicate)
    where(predicate) {
      if (typeof predicate !== 'function')
        throw TypeError('predicate must be a function');
      return new Enumerable((function*(it) {
        let index = 0;
        for (let i of it) {
          if (predicate(i, index++))
            yield i;
        }
      })(this.it));
    }

    // zip(iterable)
    zip(iterable) {
      return new Enumerable((function*(it1, it2) {
        while (true) {
          const a = it1.next(), b = it2.next();
          if (a.done || b.done)
            return;
          yield [a.value, b.value];
        }
      })(this.it, iterable[Symbol.iterator]()));
    }

    [Symbol.iterator]() {
      return this.it;
    }

    // toMap(keySelector, valueSelector)
    toMap(keySelector, valueSelector) {
      if (typeof keySelector !== 'function')
        throw TypeError('keySelector must be a function');
      if (typeof valueSelector !== 'function')
        throw TypeError('valueSelector must be a function');
      const m = new Map();
      for (let i of this.it)
        m.set(keySelector(i), valueSelector(i));
      return m;
    }

    // toSet(selector)
    toSet(selector = undefined) {
      if (selector && typeof selector !== 'function')
        throw TypeError('selector must be a function');
      const s = new Set();
      for (let i of this.it)
        s.add(selector ? selector(i) : i);
      return s;
    }
  }

  // statics

  Enumerable.empty = () => {
    return new Enumerable([]);
  };

  Enumerable.range = (start, count) => {
    start = Number(start);
    count = Number(count);
    return new Enumerable((function*() {
      while (count-- > 0) {
        yield start++;
      }
    })());
  };

  Enumerable.repeat = (element, count) => {
    count = Number(count);
    return new Enumerable((function*() {
      while (count-- > 0) {
        yield element;
      }
    })());
  };

  class ArrayEnumerable extends Enumerable {
    constructor(array) {
      super(array[Symbol.iterator]());
      this.array = array;
    }

    // count()
    // count(predicate)
    count(predicate = undefined) {
      if (predicate && typeof predicate !== 'function')
        throw TypeError('predicate must be a function');
      if (!predicate)
        return this.array.length;
      let n = 0;
      for (let i = 0; i < this.array.length; ++i)
        if (predicate(this.array[i])) ++n;
      return n;
    }

    // elementAt(index)
    elementAt(index) {
      if (index < 0 || index >= this.array.length)
        throw RangeError('index out of bounds');
      return this.array[index];
    }

    // elementAtOrDefault(index, value)
    elementAtOrDefault(index, value) {
      if (index < 0 || index >= this.array.length)
        return value;
      return this.array[index];
    }

    // last()
    // last(predicate)
    last(predicate = undefined) {
      if (predicate && typeof predicate !== 'function')
        throw TypeError('predicate must be a function');
      for (let i = this.array.length - 1; i >= 0; --i) {
        const v = this.array[i];
        if (!predicate || predicate(v))
          return v;
      }
      throw RangeError('sequence is empty');
    }

    // lastOrDefault(value)
    // lastOrDefault(value, predicate)
    lastOrDefault(value, predicate = undefined) {
      if (predicate && typeof predicate !== 'function')
        throw TypeError('predicate must be a function');
      for (let i = this.array.length - 1; i >= 0; --i) {
        const v = this.array[i];
        if (!predicate || predicate(v))
          return v;
      }
      return value;
    }

    // skip(n)
    skip(n) {
      return new Enumerable((function*(a) {
        for (let i = n; i < a.length; ++i)
          yield a[i];
      })(this.array));
    }
  }

  class OrderedEnumerable extends Enumerable {
    constructor(it, func) {
      const funcs = [func];
      super((function*() {
        const a = Array.from(it);
        a.sort((a, b) => {
          for (let func of funcs) {
            const r = func(a, b);
            if (r) return r;
          }
          return 0;
        });
        for (let e of a)
          yield e;
      })());
      this.funcs = funcs;
    }

    // thenBy(keySelector)
    // thenBy(keySelector, comparer)
    thenBy(keySelector, comparer = order) {
      if (typeof keySelector !== 'function')
        throw TypeError('keySelector must be a function');
      if (typeof comparer !== 'function')
        throw TypeError('comparer must be a function');
      this.funcs.push((a, b) => comparer(keySelector(a), keySelector(b)));
      return this;
    }

    // thenByDescending(keySelector)
    // thenByDescending(keySelector, comparer)
    thenByDescending(keySelector, comparer = order) {
      if (typeof keySelector !== 'function')
        throw TypeError('keySelector must be a function');
      if (typeof comparer !== 'function')
        throw TypeError('comparer must be a function');
      this.funcs.push((a, b) => -comparer(keySelector(a), keySelector(b)));
      return this;
    }
  }

  // exports

  global.from = function from(it) {
    if (Array.isArray(it))
      return new ArrayEnumerable(it);
    return new Enumerable(it);
  };
  global.Enumerable = Enumerable;
  global.OrderedEnumerable = OrderedEnumerable;

}(self));
