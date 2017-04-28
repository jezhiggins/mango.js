#!/usr/bin/env node
"use strict";

function* filter(iterable, predicate) {
    for (const a of iterable) {
	if (predicate(a))
	    yield a;
    }
} // filter

function* take(iterable, count) {
    for (const a of iterable) {
	if (count == 0)
	    break;
        --count;
	yield a;
    } // for ...
} // take

function* drop(iterable, count) {
    const iter = iterable[Symbol.iterator]();
    for (let i = 0; i != count; ++i)
	iter.next();
    yield* iter;
} // drop

function* concat(...items) {
    for (const item of items) {
	for (const a of MangoRange.from(item)) {
	    // embedded iterable - flatten
	    if (a[Symbol.iterator] && typeof a != "string") 
		yield* concat(...a)
	    else
		yield a;
	} // for ...
    } /// for ...
} // concat

function* map(iterable, fn) {
    for (const a of iterable)
	yield fn(a);
} // map

function first(iterable, fn) {
    const {done, value} = iterable[Symbol.iterator]().next();
    if (done)
	return fn();
    return value;
} // first

class MangoRange {
    static of(...params) {
	if (params.length == 0)
	    return new MangoRange([]);
	if (params.length == 1) {
	    return new MangoRange(params);
	} // if ...
	return MangoRange.from(params);
    } // MangoRange
    static from(iterable) {
	if (iterable == null)
	    return new MangoRange([]);

	if (Array.isArray(iterable)) {
	    if (iterable.length == 1)
		return MangoRange.from(iterable[0]);
	    return new MangoRange(iterable);
	} // if ...
	if (iterable[Symbol.iterator])
	    return new MangoRange(iterable);
	return new MangoRange([iterable]);
    } // from

    ///////////////////////////
    constructor(iterable) {
	this.iterable = iterable;
    } // constructor

    *[Symbol.iterator]() {
        yield* this.iterable;	
    }

    filter(predicate) { return new MangoRange(filter(this.iterable, predicate)); }
    take(count) { return new MangoRange(take(this.iterable, count)); }
    drop(count) { return new MangoRange(drop(this.iterable, count)); }
    concat(...iterable2) { return new MangoRange(concat(this.iterable, iterable2)); }
    map(fn) { return new MangoRange(map(this.iterable, fn)); }
    forEach(fn) { for (const a of this.iterable) fn(a); }
    first() { return first(this.iterable, () => { throw "Sequence is exhausted"; }); }
    firstOrDefault(defaultValue) { return first(this.iterable, () => { return defaultValue; }); }

    toArray() { return Array.from(this.iterable); }
} // class MangoRange

module.exports = MangoRange;
