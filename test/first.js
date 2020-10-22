var series = require('../lib/to-series.js');

var expect = require('chai').expect;

describe('Chained (un-named) control flow', function() {
    this.timeout(5000);
    it('Executes 4 functions in order.', function(testComplete) {
        var orders = [];
        series()
            .first((done) => {
                orders.push(1);
                setTimeout(function() {
                    return done();
                }, 1000);
            })
            .next(() => {
                orders.push(2);
            }) // not async
            .next((done) => {
                orders.push(3);
                setTimeout(function() {
                    return done();
                }, 1000);
            })
            .finally((done) => {
                orders.push(4);
                setTimeout(function() {
                    return done();
                }, 1000);
            })
            .end((err, info) => { // where everything is actually executed
                expect(orders[orders.length - 1]).to.equal(4);
                return testComplete();
            });
    });
});
