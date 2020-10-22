var series = require('../lib/to-series.js');

var expect = require('chai').expect;

describe('While loop', function() {
    this.timeout(5000);
    it('Executes while.', function(testComplete) {
        var orders = [];
        series()
            .while(() => { return orders.length < 4 }, (done) => {
                orders.push(orders.length);
                setTimeout(function() {
                    return done();
                }, 100);
            })
            .end((err, info) => { // where everything is actually executed
                expect(orders[orders.length - 1]).to.equal(3);
                return testComplete();
            });
    });
    it('Executes `first` first then a while loop', function(testComplete) {
        var orders = [];
        series()
            .first(cb => {
                orders.push(orders.length);
                cb();
            })
            .while(() => { return orders.length < 5 }, (done) => {
                orders.push(orders.length);
                setTimeout(function() {
                    return done();
                }, 100);
            })
            .end((err, info) => { // where everything is actually executed
                expect(orders[orders.length - 1]).to.equal(4);
                return testComplete();
            });
    });
    it('Executes `first` first then a while loop and finally another function', function(testComplete) {
        var orders = [];
        series()
            .first(cb => {
                orders.push(orders.length);
                cb();
            })
            .while(() => { return orders.length < 5 }, (done) => {
                orders.push(orders.length);
                setTimeout(function() {
                    return done();
                }, 100);
            })
            .next(cb => {
                orders.push(orders.length);
                cb();
            })
            .end((err, info) => { // where everything is actually executed
                expect(orders[orders.length - 1]).to.equal(5);
                return testComplete();
            });
    });
    it('Executes 2 while loops and one condition is false', function(testComplete) {
        var orders = [];
        series()
            .first(cb => {
                orders.push(orders.length);
                cb();
            })
            .while(() => { return orders.length < 5 }, (done) => {
                orders.push(orders.length);
                setTimeout(function() {
                    return done();
                }, 100);
            })
            .next(cb => {
                orders.push(orders.length);
                cb();
            })
            .while(() => { return orders.length < 5 }, (done) => {
                orders.push(orders.length);
                setTimeout(function() {
                    return done();
                }, 100);
            })
            .next(cb => {
                orders.push(orders.length);
                cb();
            })
            .end((err, info) => { // where everything is actually executed
                expect(orders[orders.length - 1]).to.equal(6);
                return testComplete();
            });
    });
    it('Executes 2 while loops', function(testComplete) {
        var orders = [];
        series()
            .first(cb => {
                orders.push(orders.length);
                cb();
            })
            .while(() => { return orders.length < 5 }, (done) => {
                orders.push(orders.length);
                setTimeout(function() {
                    return done();
                }, 100);
            })
            .next(cb => {
                orders.push(orders.length);
                cb();
            })
            .while(() => { return orders.length < 10 }, (done) => {
                orders.push(orders.length);
                setTimeout(function() {
                    return done();
                }, 100);
            })
            .next(cb => {
                orders.push(orders.length);
                cb();
            })
            .end((err, info) => { // where everything is actually executed
                expect(orders[orders.length - 1]).to.equal(10);
                return testComplete();
            });
    });
});