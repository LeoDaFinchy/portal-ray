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

var TileView = require('./gui/TileView');
var TileGridView = TileView.TileGridView;

var HexUI = require("./gui/HexUI").HexUI;
var applet;

if(window && document)
{   

    $('document').ready(function(){

        HexUI.initialise(50.0);

        applet = new Applet();
        window.applet = applet;
        applet.initialise(new Vector2(800,600));
        applet.addLayer("InertLayer");
        applet.addLayer("HexLayer");
        applet.addLayer("ViewLayer");
        applet.addLayer("InteractiveLayer");
        applet.time = 0;
        applet.terrainTiles = new TerrainTiles(new Vector2(100, 100), 100);
        $('body').append(applet.terrainTiles.canvas);
        applet.hexGrid = new HexGrid(applet, applet.terrainTiles);
        for(var i = 1; i < 100; i++)
        {
            applet.hexGrid.newTileThroughTheLookingGlass();
        }

        applet.eye = new Vector2(Math.sin(applet.time / 30.0) * 10, Math.cos(applet.time / 30.0) * 10);
        applet.eyePoint = new Kinetic.Circle({
            radius: 5,
            draggable: true,
            stroke: 'black',
            strokeWidth: 2,
            fill: 'cyan'
        })

        applet.entrance = 0;
        applet.viewAxes = Vector2.zero;
        applet.keyStates = {}

        Object.defineProperties(applet.keyStates, {
            up: {
                get: function(){return this[38];}
            },
            down: {
                get: function(){return this[40];}
            },
            left: {
                get: function(){return this[37];}
            },
            right: {
                get: function(){return this[39];}
            }
        });

        $('body').on('keydown', function keyDown(e){
            applet.keyStates[e.keyCode] = true;
        }).on('keyup', function keyUp(e){
            applet.keyStates[e.keyCode] = false;
        });

        applet.namedLayers["InteractiveLayer"].add(applet.eyePoint);

        applet.hUI = new HexUI(applet, applet.hexGrid.seedHex, applet.namedLayers.HexLayer, null, {lower: 0, upper: 1});

        var CanvasSize = new Vector2(800, 600);
        var GraphSize = new Vector2(40, 30);
        var Scaling = new Vector2(CanvasSize.x / GraphSize.x, -CanvasSize.y / GraphSize.y);

        applet.stage.offset(new Vector2(-400, -300));

        TileGridView.initialise(50.0);
        applet.tileGridView = new TileGridView(applet, applet.namedLayers.ViewLayer.canvas._canvas.getContext("2d"), new LineSegment2(new Vector2(100, 100), new Vector2(700, 500)));

        window.setTimeout(draw, 10);
    });

    function draw(){
        applet.stage.clear();
        applet.namedLayers.InertLayer.draw();
        applet.namedLayers.InteractiveLayer.draw();
        // applet.hUI.draw(Vector2.zero, 320);


        applet.viewAxes.x = Math.max(-1.0, Math.min(1.0, applet.viewAxes.x + (applet.keyStates.right ? 0.1 : 0.0) + (applet.keyStates.left ? -0.1 : 0.0)));
        applet.viewAxes.y = Math.max(-1.0, Math.min(1.0, applet.viewAxes.y + (applet.keyStates.down ? 0.1 : 0.0) + (applet.keyStates.up ? -0.1 : 0.0)));

        applet.viewAxes.multiplyByScalar(0.95);
        if(applet.viewAxes.length <= 0.09){applet.viewAxes = Vector2.zero;}

        applet.eye.add(applet.viewAxes);

        for(var i = 0; i < 6; i++){
            if(new Intersect2(new LineSegment2(applet.eye, HexUI.edges[i].lerp(0.5)), HexUI.edges[i]).solve().angle < 0){
                var p = Hex.numBind(i - applet.hUI.rotation)

                var msg = "Hex " + applet.hUI.hex.id +
                    " exit " + applet.hUI.hex.portals[p].exit +
                    " to exit " + applet.hUI.hex.portals[p].other.exit +
                    " of Hex " + applet.hUI.hex.portals[p].other.hex.id +
                    ", back to exit " + applet.hUI.hex.portals[p].other.other.exit +
                    " of Hex " + applet.hUI.hex.portals[p].other.other.hex.id +
                    "(exit " + applet.hexGrid.hexes[applet.hUI.hex.portals[p].other.hex.id].portals[applet.hUI.hex.portals[p].other.exit].other.exit + 
                    " of Hex " + applet.hexGrid.hexes[applet.hUI.hex.portals[p].other.hex.id].portals[applet.hUI.hex.portals[p].other.exit].other.hex.id + ")";

                if(applet.hexGrid.hexes[applet.hUI.hex.portals[p].other.hex.id].portals[applet.hUI.hex.portals[p].other.exit].other.hex.id != applet.hUI.hex.id)
                {
                    console.warn(msg);
                }
                else
                {
                    console.log(msg);
                }
                if(applet.hUI.hex.portals[p] == applet.hUI.hex.portals[p].other)
                {
                    applet.hUI.rotation += 3;
                }
                else
                {
                    applet.hUI.rotation = applet.hUI.beyonds[i].rotation;
                }
                applet.hUI.hex = applet.hUI.hex.portals[p].other.hex;
                applet.eye.add(HexUI.edges[Hex.numBind(i + 3)].b._.subtract(HexUI.edges[i].a));
            }
        }

        applet.namedLayers.HexLayer.position(applet.eye._.multiplyByScalar(-1));
        applet.tileGridView.draw();

        applet.time++;
        window.setTimeout(draw, 10);
    };
}
