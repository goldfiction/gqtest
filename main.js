var tests = {};
var assert = require('assert');
var async = require('async');
var chalk = require('chalk');

log = function (str) {
    if (exports.env == "dev")
        console.log(str);
}
alog = log;
clog = function (str) {
    console.log(str);
}

addTest = function (name, test) {
    tests[name] = test;
};

removeTest = function (name) {
    delete tests[name];
};

runTest = function (name, cb) {
    var log = "";

    debug = function (text) {
        if (typeof text == "object")
            log += JSON.stringify(text, null, 2) + "\n"
        else
            log += text.toString() + "\n"
    }

    de = debug;

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

            process.on('uncaughtException', function (err) {
                alog(err.stack);
                de(err.stack)
            });

            //console.log("\n"+name);
            de("\n" + name);

            tests[name].test(function (e) {
                var endTime = Date.now()
                var elap = endTime - startTime;
                done(e, finish, elap);
            });
        } catch (e) {
            var endTime = Date.now()
            var elap = endTime - startTime;
            done(e, finish, elap);
        }
    }
    else {
        exports.staging.beforeAll(function () {
            async.eachOfSeries(tests, function (test, name, cb) {
                var startTime = Date.now()
                try {
                    exports.staging.before(function () {
                        alog("\n test case " + name + " is ran");
                        de("\n" + name);
                        var startTime = Date.now()
                        test(function (e, logging) {
                            var endTime = Date.now()
                            var elap = endTime - startTime
                            de(logging || "");
                            exports.staging.after(function () {
                                done(e, cb, elap);
                            })
                        })
                    })
                } catch (e) {
                    var endTime = Date.now()
                    var elap = endTime - startTime
                    done(e, cb, elap);
                }
            }, function (e, r) {
                exports.staging.afterAll(function () {
                    finish()
                })
            })
        })
    }

    function finish() {
        var tend = Date.now()
        var telap = tend - tstart
        result.time = telap
        //console.log(result);
        try {
            return cb(null, { log: log, result: result });
        } catch (e) {
            return cb(e);
        }
    }
};

printResult = function (error, result) {
    if (error) {
        console.error(error.stack);
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
        console.error(error.stack);
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
exports.env = "dev";

exports.staging = {}
// these are stub stagings. Override these for custom behavior
exports.staging.before = function (done) { done() };
exports.staging.after = function (done) { done() };
exports.staging.beforeAll = function (done) { done() };
exports.staging.afterAll = function (done) { done() };

exports.log = log;
exports.assert = assert;
exports.tests = tests;
exports.async = async;
exports.chalk = chalk;

exports.assertTrue = assertTrue;