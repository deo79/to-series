# to-series

To-Series is a zero-dependency control-flow module for running functions in order in a promise-like fashion.  Provides some nice semantics for readability and a result object that describes the operations.

Why another control-flow library, especially in the world of async/await?  There are some reasons:
1. Lots of code still uses callbacks
2. This one is really easy to read
3. Aren't promises+async/await just another abstraction that remove callback hell, but add try/catch hell? And then you need to remember what dependencies/libraries use promises, and which don't? Just saying...
4. You can still put promise code in each of these steps.
5. You need `.each()` (that runs in a series) and a `.while()` when controlling flow.

## Example

Because reading code is the easiest way to understand.

```
var series = require('to-series');

series()
    .first((done) => {
        setTimeout(function() {
            console.log(1);
            return done();
        }, 1000);
    })
    .next(() => { console.log(2); }) // not async
    .next((done) => {
        setTimeout(function() {
            console.log(3);
            return done();
        }, 1000);
    })
    .finally((done) => {
        setTimeout(function() {
            console.log(4);
            return done();
        }, 1000);
    })
    .end((err, info) => { // where everything is actually executed
        console.log('Done');
        console.log(info); // { count: 4, early: false }
    });
```

## Async and not async

Since this is a control flow library, and not necessarily only an async library, it also supports synchronous functions.  Asynchronous functions need 1 callback, and synchronous functions need 0.  If you pass a function with more than 1 argument defined, `to-series` will throw an error.

## Error handling

Synchronous (or zero-argument) functions will be executed in a `try {} catch() {}` block, and if an error occurs, it will be passed to the `.end` function.

When calling the `done()` callback in async functions, you can pass an error and futher steps in the flow will not execute.  The `.end` will receive the error.

## Semantics

You'll notice that the API includes `.first`, `.next` and `.finally`.  These are exactly the same as each other under-the-hood in `to-series`.  If you choose to use them, they can provide a nice readability to the code.

## Chaining

If you want a promise-like experience, you can chain the functions together.

```
//var series = require('to-series');

var num = 0;

var async = function(done) {
    ++num;
    setTimeout(function() {
        console.log('function', num);
        return done();
    }, 250);
};

var iterator = function(item, done) {
    num+=item;
    setTimeout(function() {
        console.log('function', num);
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
    .end((err) => { console.log('Done.') });

/* Console output:
$ node test/basic-example.js
function 1                  
function 2                  
function 3                  
function 4                  
function 5                  
function 6                  
function 8                  
function 11                 
function 12                 
function 13                 
Done.                       
*/
```

## Named flow
### Conditionally add flow steps and abort flow

Chaining can be convenient, and look nice too, but sometimes it's just as nice to conditionally add functions to the flow.  Consider the following (using `setTimeout` to simulate database/IO):

```
var series = require('to-series');
var env = 'development',
    passwordValidated = false;

var userAuthentication = series(); // establish a variable for this flow

userAuthentication.first((done) => {
    console.log('Look up user');
    setTimeout(function() { return done(); }, 250);
});

if (env === 'development') {
    userAuthentication.next((done) => {
        console.log('Send welcome email example.');
        setTimeout(function() { return done(); }, 250);
    });
}

userAuthentication.next((done) => {
    console.log('Validate password');
    passwordValidated = true;
    setTimeout(function() { return done(); }, 250);
});

userAuthentication.next((done) => {
    console.log('Check password');
    if (!passwordValidated) userAuthentication.finish(); // not validated? Jump straight to `.end` and skip the rest
    setTimeout(function() { return done(); }, 250);
});

userAuthentication.next((done) => {
    if (passwordValidated) {
        console.log('Log successful login');
    }
    setTimeout(function() { return done(); }, 250);
});

userAuthentication.end((err, info) => {
    console.log('Done');
    console.log(info); // { count: 5, early: false }
});

/* =>
Look up user
Send welcome email example.
Validate password
Check password
Log successful login
Done
*/
```

Had `userAuthentication.finish();` run, `early: true` would be present in the `info` object, and `count: 4`.

## API

### `.next()`

(And aliases `.first()` and `.finally()`)

Add a function to the control-flow.  The function can accept 0 or 1 argument.  1 argument functions are assumed to be passed a callback that signifies that it's done.

### `.while()`

Run a condition function and another function until the condition funciton no longer returns true. 
(New in 0.0.3)

```
    let counter = 1;
    series()
        .first(cb => {
            return cb();
        })
        .while(() => counter < 3, cb => {
            counter++;
            return cb();    
        })
        .end(err => {});
```

### `.each()`

Run a function on each of the elements of the supplied array. The array of items should be the first agrument, and the iterator function should be the second.  The function does not need to have a callback, but can in case it's async. Array iterators process one after the other, and not all at once.
(New in 0.0.3)

```
    // with callback
    let counter = 1;
    series()
        .first(cb => {
            return cb();
        })
        .each([1, 2, 3], (item, cb) => {
            counter+=item;
            return cb();    
        })
        .end(err => {});

    // without callback
    let counter = 1;
    series()
        .first(cb => {
            return cb();
        })
        .each([1, 2, 3], (item) => {
            counter+=item; 
        })
        .end(err => {});
```

### `.finish()`

Abort the rest of the control flow steps and go straight to `.end()` _after the current function runs_.

### `.clear()`

Clear the current setup so that you can reuse the named flow.  If you are done with the whole process, and want to re-use it for something else, you can clear it out.

### `.end()`

This is the final callback/function for when the process is complete.  And, it actually triggers the whole process to start.  If you never call `.end()`, your flow never starts.  It accepts a callback with 2 arguments: `err` and `info`.  You don't need to specify either of them if you're not interested in them.

```
    .end(function(err, info) {
        if(err) {
            // do something!
        }
        console.log('I am done with this control flow.');
    });
```