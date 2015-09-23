var _ = require('underscore');

var Geometry = require('geometry');
var LineSegment2 = Geometry.LineSegment2;
var Vector2 = Geometry.Vector2;
var Matrix3 = Geometry.Matrix3;

var corners = [
    Vector2.unit,
    Matrix3.rotation(Math.PI * (1.0/3.0)).transformVector2(Vector2.unit),
    Matrix3.rotation(Math.PI * (2.0/3.0)).transformVector2(Vector2.unit),
    Matrix3.rotation(Math.PI).transformVector2(Vector2.unit),
    Matrix3.rotation(Math.PI * (4.0/3.0)).transformVector2(Vector2.unit),
    Matrix3.rotation(Math.PI * (5.0/3.0)).transformVector2(Vector2.unit)
];

var edges = [
    new LineSegment2(corners[0], corners[1]),
    new LineSegment2(corners[1], corners[2]),
    new LineSegment2(corners[2], corners[3]),
    new LineSegment2(corners[3], corners[4]),
    new LineSegment2(corners[4], corners[5]),
    new LineSegment2(corners[5], corners[0]),
];

function Hex(){}

exports.Hex = Hex;

Object.defineProperties(Hex.prototype, {
    visibility: {
        value: function(eye, entry, bounds){
            var exits = _.map(Hex.exitsPerEntrance[entry], function(x){
                return edges[x];
            })
            var entrance = Hex.edges[entry];
            var leftEntry = entrance.a._.add(entrance.offset.multiplyByScalar(bounds.lower));
            var rightEntry = entrance.a._.add(entrance.offset.multiplyByScalar(bounds.higher));
            var left = new LineSegment2(entrance.a, new LineSegment2(eye, leftEntry).tangent.add(entrance.a));
            var right = new LineSegment2(entrance.a, new LineSegment2(eye, rightEntry).tangent.add(entrance.a));

            // var left.intersect(exits);
        }
    },
});

Object.defineProperties(Hex, {
    corners:{
        value: corners
    },
    edges:{
        value: edges
    },
    exitsPerEntrance:{
        value: _.map([0,1,2,3,4,5], function(val, i, arr){
            return _.without(arr, val);
        }),
    }
});

console.log(Hex.exitsPerEntrance);
