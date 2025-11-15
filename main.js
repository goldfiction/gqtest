var tests = {};
var assert = require('assert');
var async = require('async');
var chalk = require('chalk');
var gqdone = require('gqdone');

var util = require('util');
var debug = require('debug')
// var debuglog = util.debuglog;
// this come from this discussion
// https://stackoverflow.com/questions/38962957/how-to-enable-node-debug-without-environment-variables
/*
debuglogFormatted = debuglog(function (set) {
    pid = process.pid;
    msg = util.format.apply(util, arguments);
    console.error('%s %d: %s', set, pid, msg);
})
*/

// use "NODE_DEBUG=gqtest node app.js" to inspect test verbosely
// use "NODE_DEBUG=* node app.js" to inspect all log verbosely
// or enable this line to enable verbose debug logging
// debug.enable('gqtest*')
var deb = debug("gqtest")
dlog = util.debuglog("gqtest");

clog = function (str) {
    console.log(str);
}
log = function (str) {
    if (deb.enabled) {
        deb(str)
    } else if (exports.DEBUG_MODE == "dev") {
        clog(str);
    }
}
alog = log;

addTest = function (name, test) {
    tests[name] = test;
};

removeTest = function (name) {
    delete tests[name];
};

runTest = function (name, cb) {
    var log = "";

    de = function (text) {
        //clog(typeof text)
        if (typeof text == "object")
            log += JSON.stringify(text, null, 2) + "\n"
        else
            log += text.toString() + "\n"
    }

    var result = {
        total: 0,
        pass: 0,
        fail: 0
    };
    var tstart = Date.now()
    var timeout = 20000;

    function done(e, cb, elap) {
        result.total++;
        if (e) {
            de("\n");
            de(e.stack);
            //if (exports.DEBUG_MODE != "dev")
            //    clog(e.stack);
            de("\n-> Test Case Failed. " + "(" + elap + ")");
            result.fail++
        }
        else {
            de("\n-> Test Case Passed. " + "(" + elap + ")");
            result.pass++
        }
        //console.log(log);
        cb()
    }

    if (name) {
        var startTime = Date.now()
        try {

            process.on('uncaughtException', function (e) {
                clog(e.stack);
                de(e.stack)
            });

            //console.log("\n"+name);
            de("\n" + name);

            tests[name].test(function (e) {
                var endTime = Date.now()
                var elap = endTime - startTime;
                return done(e, finish, elap);
            });
        } catch (e) {
            var endTime = Date.now()
            var elap = endTime - startTime;
            return done(e, finish, elap);
        }
    }
    else {
        exports.staging.beforeAll(function () {
            currdate = new Date(); // Current date and time
            localeString = currdate.toLocaleString('en-CA',{});
            de("Commandline: "+process.argv.join(" ")+"\n");
            de("Time: "+localeString+"\n")
            de("----"+"\n")
            async.eachOfSeries(tests, function (test, name, cb) {
                var startTime = Date.now()
                try {
                    exports.staging.before(function () {
                        clog(chalk.yellow.bold("\n test case " + name + " is ran"));
                        de("\n" + name);
                        var startTime = Date.now()
                        test(function (e, logging) {
                            var endTime = Date.now()
                            var elap = endTime - startTime
                            de(logging || "");
                            exports.staging.after(function () {
                                return done(e, cb, elap);
                            })
                        })
                    })
                } catch (e) {
                    var endTime = Date.now()
                    var elap = endTime - startTime
                    return done(e, cb, elap);
                }
            }, function (e, r) {
                exports.staging.afterAll(function () {
                    return finish(e, r)
                })
            })
        })
    }

    function finish(e, r) {
        var tend = Date.now()
        var telap = tend - tstart
        result.time = telap
        //console.log(result);
        try {
            setTimeout(function(){
                gqdone.done(log);
            },10);
        } catch (e) { }
        try {
            return cb(e, { log: log, result: result });
        } catch (e) {
            return cb(e);
        }
    }
};

printResult = function (error, result) {
    if (error) {
        // clog(chalk.red.bold(error.stack));
    }
    var hay = result.log.split('\n');
    for (i of hay) {
        if (i.toLowerCase().includes('passed'))
            log(chalk.green.bold(i));
        else
            log(chalk.yellow.bold(i));
    }
    if (result.result.total == result.result.pass) {
        clog(chalk.green.bold(JSON.stringify(result.result, null, 2).replace(/[{}]/g, '')));
        clog(chalk.green.bold("All tests passed"));
    }
    else {
        clog(chalk.red.bold(JSON.stringify(result.result, null, 2).replace(/[{}]/g, '')));
    }
}

printMinResult = function (error, result) {
    if (error) {
        // clog(chalk.red.bold(error.stack));
        clog(chalk.red.bold(JSON.stringify(result.result, null, 2).replace(/[{}]/g, '')));
    } else {
        clog(chalk.green.bold(JSON.stringify(result.result, null, 2).replace(/[{}]/g, '')));
    }

}

notAddTest = function (name, test) {
    // do nothing here
    log("Test case " + name + " skipped");
};

describe = function (desc, func) {
    func(desc);
}

doRun = function (name, cb) {
    cb = cb || function (e, r) { }
    if (!name) {
        runTest(null, function (e, r) {
            printResult(e, r);
            return cb(e, r);
        })
    } else {
        return cb();
    }
}

assertTrue = function (value) {
    assert.equal(value, true);
}

exports.xit = notAddTest;
exports.itx = notAddTest;
exports.describe = describe;
exports.it = addTest;

exports.add = addTest;
exports.remove = removeTest;
exports.run = runTest;
exports.doRun = doRun;
exports.tests = tests;

exports.printResult = printResult;
exports.printMinResult = printMinResult;

// change this to production will not show log
exports.DEBUG_MODE = "dev";

exports.staging = {}
// these are stub stagings. Override these for custom behavior
exports.staging.before = function (done) { done() };
exports.staging.after = function (done) { done() };
exports.staging.beforeAll = function (done) { done() };
exports.staging.afterAll = function (done) { done() };

exports.log = log;
exports.debug = debug;
exports.deb = deb;

exports.assert = assert;
exports.tests = tests;
exports.async = async;
exports.chalk = chalk;

exports.assertTrue = assertTrue;