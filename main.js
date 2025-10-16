var tests={};
var assert=require('assert');
var async=require('async');
var chalk=require('chalk');

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
    };
    var tstart=Date.now()
    var timeout=20000;

    function done(e,cb,elap){
        result.total++;
        if(e){
            log+="\n"+e.stack
            log+="\n-> Test Case Failed. "+"("+elap+")";
            result.fail++
        }
        else{
            log+="\n-> Test Case Passed. "+"("+elap+")";
            result.pass++
        }
        //console.log(log);
        cb()
    }

    if(name) {
        var startTime=Date.now()
        try{
            process.on('uncaughtException', function(err) {
                console.log(err.stack);
                log+=JSON.stringify(err.stack,null,2)
            });

            //console.log("\n"+name);
            log+="\n"+name;

            debug=function(text){
                if(typeof text=="object")
                    log+=JSON.stringify(text)+"\n"
                else
                    log+=text.toString()+"\n"
            }
            tests[name].test(function(e){
                var endTime=Date.now()
                var elap=endTime-startTime;
                done(e,finish,elap);
            });
        }catch(e){
            var endTime=Date.now()
            var elap=endTime-startTime;
            done(e,finish,elap);
        }
    }
    else{
        async.eachOfSeries(tests,function(test,name,cb){
            try{
                //console.log("\n"+name);
                log+=("\n"+name);
                var startTime=Date.now()
                test(function(e,logging){
                    var endTime=Date.now()
                    var elap=endTime-startTime
                    log+=(logging||"");
                    done(e,cb,elap);
                })
            }catch(e){
                var endTime=Date.now()
                var elap=endTime-startTime
                done(e,cb,elap);
            }
        },function(e,r){
            finish()
        })
    }

    function finish(){
        var tend=Date.now()
        var telap=tend-tstart
        result.time=telap
        //console.log(result);
        try{
            cb(null,{log:log,result:result});
        }catch(e){
            cb(e);
        }
    }
};

printResult=function(error,result){
  if(error){
    console.error(error.stack);
  }
  var hay=result.log.split('\n');
  for(i of hay){
    if(i.toLowerCase().includes('passed'))
      console.log(chalk.green.bold(i));
    else
      console.log(chalk.yellow.bold(i));
  }
  if(result.result.total==result.result.pass)
  {
    console.log(chalk.green.bold(JSON.stringify(result.result,null,2)));
    console.log(chalk.green.bold("All tests passed"));
  }
  else
  {
    console.log(chalk.red.bold(JSON.stringify(result.result,null,2)));
  }
}

exports.add=addTest;
exports.remove=removeTest;
exports.run=runTest;
exports.tests=tests;
exports.printResult=printResult;