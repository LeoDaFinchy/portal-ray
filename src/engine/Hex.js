var _ = require('underscore');

var Geometry = require('geometry');
var LineSegment2 = Geometry.LineSegment2;
var Vector2 = Geometry.Vector2;
var Matrix3 = Geometry.Matrix3;

function Hex(drawFunc){
    this.portals = [];
    this.drawFunc = drawFunc;
}

exports.Hex = Hex;

Object.defineProperties(Hex.prototype, {
});

Object.defineProperties(Hex, {
});
