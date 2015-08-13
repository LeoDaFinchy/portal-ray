var _ = require('underscore')._;

var Polygon2 = function(points)
{
    this.points = points;
};

var Polygon2Collection = function(){};
Polygon2Collection.prototype = [];

exports['Polygon2'] = Polygon2;
exports['Polygon2Collection'] = Polygon2Collection;

var LineSegment2 = require('./LineSegment2').LineSegment2;
var Vector2 = require('./Vector2').Vector2;

Object.defineProperties(Polygon2.prototype, {
    edges: {
        get: function(){
            return _.map(this.points, function(value, index, array){
                var otherIndex = (index + 1) % array.length;
                return new LineSegment2(value, array[otherIndex]);
            });
        }
    }
});

Object.defineProperties(Polygon2, {
    regular: {
        value: function(corners, radius, turns){
            turns = turns || 1;
            var angle = Math.PI * 2.0 * turns / corners;
            return new Polygon2(_
                .range(0, corners)
                .map(function(x){
                    return x * angle;
                })
                .map(function(x){
                    return new Vector2(Math.cos(x) * radius, Math.sin(x) * radius);
                })
            );
        }
    }
});

Object.defineProperties(Polygon2Collection.prototype, {

});
