var _ = require('underscore');

var Geometry = require('geometry');
var LineSegment2 = Geometry.LineSegment2;
var Vector2 = Geometry.Vector2;
var Matrix3 = Geometry.Matrix3;

var HexPortal = require('./HexPortal').HexPortal;

function Hex(drawFunc){
    this.portals = [];
    this.drawFunc = drawFunc;
}

exports.Hex = Hex;

Object.defineProperties(Hex.prototype, {
    join: {
        value: function(other, thisExit, thatEntrance){
            if(this.portals[thisExit])
            {
                this.portals[thisExit].other.tidy();
            }
            else
            {
                new HexPortal(this, thisExit);
            }
            this.portals[thisExit].other = new HexPortal(other, thatEntrance);
            this.portals[thisExit].other.other = this.portals[thisExit];
        }
    }
});

Object.defineProperties(Hex, {
});
