assert=require "assert"
tests=require "./../main.js"
testApp=require "./testapp.js"
#it=tests.it

# testManager.DEBUG_MODE="prod" #simulates production mode
# testManager.DEBUG_MODE="dev" #(default) for dev logging

# to fully turn off debug, use:
# testManager.debug.disable()

it "should be able to add test case",(done)=>
  tests.add("f1_test",testApp.tests['f1'])
  #console.log testManager.tests
  assert Object.keys(tests.tests).length==1
  done()

it "should be able to remove test case",(done)=>
  tests.remove("f1_test")
  assert Object.keys(tests.tests).length==0
  done()

it "should be able to run test cases",(done)=>
  tests.add("f1 should work",testApp.tests['f1'])
  tests.add("f2 should work",testApp.tests['f2'])
  #testManager.add("f3 should fail",testApp.tests['f3'])
  tests.doRun null,(e,result)=>
    assert result.result.total==2
    done()

it "should be able to run failed test cases",(done)=>
  tests.remove("f1 should work")
  tests.remove("f2 should work")
  tests.add("f3 should fail",testApp.tests['f3'])
  tests.doRun null,(e,result)=>
    assert result.result.fail==1
    done()
