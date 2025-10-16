var assert=require("assert")

function f1(){
    return {a:1,b:10};
}

f1.test=function(done){
    var testObj=new f1();
    var sum=testObj.a+testObj.b;
    assert(sum==11);
    setTimeout(done,10);
};

function f2(){
    return {a:2,b:11};
}

f2.test=function(done){
    var testObj=new f2();
    var sum=testObj.a+testObj.b;
    assert(sum==13);
    setTimeout(done,10);
};

function f3(){
    return {a:2,b:11};
}

f3.test=function(done){
    var testObj=new f3();
    var sum=testObj.a+testObj.b;
    assert(sum==15);
    setTimeout(done,10);
};


exports.f1=f1
exports.f2=f2
exports.f3=f3
exports.tests={"f1":f1.test,"f2":f2.test,"f3":f3.test}