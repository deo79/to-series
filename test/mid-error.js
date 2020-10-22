var series = require('../lib/to-series.js');

var expect = require('chai').expect;

var asyncFunc = (cb) => {
    setTimeout(() => {
        return cb();
    }, 10);
};

var asyncFuncErr = (cb) => {
    setTimeout(() => {
        return cb(new Error('Sample error'));
    }, 10);
};

describe('Chained (un-named) control flow with errors', function() {
    this.timeout(5000);
    it('Executes 4 functions in order.', function(testComplete) {
        series()
            .first((done) => {
                asyncFunc(done);
            })
            .next((done) => {
                asyncFunc(done);
            })
            .next((done) => {
                asyncFunc(done);
            })
            .next((done) => {
                asyncFunc(done);
            })
            .next((done) => {
                asyncFuncErr(done);
            })
            .finally((done) => {
                console.log('never here');
                asyncFunc(done);
            })
            .end((err, info) => { // where everything is actually executed
                expect(info.early).to.equal(true);
                return testComplete();
            });
    });
});