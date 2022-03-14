var ToSeries = function() {
    if (!(this instanceof ToSeries)) {
        return new ToSeries();
    }

    var _series = function(arrayOfFunctions, done) {
        var _numberOfFuncs = arrayOfFunctions.length,
            _numberRan = 0,
            _func;
        var _callbacker = (_err) => {
            if (_err) {
                _finished = true;
                return done(_err);
            } else if (typeof _eaches[_numberRan] !== 'undefined') {
                _func = arrayOfFunctions[_numberRan];
                if (_eachDelay && _numberRan && _numberRan % _eachDelayNum === 0) {
                    _func.apply(null, [_eaches.splice(_numberRan++, 1, undefined)[0], () => setTimeout(_callbacker, _eachDelayMillis)]);
                    // Give a break so that the GC can clean up
                } else {
                    _func.apply(null, [_eaches.splice(_numberRan++, 1, undefined)[0], _callbacker]);
                }
            } else if (typeof _conditions[_numberRan] === 'function') {
                _func = arrayOfFunctions[_numberRan];
                if (_conditions[_numberRan]()) {
                    _func.apply(null, [_callbacker]);
                } else {
                    _conditions[_numberRan] = undefined;
                    _numberRan++;
                    return _callbacker();
                }
            } else if ((_numberRan >= _numberOfFuncs || _err) && _finished === false) {
                _finished = true;
                return done(_err);
            } else if (!_err && _finished === false) {
                _func = arrayOfFunctions[_numberRan++];
                if (_func) {
                    _func.apply(null, [_callbacker]);
                } else {
                    return done(_err);
                }
            }
        }
        _callbacker();
    }

    var _funcs = [],
        _wrappers = [],
        _runIndex = 0,
        _finishEarly = false,
        _finished = false,
        _conditions = [],
        _eaches = [],
        _types = [],
        _eachDelay = false,
        _eachDelayNum = 20,
        _eachDelayMillis = 500;
    this.options = (opts) => {
        if (opts.eachDelay) _eachDelay = true;
        if (opts.eachDelayNum && typeof opts.eachDelayNum === 'number') _eachDelayNum = opts.eachDelayNum;
        if (opts.eachDelayMillis && typeof opts.eachDelayMillis === 'number') _eachDelayMillis = opts.eachDelayMillis;
        return this;
    };
    this.next = (func) => {
        _conditions.push(undefined);
        _eaches.push(undefined);
        _types.push('callback');
        _funcs.push(func);
        return this;
    };
    this.while = (condition, func) => {
        _conditions.push(condition);
        _eaches.push(undefined);
        _types.push('callback');
        _funcs.push(func);
        return this;
    };
    this.each = (items, func, limit) => {
        if (!limit) limit = 1; // run them as a series
        items.forEach(_item => {
            _conditions.push(undefined);
            _eaches.push(_item);
            _types.push('each');
            _funcs.push(func);
        });
        return this;
    };
    this.first = this.next;
    this.finally = this.next;
    this.clear = () => {
        _funcs = [];
        _wrappers = [];
        _runIndex = 0;
        _finished = false;
    }
    this.finish = () => {
        _finishEarly = true;
    };
    this.end = (done) => {
        var _i = 0;
        _funcs.forEach((f) => {
            if (f.length === 0) {
                // a function with no callback - run it for them and call the callback
                _wrappers.push((cb) => {
                    ++_runIndex;
                    if (_finishEarly) return cb();
                    try {
                        f();
                        //process.exit();
                    } catch (err) {
                        return cb(err);
                    }
                    return cb();
                });
            } else if (f.length === 1 && _types[_i] === 'callback') {
                _wrappers.push((cb) => {
                    ++_runIndex;
                    if (_finishEarly) return cb();
                    f((_err) => {
                        if (_err) return cb(_err);
                        return cb();
                    });
                });
            } else if (_types[_i] === 'each') { //f.length === 2) {
                if (f.length === 1) {
                    _wrappers.push((item, cb) => {
                        ++_runIndex;
                        if (_finishEarly) return cb();
                        try {
                            f(item);
                        } catch (err) {
                            return cb(err);
                        }
                        return cb();
                    });
                } else {
                    _wrappers.push((item, cb) => {
                        ++_runIndex;
                        if (_finishEarly) return cb();
                        if (_runIndex % 1000 === 0) {
                            // https://stackoverflow.com/questions/20936486/node-js-maximum-call-stack-size-exceeded
                            // Reset the call stack by wrapping the function in a setTimeout
                            setTimeout(function() {
                                f(item, (_err) => {
                                    if (_err) return cb(_err);
                                    return cb();
                                });
                            }, 0);
                        } else {
                            f(item, (_err) => {
                                if (_err) return cb(_err);
                                return cb();
                            });
                        }
                    });
                }
            } else {
                // more than one argument - that's bad
                throw new Error('Too many arguments passed to a function in ToSeries.');
            }
            _wrappers[_wrappers.length - 1].__index = _i++;
        });
        _series(_wrappers, (err) => {
            if (err) _finishEarly = true;
            return done(err, {
                count: _runIndex,
                early: _finishEarly
            });
        });
    };
};

module.exports = ToSeries;