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

    function done(e,cb){
        result.total++;
        if(e){
            log+=e.stack
            log+="\n-> Test Case Failed.";
            result.fail++
        }
        else{
            log+="\n-> Test Case Passed.";
            result.pass++
        }
        //console.log(log);
        cb()
    }

    if(name) {
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
                done(e,finish);
            });
        }catch(e){
            done(e,finish);
        }
    }
    else{
        async.eachOfSeries(tests,function(test,name,cb){
            try{
                //console.log("\n"+name);
                log+=("\n"+name);

                test(function(e,logging){
                    log+=(logging||"");
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
        //console.log(result);
        try{
            cb(null,{log:log,result:result});
        }catch(e){}
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