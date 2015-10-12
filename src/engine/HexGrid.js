var _ = require('underscore');
var Geometry = require('geometry');
var Vector2 = Geometry.Vector2;

var Hex = require('./Hex').Hex;

var TerrainTiles_mod = require('./TerrainTiles');
var TerrainTiles = TerrainTiles_mod.TerrainTiles;

function HexGrid(applet){
    this.applet = applet;

    this.seedHex = new Hex(this.applet.terrainTiles.newTile([
        TerrainTiles.drawFuncs.variedColourCircles(new Vector2(100, 100)),
        TerrainTiles.drawFuncs.text("0", 48)
    ]));

    this.mirrors = this.seedHex.portals.slice();
}

exports.HexGrid = HexGrid;

Object.defineProperties(HexGrid.prototype, {
    newTile: {
        value: function(neighbour, neighbourExit, thisExit){
            var newTile = new Hex(this.applet.terrainTiles.newTile([
                TerrainTiles.drawFuncs.variedColourCircles(new Vector2(100, 100)),
                TerrainTiles.drawFuncs.text(_.size(this.applet.terrainTiles.library), 48)
            ]));
            newTile.join(neighbour, thisExit, neighbourExit);
            return newTile;
        }
    },
    newTileThroughTheLookingGlass: {
        value: function(){
            var newTile = new Hex(this.applet.terrainTiles.newTile([
                TerrainTiles.drawFuncs.variedColourCircles(new Vector2(100, 100)),
                TerrainTiles.drawFuncs.text(_.size(this.applet.terrainTiles.library), 48)
            ]));
            var mirror = _.sample(this.mirrors);
            this.mirrors = _.without(this.mirrors, mirror);
            var thisExit = _.random(0, 5);
            newTile.join(mirror.hex, thisExit, mirror.exit);
            var newMirrors = newTile.portals.slice();
            newMirrors.splice(thisExit, 1);
            this.mirrors = this.mirrors.concat(newMirrors);
            return newTile;
        }
    }
});