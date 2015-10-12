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
            this.joinFlatlyAdjacentEdges(newTile);
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
                console.info(
                    prevPortal,
                    "Hex " + prevPortal.hex.id,
                    "Exit " + prevPortal.exit,
                    "Entrance " + prevPortal.other.exit,
                    "Hex " + prevPortal.other.hex.id);
                if(prevPortal.other != prevPortal)  //  If this portal isn't a mirror
                {
                    var firstNeighbourExitPortal = prevPortal.other;
                    var firstNeighbourExit = firstNeighbourExitPortal.exit;
                    var firstNeighbour = firstNeighbourExitPortal.hex;
                    var firstNeighbourPrevPortal = firstNeighbour.portals[Hex.numBind(firstNeighbourExit - 1)];
                    console.warn(
                        firstNeighbourPrevPortal,
                        "Hex " + firstNeighbourPrevPortal.hex.id,
                        "Exit " + firstNeighbourPrevPortal.exit,
                        "Entrance " + firstNeighbourPrevPortal.other.exit,
                        "Hex " + firstNeighbourPrevPortal.other.hex.id);
                    if(firstNeighbourPrevPortal.other != firstNeighbourPrevPortal)  //  If this portal leads further
                    {
                        var secondNeighbourExitPortal = firstNeighbourPrevPortal.other;
                        var secondNeighbourExit = secondNeighbourExitPortal.exit;
                        var secondNeighbour = secondNeighbourExitPortal.hex;
                        var secondNeighbourPrevPortal = secondNeighbour.portals[Hex.numBind(secondNeighbourExit - 1)];
                        console.error(
                            secondNeighbourPrevPortal,
                            "Hex " + secondNeighbourPrevPortal.hex.id,
                            "Exit " + secondNeighbourPrevPortal.exit,
                            "Entrance " + secondNeighbourPrevPortal.other.exit,
                            "Hex " + secondNeighbourPrevPortal.other.hex.id);
                        if(secondNeighbourPrevPortal.other == secondNeighbourPrevPortal)    // If this portal is a mirror
                        {
                            console.error("option")
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
                        var secondNeighbourExit = firstNeighbourExitPortal.exit;
                        var secondNeighbour = firstNeighbourExitPortal.hex;
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
                    hex.join(newLink.other, exit, newLink.thatEntrance);
                }
            }, this);
        }
    }
});