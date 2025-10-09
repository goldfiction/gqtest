var assert=require("assert")

function f1(){
    return {a:1,b:10};
}

f1.test=function(done){
    var testObj=new f1();
    var sum=testObj.a+testObj.b;
    assert(sum==11);
    done();
};

function f2(){
    return {a:2,b:11};
}

f2.test=function(done){
    var testObj=new f2();
    var sum=testObj.a+testObj.b;
    assert(sum==13);
    done();
};

exports.f1=f1
exports.f2=f2
exports.tests={"f1":f1.test,"f2":f2.test}