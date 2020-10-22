//var series = require('to-series');
var series = require('../lib/to-series.js');

var num = 0;

var async = function(done) {
    ++num;
    setTimeout(function() {
        //console.log('function', num);
        return done();
    }, 250);
};

var iterator = function(item, done) {
	num+=item;
	setTimeout(function() {
        //console.log('function', num);
        return done();
    }, 250);
};

var condition = function() {
	return num < 5;
};

series()
    .first(async)
    .while(condition, async)
    .each([1, 2, 3], iterator)
    .next(async)
    .finally(async)
    .end((err) => { 
        //console.log('Done.') 
    });