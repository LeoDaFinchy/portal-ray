var _ = require('underscore')._;
var $ = require('jquery');
var Kinetic = require('kinetic');

_.mixin({
    rotate: function(array, amount){
        if(!amount){return array};
        if(amount > 0)
        {
            var removed = array.splice(0, amount);
            return array.concat(removed);
        }
        else
        {
            var removed = array.splice(array.length + amount, -amount);
            return removed.concat(array);
        }
    }
});

var Geometry = require('geometry');
var Vector2 = Geometry.Vector2;
var Matrix2 = Geometry.Matrix2;
var Matrix3 = Geometry.Matrix3;
var Intersect2 = Geometry.Intersect2;
var LineSegment2 = Geometry.LineSegment2;

var TerrainTiles_mod = require('./engine/TerrainTiles');
var TerrainTiles = TerrainTiles_mod.TerrainTiles;

var Hex = require('./engine/Hex').Hex;
var Applet = require('./engine/Applet').Applet;

var HexGrid = require('./engine/HexGrid').HexGrid;

var HexUI = require("./gui/HexUI").HexUI;
var applet;

if(window && document)
{   

    $('document').ready(function(){

        HexUI.initialise(50.0);

        applet = new Applet();
        applet.initialise(new Vector2(800,600));
        applet.addLayer("InertLayer");
        applet.addLayer("HexLayer");
        applet.addLayer("InteractiveLayer");
        applet.time = 0;
        applet.terrainTiles = new TerrainTiles(new Vector2(100, 100), 12);
        $('body').append(applet.terrainTiles.canvas);
        applet.hexGrid = new HexGrid(applet, applet.terrainTiles);
        applet.hexGrid.newTileThroughTheLookingGlass();
        applet.hexGrid.newTileThroughTheLookingGlass();
        applet.hexGrid.newTileThroughTheLookingGlass();
        applet.hexGrid.newTileThroughTheLookingGlass();
        applet.hexGrid.newTileThroughTheLookingGlass();
        applet.hexGrid.newTileThroughTheLookingGlass();
        applet.hexGrid.newTileThroughTheLookingGlass();
        applet.hexGrid.newTileThroughTheLookingGlass();

        applet.eye = new Vector2(Math.sin(applet.time / 30.0) * 10, Math.cos(applet.time / 30.0) * 10);
        applet.eyePoint = new Kinetic.Circle({
            radius: 5,
            draggable: true,
            stroke: 'black',
            strokeWidth: 2,
            fill: 'cyan'
        })

        applet.entrance = 0;

        applet.namedLayers["InteractiveLayer"].add(applet.eyePoint);

        applet.hUI = new HexUI(applet, applet.hexGrid.seedHex, applet.namedLayers.HexLayer, null, {lower: 0, upper: 1});

        var CanvasSize = new Vector2(800, 600);
        var GraphSize = new Vector2(40, 30);
        var Scaling = new Vector2(CanvasSize.x / GraphSize.x, -CanvasSize.y / GraphSize.y);

        applet.stage.offset(new Vector2(-400, -300));

        window.setTimeout(draw, 10);
    });

    function draw(){
        applet.stage.clear();
        applet.namedLayers.InertLayer.draw();
        applet.namedLayers.InteractiveLayer.draw();
        applet.hUI.draw(Vector2.zero, 320);

        applet.eye = new Vector2(Math.sin(applet.time / 50.0) * 15, Math.cos(applet.time / 50.0) * 15);
        applet.eyePoint.position(applet.eye);

        applet.time++;
        window.setTimeout(draw, 10);
    };
}
