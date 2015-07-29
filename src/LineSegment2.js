var LineSegment2 = function(a, b)
{
    this.a = a;
    this.b = b;
};

var LineSegment2Collection = function(){};
LineSegment2Collection.prototype = [];

exports['LineSegment2'] = LineSegment2;
exports['LineSegment2Collection'] = LineSegment2Collection;

var Intersect2 = require('./Intersect2').Intersect2;

Object.defineProperties(LineSegment2.prototype, {
    offset:{
        get: function(){
            return this.b._.subtract(this.a);
        }
    },
    tangent:{
        get: function(){
            return this.offset.tangent;
        }
    },
    normal:{
        get: function(){
            return this.offset.normal;
        }
    },
    intersect:{
        value: function(targets){
            return targets.map(function(value){
                return new Intersect2(this, value);
            }, this);
        }
    },
    normalPoint:{
        get: function(){
            return this.a._.add(this.normal);
        }
    }
});

Object.defineProperties(LineSegment2Collection.prototype, {
    intersectSelf: {
        value: function(){
            var results = [];
            for(var i = 0; i < this.length; i++)
            {
                for(var j = i + 1; j < this.length; j++)
                {
                    results.push(new Intersect2(this[i], this[j]));
                }
            }
            return results;
        }
    },
    intersect: {
        value: function(other){
            var results = [];
            for(var i = 0; i < this.length; i++)
            {
                for(var j = 0; j < other.length; j++)
                {
                    results.push(new Intersect2(this[i], other[j]));
                }
            }
        }
    }
});
