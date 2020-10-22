var series = require('../lib/to-series.js');

var expect = require('chai').expect;

describe('Each', function() {
    this.timeout(5000);
    it('Executes each with a callback.', function(testComplete) {
        var orders = [];
        series()
            .each(['a', 'b', 'c'], (item, cb) => {
                orders.push(item);
                return cb();
            })
            .end((err, info) => { // where everything is actually executed
                expect(orders.length).to.equal(3);
                return testComplete();
            });
    });
    it('Executes each without a callback.', function(testComplete) {
        var orders = [];
        series()
            .each(['a', 'b', 'c'], (item) => {
                orders.push(item);
            })
            .end((err, info) => { // where everything is actually executed
                expect(orders.length).to.equal(3);
                return testComplete();
            });
    });
    it('Executes each without a callback, with a starting function.', function(testComplete) {
        var orders = [];
        series()
            .first(cb => {
                orders.push('z');
                return cb();
            })
            .each(['a', 'b', 'c'], (item) => {
                orders.push(item);
            })
            .end((err, info) => { // where everything is actually executed
                expect(orders.length).to.equal(4);
                expect(orders[0]).to.equal('z');
                expect(orders[3]).to.equal('c');
                return testComplete();
            });
    });
    it('Executes each with a callback, with a starting function.', function(testComplete) {
        var orders = [];
        series()
            .first(cb => {
                orders.push('z');
                return cb();
            })
            .each(['a', 'b', 'c'], (item, cb) => {
                orders.push(item);
                return cb();
            })
            .end((err, info) => { // where everything is actually executed
                expect(orders.length).to.equal(4);
                expect(orders[0]).to.equal('z');
                expect(orders[3]).to.equal('c');
                return testComplete();
            });
    });
    it('Executes each with a callback, with a starting+ending function.', function(testComplete) {
        var orders = [];
        series()
            .first(cb => {
                orders.push('z');
                return cb();
            })
            .each(['a', 'b', 'c'], (item, cb) => {
                orders.push(item);
                return cb();
            })
            .finally(cb => {
                orders.push('y');
                return cb();
            })
            .end((err, info) => { // where everything is actually executed
                expect(orders.length).to.equal(5);
                expect(orders[0]).to.equal('z');
                expect(orders[3]).to.equal('c');
                expect(orders[4]).to.equal('y');
                return testComplete();
            });
    });
    it('Executes each with a callback, with a starting+ending function and another each.', function(testComplete) {
        var orders = [];
        series()
            .first(cb => {
                orders.push('z');
                return cb();
            })
            .each(['a', 'b', 'c'], (item, cb) => {
                orders.push(item);
                return cb();
            })
            .each(['d', 'e', 'f'], (item, cb) => {
                orders.push(item);
                setTimeout(function() {
                    return cb();
                }, 10);
            })
            .finally(cb => {
                orders.push('y');
                return cb();
            })
            .end((err, info) => { // where everything is actually executed
                expect(orders.length).to.equal(8);
                expect(orders[0]).to.equal('z');
                expect(orders[3]).to.equal('c');
                expect(orders[6]).to.equal('f');
                expect(orders[7]).to.equal('y');
                return testComplete();
            });
    });
    it('Executes each with a callback, with a starting+ending function, another each, and a while.', function(testComplete) {
        var orders = [];
        series()
            .first(cb => {
                orders.push('z');
                return cb();
            })
            .each(['a', 'b', 'c'], (item, cb) => {
                orders.push(item);
                return cb();
            })
            .while(() => {
                return orders.length < 7
            }, (cb) => {
                orders.push('x');
                return cb();
            })
            .each(['d', 'e', 'f'], (item, cb) => {
                orders.push(item);
                setTimeout(function() {
                    return cb();
                }, 10);
            })
            .finally(cb => {
                orders.push('y');
                return cb();
            })
            .end((err, info) => { // where everything is actually executed
                expect(orders.length).to.equal(11);
                expect(orders[0]).to.equal('z');
                expect(orders[3]).to.equal('c');
                expect(orders[6]).to.equal('x');
                expect(orders[9]).to.equal('f');
                expect(orders[10]).to.equal('y');
                return testComplete();
            });
    });
});