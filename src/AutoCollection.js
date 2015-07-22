var _ = require('underscore')._;

var AutoCollection = function(subject){
    
    var collection = function(){};
    collection.prototype = [];

    for(var key in subject.prototype){
        var descriptor = Object.getOwnPropertyDescriptor(subject.prototype, key);
        var method = _.has(descriptor, 'value') && typeof descriptor.value === 'function';
        if(method)
        {
            Object.defineProperty(
                collection.prototype,
                key,
                {
                    value: _.partial(
                        function(funcName){
                            return this.map(function(x){
                                return x[funcName].apply(x, arguments);
                            }, arguments);
                        },
                        key
                    ),
                    enumerable: true
                }
            );
        }
        else
        {
            Object.defineProperty(
                collection.prototype,
                key,
                {
                    get: _.partial(
                        function(propName){
                            return this.map(function(x){
                                return x[propName];
                            });
                        },
                        key
                    ),
                    enumerable: true
                }
            );
        }
    }
    return collection;
};
