var ToSeries = function() {
    if (!(this instanceof ToSeries)) {
        return new ToSeries();
    }

    var ____series = function(arrayOfFunctions, done) {
        var ____numberOfFuncs = arrayOfFunctions.length,
            ____numberRan = 0,
            ____func;
        var ____callbacker = (____err) => {
            if (____err) {
                ____finished = true;
                return done(____err);
            } else if (typeof ____eaches[____numberRan] !== 'undefined') {
                ____func = arrayOfFunctions[____numberRan];
                ____func.apply(null, [____eaches[____numberRan++], ____callbacker]);
            } else if (typeof ____conditions[____numberRan] === 'function') {
                ____func = arrayOfFunctions[____numberRan];
                if (____conditions[____numberRan]()) {
                    ____func.apply(null, [____callbacker]);
                } else {
                    ____conditions[____numberRan] = undefined;
                    ____numberRan++;
                    return ____callbacker();
                }
            } else if ((____numberRan >= ____numberOfFuncs || ____err) && ____finished === false) {
                ____finished = true;
                return done(____err);
            } else if (!____err && ____finished === false) {
                ____func = arrayOfFunctions[____numberRan++];
                if (____func) {
                    ____func.apply(null, [____callbacker]);
                } else {
                    return done(____err);
                }
            }
        }
        ____callbacker();
    }

    var ____funcs = [],
        ____wrappers = [],
        ____runIndex = 0,
        ____finishEarly = false,
        ____finished = false,
        ____conditions = [],
        ____eaches = [],
        ____types = [];
    this.next = (func) => {
        ____conditions.push(undefined);
        ____eaches.push(undefined);
        ____types.push('callback');
        ____funcs.push(func);
        return this;
    };
    this.while = (condition, func) => {
        ____conditions.push(condition);
        ____eaches.push(undefined);
        ____types.push('callback');
        ____funcs.push(func);
        return this;
    };
    this.each = (items, func, limit) => {
        if (!limit) limit = 1; // run them as a series
        items.forEach(____item => {
            ____conditions.push(undefined);
            ____eaches.push(____item);
            ____types.push('each');
            ____funcs.push(func);
        });
        return this;
    };
    this.first = this.next;
    this.finally = this.next;
    this.clear = () => {
        ____funcs = [];
        ____wrappers = [];
        ____runIndex = 0;
        ____finished = false;
    }
    this.finish = () => {
        ____finishEarly = true;
    };
    this.end = (done) => {
        var ____i = 0;
        ____funcs.forEach((f) => {
            if (f.length === 0) {
                // a function with no callback - run it for them and call the callback
                ____wrappers.push((cb) => {
                    ++____runIndex;
                    if (____finishEarly) return cb();
                    try {
                        f();
                        //process.exit();
                    } catch (err) {
                        return cb(err);
                    }
                    return cb();
                });
            } else if (f.length === 1 && ____types[____i] === 'callback') {
                ____wrappers.push((cb) => {
                    ++____runIndex;
                    if (____finishEarly) return cb();
                    f((____err) => {
                        if (____err) return cb(____err);
                        return cb();
                    });
                });
            } else if (____types[____i] === 'each') { //f.length === 2) {
                if (f.length === 1) {
                    ____wrappers.push((item, cb) => {
                        ++____runIndex;
                        if (____finishEarly) return cb();
                        try {
                            f(item);
                        } catch (err) {
                            return cb(err);
                        }
                        return cb();
                    });
                } else {
                    ____wrappers.push((item, cb) => {
                        ++____runIndex;
                        if (____finishEarly) return cb();
                            /*f(item, (____err) => {
                                if (____err) return cb(____err);
                                return cb();
                            });*/
                            
                        if (____runIndex % 1000 === 0) {
                            // https://stackoverflow.com/questions/20936486/node-js-maximum-call-stack-size-exceeded
                            // Reset the call stack by wrapping the function in a setTimeout
                            setTimeout(function() {
                                f(item, (____err) => {
                                    if (____err) return cb(____err);
                                    return cb();
                                });
                            }, 0);
                        } else {
                            f(item, (____err) => {
                                if (____err) return cb(____err);
                                return cb();
                            });
                        }
                    });
                }
            } else {
                // more than one argument - that's bad
                throw new Error('Too many arguments passed to a function in ToSeries.');
            }
            ____wrappers[____wrappers.length - 1]._____index = ____i++;
        });
        ____series(____wrappers, (err) => {
            if (err) ____finishEarly = true;
            return done(err, {
                count: ____runIndex,
                early: ____finishEarly
            });
        });
    };
};

module.exports = ToSeries;