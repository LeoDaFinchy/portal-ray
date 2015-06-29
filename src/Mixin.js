var mixin = function(){
    var constructors = arguments;
    var obj = {};
    for(var c = 0; c < constructors.length; c++)
    {
        constructor = constructors[c];
        constructor.call(obj);
    }
    return obj;
};

exports["mixin"] = mixin;
