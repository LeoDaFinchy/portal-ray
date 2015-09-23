var _ = require('underscore');

var Geometry = require('geometry');
var LineSegment2 = Geometry.LineSegment2;
var Vector2 = Geometry.Vector2;
var Matrix3 = Geometry.Matrix3;

var offset = Vector2.unit.multiplyByScalar(3.0);

var corners = [
    offset,
    Matrix3.rotation(Math.PI * (1.0/3.0)).transformVector2(offset),
    Matrix3.rotation(Math.PI * (2.0/3.0)).transformVector2(offset),
    Matrix3.rotation(Math.PI).transformVector2(offset),
    Matrix3.rotation(Math.PI * (4.0/3.0)).transformVector2(offset),
    Matrix3.rotation(Math.PI * (5.0/3.0)).transformVector2(offset)
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
            var entrance = Hex.edges[entry];
            var leftEntry = entrance.a._.add(entrance.offset.multiplyByScalar(bounds.lower));
            var rightEntry = entrance.a._.add(entrance.offset.multiplyByScalar(bounds.upper));
            var left = new LineSegment2(entrance.a, new LineSegment2(eye, leftEntry).tangent.add(entrance.a));
            var right = new LineSegment2(entrance.b, new LineSegment2(eye, rightEntry).tangent.add(entrance.b));

            var leftX = _.map(left.intersect(Hex.edges), function(x){return x.solve();});
            var rightX = _.map(right.intersect(Hex.edges), function(x){return x.solve();});

            _.each(leftX, function(x){
                if(x.x){
                    if(x.fractionB < 0)
                    {
                        x.fractionB = 0;
                        x.x = x.b.a;
                    }
                    if(x.fractionB > 1)
                    {
                        x.fractionB = 1;
                        x.x = x.b.b;
                    }
                }
            });

            _.each(rightX, function(x){
                if(x.x){
                    if(x.fractionB < 0)
                    {
                        x.fractionB = 0;
                        x.x = x.b.a;
                    }
                    if(x.fractionB > 1)
                    {
                        x.fractionB = 1;
                        x.x = x.b.b;
                    }
                }
            });

            var patch = [
                entrance.a,
                entrance.b
            ];

            for(var i = 1; i < 6; i++)
            {
                var left = leftX[i];
                var right = rightX[i];
                if(left.x && right.x)
                {
                    if((left.fractionB > right.fractionB) && (left.angle > 0) && (right.angle > 0))
                    {
                        patch.push(right.x);
                        patch.push(left.x);
                    }
                    if((left.fractionB < 1) && (left.fractionB > 0) && (right.angle < 0) && (left.angle > 0)){
                        patch.push(left.x);
                    }
                    if((right.fractionB < 1) && (right.fractionB > 0) && (left.angle < 0) && (right.angle > 0)){
                        patch.push(right.x);
                    }
                }
            }

            patch.push(entrance.a);

            return {
                patch: patch,
                left: left,
                right: right,
                // uppers: uppers,
                // lowers: lowers,
                beam: [
                    eye,
                    leftEntry,
                    rightEntry
                ]
            }
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
