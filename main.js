var tests={};
var assert=require('assert');
var async=require('async');

addTest=function(name,test){
    tests[name]=test;
};

removeTest=function(name){
    delete tests[name];
};

runTest=function(name,cb){
    var log="";
    var result={
        total:0,
        pass:0,
        fail:0
    }

    function done(e,cb){
        result.total++;
        if(e){
            log+=JSON.stringify(e,null,2);
            log+="\nTest Case Failed.";
            result.fail++
        }
        else{
            log+="\nTest Case Passed.";
            result.pass++
        }
        console.log(log)
        cb()
    }

    if(name) {
        try{
            process.on('error',function(e){
                console.log(e)
                log+="\n"+JSON.stringify(e,null,2)
            })
            console.log("\n"+name)
            log+="\n"+name
            tests[name].test(function(e,logging){
                log+=logging||""
                done(e,finish);
            });
        }catch(e){
            done(e,finish);
        }
    }
    else{
        async.eachOfSeries(tests,function(test,name,cb){
            try{
                console.log("\n"+name)
                test(function(e){
                    done(e,cb);
                })
            }catch(e){
                done(e,cb);
            }
        },function(e,r){
            finish()
        })
    }

    function finish(){
        console.log(result)
        try{
            cb(null,{log:log,result:result});
        }catch(e){}
    }
};

exports.add=addTest;
exports.remove=removeTest;
exports.run=runTest;
exports.tests=tests;