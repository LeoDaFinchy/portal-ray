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

var HexUI = require("./gui/HexUI").HexUI;
var applet;

var spriteCanvas = $('<canvas width=400 height=300 style="border: 1px black solid">')[0];
var spriteContext = spriteCanvas.getContext('2d');
var spriteIter = new Vector2(0, 0);

if(window && document)
{   

    $('document').ready(function(){

        HexUI.initialise(50.0);

        $('body').append(spriteCanvas);
        applet = new Applet();
        applet.initialise(new Vector2(800,600));
        applet.addLayer("InertLayer");
        applet.addLayer("HexLayer");
        applet.addLayer("InteractiveLayer");
        applet.time = 0;
        applet.terrainTiles = new TerrainTiles(spriteContext, new Vector2(100, 100))
        spriteContext.translate(50, 50);
        applet.hex = new Hex(applet.terrainTiles.newTile([
            TerrainTiles.drawFuncs.variedColourCircles(new Vector2(100, 100)),
            TerrainTiles.drawFuncs.text("0", 48)
        ]));
        applet.hex2 = new Hex(applet.terrainTiles.newTile([
            TerrainTiles.drawFuncs.variedColourCircles(new Vector2(100, 100)),
            TerrainTiles.drawFuncs.text("1", 48)
        ]));
        applet.hex3 = new Hex(applet.terrainTiles.newTile([
            TerrainTiles.drawFuncs.variedColourCircles(new Vector2(100, 100)),
            TerrainTiles.drawFuncs.text("2", 48)
        ]));
        applet.hex4 = new Hex(applet.terrainTiles.newTile([
            TerrainTiles.drawFuncs.variedColourCircles(new Vector2(100, 100)),
            TerrainTiles.drawFuncs.text("3", 48)
        ]));

        /**
               4
            3     5
            2     0
               1
        **/


        applet.hex.join(applet.hex2, 0, 3);
        applet.hex.join(applet.hex2, 3, 1);
        applet.hex.join(applet.hex3, 4, 1);
        applet.hex.join(applet.hex4, 5, 2);
        applet.hex3.join(applet.hex4, 0, 3);
        applet.hex3.join(applet.hex2, 2, 0);
        applet.hex4.join(applet.hex2, 1, 4);
        applet.hex.join(applet.hex4, 1, 4);
        applet.hex.join(applet.hex3, 2, 5);
        applet.hex2.join(applet.hex4, 2, 5);
        applet.hex3.join(applet.hex4, 4, 0);
        applet.hex3.join(applet.hex2, 3, 5);

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

        applet.hUI = new HexUI(applet, applet.hex, applet.namedLayers.HexLayer, null, {lower: 0, upper: 1});

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
