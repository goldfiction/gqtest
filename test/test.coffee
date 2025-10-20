assert=require "assert"
global.testManager=require "./../main.js"
testApp=require "./testapp.js"

# testManager.DEBUG_MODE="prod" #simulates production mode
# testManager.DEBUG_MODE="dev" #(default) for dev logging

# to fully turn off debug, use:
# testManager.debug.disable()

it "should be able to add test case",(done)=>
  testManager.add("f1_test",testApp.tests['f1'])
  #console.log testManager.tests
  assert Object.keys(testManager.tests).length==1
  done()

it "should be able to remove test case",(done)=>
  testManager.remove("f1_test")
  assert Object.keys(testManager.tests).length==0
  done()

it "should be able to run test cases",(done)=>
  testManager.add("f1 should work",testApp.tests['f1'])
  testManager.add("f2 should work",testApp.tests['f2'])
  #testManager.add("f3 should fail",testApp.tests['f3'])
  testManager.doRun null,(e,result)=>
    assert result.result.total==2
    done()

it "should be able to run failed test cases",(done)=>
  testManager.remove("f1 should work")
  testManager.remove("f2 should work")
  testManager.add("f3 should fail",testApp.tests['f3'])
  testManager.doRun null,(e,result)=>
    assert result.result.fail==1
    done()
