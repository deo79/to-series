var series = require('../lib/to-series.js');

var expect = require('chai').expect;

describe('Large Dataset', function() {
    this.timeout(5000);
    it('Executes each with a callback.', function(testComplete) {
    	const datasetSize = 10000;
		const largeArray = [...Array(datasetSize).keys()];
		let counter = 0;
		series()
			.each(largeArray, (item, cb) => {
				counter++;
				cb();
			})
			.end(err => {
				expect(counter).to.eq(datasetSize);
				return testComplete();
			});
    });
});


