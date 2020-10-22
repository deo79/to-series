var series = require('../lib/to-series.js');
var expect = require('chai').expect;
var userAuthentication = series();

describe('Named flow', function() {
    this.timeout(5000);
    it('Executes a named control flow', function(testComplete) {

        var env = 'development',
            passwordValidated = false,
            controls = [];

        userAuthentication.first((done) => {
            controls.push('Look up user');
            setTimeout(function() {
                return done();
            }, 250);
        });

        if (env === 'development') {
            userAuthentication.next((done) => {
                controls.push('Send welcome email example.');
                setTimeout(function() {
                    return done();
                }, 250);
            });
        }

        userAuthentication.next((done) => {
            controls.push('Validate password');
            passwordValidated = true;
            setTimeout(function() {
                return done();
            }, 250);
        });

        userAuthentication.next((done) => {
            controls.push('Check password');
            if (!passwordValidated) userAuthentication.finish();
            setTimeout(function() {
                return done();
            }, 250);
        });

        userAuthentication.next((done) => {
            if (passwordValidated) {
                controls.push('Log successful login');
            }
            setTimeout(function() {
                return done();
            }, 250);
        });

        userAuthentication.end((err, info) => {
            controls.push('Done');
            expect(controls.length).to.equal(6);
            return testComplete();
        });
    });

    it('Clears the named flow and executes it', function(testComplete) {
    	userAuthentication.clear();
    	userAuthentication.end((err, info) => {
    		expect(info.count).to.equal(0);
    		return testComplete();
    	})
    });

    it('Repopulates the named flow and executes it', function(testComplete) {
    	userAuthentication.clear();
    	var controls = [];
    	userAuthentication.first(() => { controls.push(1) });
    	userAuthentication.next(() => { controls.push(2) });
    	userAuthentication.next(() => { controls.push(3) });
    	userAuthentication.next((done) => { 
    		controls.push(4) 
    		setTimeout(function() { return done(); }, 50);
    	});
    	userAuthentication.end((err, info) => {
    		expect(controls.length).to.equal(4);
    		return testComplete();
    	})
    });
});