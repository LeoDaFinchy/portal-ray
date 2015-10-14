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

    this.hexes = {0: this.seedHex}
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
            this.hexes[newTile.id] = newTile;
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
            this.joinFlatlyAdjacentEdges(newTile);
            this.hexes[newTile.id] = newTile;
            return newTile;
        }
    },
    joinFlatlyAdjacentEdges: {
        value: function(hex){
            console.log("tryJoin");
            var hexMirrors = _.filter(hex.portals, function(x){return x.other == x;});
            _.each(hexMirrors, function(mirror){
                var exit = mirror.exit;
                var hex = mirror.hex;
                var options = [];
                var prevPortal = hex.portals[Hex.numBind(exit - 1)];
                if(prevPortal.other != prevPortal)  //  If this portal isn't a mirror
                {
                    var firstNeighbourExitPortal = prevPortal.other;
                    var firstNeighbourExit = firstNeighbourExitPortal.exit;
                    var firstNeighbour = firstNeighbourExitPortal.hex;
                    var firstNeighbourPrevPortal = firstNeighbour.portals[Hex.numBind(firstNeighbourExit - 1)];
                    if(firstNeighbourPrevPortal.other != firstNeighbourPrevPortal)  //  If this portal leads further
                    {
                        var secondNeighbourExitPortal = firstNeighbourPrevPortal.other;
                        var secondNeighbourExit = secondNeighbourExitPortal.exit;
                        var secondNeighbour = secondNeighbourExitPortal.hex;
                        var secondNeighbourPrevPortal = secondNeighbour.portals[Hex.numBind(secondNeighbourExit - 1)];
                        if(secondNeighbourPrevPortal.other == secondNeighbourPrevPortal)    // If this portal is a mirror
                        {
                            options.push({
                                other: secondNeighbour,
                                thatEntrance: secondNeighbourPrevPortal.exit
                            });
                        }
                    }
                }
                var nextPortal = hex.portals[Hex.numBind(exit + 1)];
                if(nextPortal.other != nextPortal)  //  If this portal isn't a mirror
                {
                    var firstNeighbourExitPortal = nextPortal.other;
                    var firstNeighbourExit = firstNeighbourExitPortal.exit;
                    var firstNeighbour = firstNeighbourExitPortal.hex;
                    var firstNeighbourNextPortal = firstNeighbour.portals[Hex.numBind(firstNeighbourExit + 1)];
                    if(firstNeighbourNextPortal.other != firstNeighbourNextPortal)  //  If this portal leads further
                    {
                        var secondNeighbourExitPortal = firstNeighbourNextPortal.other;
                        var secondNeighbourExit = secondNeighbourExitPortal.exit;
                        var secondNeighbour = secondNeighbourExitPortal.hex;
                        var secondNeighbourNextPortal = secondNeighbour.portals[Hex.numBind(secondNeighbourExit + 1)];
                        if(secondNeighbourNextPortal.other == secondNeighbourNextPortal)    // If this portal is a mirror
                        {
                            options.push({
                                other: secondNeighbour,
                                thatEntrance: secondNeighbourNextPortal.exit
                            });
                        }
                    }
                }
                var newLink = _.sample(options);
                if(newLink){
                    this.mirrors = _.without(this.mirrors, hex.portals[exit], newLink.other.portals[newLink.thatEntrance]);
                    hex.join(newLink.other, exit, newLink.thatEntrance);
                }
            }, this);
        }
    }
});