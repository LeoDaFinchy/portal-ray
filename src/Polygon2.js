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

Object.defineProperties(Polygon2Collection.prototype, {

});
