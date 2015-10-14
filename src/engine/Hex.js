var _ = require('underscore');

var Geometry = require('geometry');
var LineSegment2 = Geometry.LineSegment2;
var Vector2 = Geometry.Vector2;
var Matrix3 = Geometry.Matrix3;

var HexPortal = require('./HexPortal').HexPortal;

function Hex(tile, grid){
    this.id = Hex.id++;
    this.grid = grid;
    this.tile = tile;
    this.portals = [];
    _.each(_.range(6), function(i){
        new HexPortal(this, i);
    }, this);
}

exports.Hex = Hex;

Object.defineProperties(Hex.prototype, {
    join: {
        value: function(other, thisExit, thatEntrance){
            this.portals[thisExit].other.mirror();
            HexPortal.link(
                this.portals[thisExit],
                other.portals[thatEntrance]
            )
        }
    }
});

Object.defineProperties(Hex, {
    numBind: {
        value: function(input){
            var remainder = input % 6;
            return remainder >= 0 ? remainder : remainder + 6;
        }
    },
    id: {
        value: 0,
        writable: true,
    }
});
