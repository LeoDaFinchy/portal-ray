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

var spriteCanvas = $('<canvas width=400 height=300 style="border: 1px black solid">')[0];
var spriteContext = spriteCanvas.getContext('2d');
var spriteIter = new Vector2(0, 0);

if(window && document)
{   

    $('document').ready(function(){

        HexUI.initialise(30.0);

        $('body').append(spriteCanvas);
        applet = new Applet();
        applet.initialise(new Vector2(800,600));
        applet.addLayer("InertLayer");
        applet.addLayer("HexLayer");
        applet.addLayer("InteractiveLayer");
        applet.time = 0;
        function drawFuncFactory(instance){
            var hue = Math.random() * 360;
            var saturation = 30 + (Math.random() * 50);
            var luminosity = 30 + (Math.random() * 50);
            var circles = [];
            for(var i = 0; i < 16; i++)
            {
                circles.push({
                    h: hue + ((Math.random() * 40) - 20) % 360,
                    s: saturation + ((Math.random() * 40) - 20),
                    l: luminosity + ((Math.random() * 40) - 20),
                    x: ((i % 4) - 1.5) * 20,
                    y: (Math.floor(i / 4.0) - 1.5) * 20,
                });
            }
            circles = _.shuffle(circles);
            var context = spriteContext;
            context.save();
            context.translate(spriteIter.x, spriteIter.y);
            context.beginPath();
            context.moveTo(-40,-40);
            context.lineTo( 40,-40);
            context.lineTo( 40, 40);
            context.lineTo(-40, 40);
            context.lineTo(-40,-40);
            context.clip();
            for(var circ in circles)
            {
                c = circles[circ];
                context.strokeStyle = 'hsl('+c.h+','+c.s+'%,'+(c.l-20)+'%)';
                context.lineWidth = 2;
                context.fillStyle = 'hsl('+c.h+','+c.s+'%,'+c.l+'%)';
                context.beginPath();
                context.arc(c.x, c.y, 15, 0, Math.PI*2);
                context.fill();
                context.stroke();
            }
            context.restore();
            function drawFunc(kineticContext){
                var context = kineticContext._context;
                context.drawImage(spriteCanvas, instance.drawFunc.pos.x, instance.drawFunc.pos.y, 80, 80, -40, -40, 80, 80);
            }

            var returnValue = {pos: spriteIter._, func: drawFunc}

            spriteIter.add(new Vector2(80, 0));

            return returnValue;
        }
        spriteContext.translate(40, 40);
        applet.hex = new Hex(null);
        applet.hex.drawFunc = drawFuncFactory(applet.hex);
        applet.hex2 = new Hex(null);
        applet.hex2.drawFunc = drawFuncFactory(applet.hex2);

        applet.hex.join(applet.hex2, 0, 3);
        applet.hex.join(applet.hex2, 3, 1);

        applet.eye = new Vector2(Math.sin(applet.time / 50.0) * 10, Math.cos(applet.time / 50.0) * 10);
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
        applet.hUI.draw(Vector2.zero, 300);

        applet.eye = new Vector2(Math.sin(applet.time / 50.0) * 15, Math.cos(applet.time / 50.0) * 15);
        applet.eyePoint.position(applet.eye);

        applet.time++;
        window.setTimeout(draw, 10);
    };
}
