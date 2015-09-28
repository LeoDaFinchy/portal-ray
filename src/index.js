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

var Hex = require('./engine/Hex').Hex;
var Applet = require('./engine/Applet').Applet;

var HexUI = require("./gui/HexUI").HexUI;
var applet;

if(window && document)
{   

    $('document').ready(function(){
        applet = new Applet();
        applet.initialise(new Vector2(800,600));
        applet.addLayer("InertLayer");
        applet.addLayer("HexLayer");
        applet.addLayer("InteractiveLayer");
        applet.hex = new Hex();
        applet.hex2 = new Hex();
        applet.hex3 = new Hex();
        applet.hex4 = new Hex();

        applet.hex.portals[1] = {
            otherSide: 4,
            hex: applet.hex2,
        }
        applet.hex2.portals[1] = {
            otherSide: 4,
            hex: applet.hex3,
        }
        applet.hex2.portals[0] = {
            otherSide: 3,
            hex: applet.hex4,
        }
        applet.hex4.portals[2] = {
            otherSide: 5,
            hex: applet.hex3,
        }

        applet.eye = new Kinetic.Circle({
            x: 0.0,
            y: 0.0,
            radius: 0.3,
            draggable: true,
            stroke: 'black',
            strokeWidth: 0.1,
            fill: 'green'
        })

        applet.entrance = 0;

        applet.namedLayers["InteractiveLayer"].add(applet.eye);
        applet.eye.on("dragmove", function(e){
            _.each(applet.hUIs, function(x){
                x.eye = Vector2.fromObject(applet.eye.position())
                    .subtract(Vector2.fromObject(x.group.position()))
            })
        });

        applet.hUIs = [
            new HexUI(applet.hex, applet.namedLayers.HexLayer, null, {lower: 0, upper: 1}),
        ];

        var CanvasSize = new Vector2(800, 600);
        var GraphSize = new Vector2(40, 30);
        var Scaling = new Vector2(CanvasSize.x / GraphSize.x, -CanvasSize.y / GraphSize.y);

        applet.stage.scale(Scaling);
        applet.stage.offset(GraphSize.multiplyByVector2(new Vector2(-0.5, 0.5)));

        window.setTimeout(draw, 10);
    });

    function draw(){
        applet.stage.clear();
        applet.namedLayers.InertLayer.draw();
        applet.namedLayers.InteractiveLayer.draw();
        _.each(applet.hUIs, function(x){x.draw();});

        window.setTimeout(draw, 10);
    };
}
