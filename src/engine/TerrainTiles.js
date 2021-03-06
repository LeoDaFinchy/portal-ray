var _ = require('underscore');
var $ = require('jquery');

var Geometry = require('geometry');
var Vector2 = Geometry.Vector2;

function TerrainTiles(size, tiles){
    this.canvas = $('<canvas width=' + (size.x * tiles) + ' height=' + size.y + ' style="border: 1px black solid">')[0];
    this.context = this.canvas.getContext('2d');
    this.context.translate(size.x / 2.0, size.y / 2.0);
    this.tileSize = size;
    this.position = new Vector2();
    this.library = {

    }
}

function TerrainTile(position, size, canvas){
    this.id = TerrainTile.id++;
    this.position = position;
    this.size = size;
    this.bounds = position._.add(size);
    this.canvas = canvas;
    this.drawFunc = TerrainTile.drawFunc(canvas, position, size);
}

exports.TerrainTiles = TerrainTiles;
exports.TerrainTile = TerrainTile;

Object.defineProperties(TerrainTiles.prototype, {
    newTile: {
        value: function(drawFuncs){
            this.context.save();

            this.prepareCanvasTile();

            _.each(drawFuncs, function drawFromDrawFunc(x){
                x(this.context);
            }, this);

            this.context.restore();

            var returnValue = new TerrainTile(this.position._, this.tileSize._, this.context.canvas);
            this.library[returnValue.id] = returnValue;

            this.position.x += this.tileSize.x;

            return returnValue;
        }
    },
    prepareCanvasTile: {
        value: function(){
            var halfSize = this.tileSize._.multiplyByScalar(0.5);
            this.context.translate(this.position.x, this.position.y);
            this.context.beginPath();
            this.context.moveTo(-halfSize.x, -halfSize.y);
            this.context.lineTo( halfSize.x, -halfSize.y);
            this.context.lineTo( halfSize.x,  halfSize.y);
            this.context.lineTo(-halfSize.x,  halfSize.y);
            this.context.lineTo(-halfSize.x, -halfSize.y);
            this.context.clip();
        }
    },
});

Object.defineProperties(TerrainTiles, {
    drawFuncs: {
        value: {
            variedColourCircles: function(size){
                return function variedColourCirclesDrawFunc(context){
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
                            x: ((i % 4) - 1.5) * (size.x / 4.0),
                            y: (Math.floor(i / 4.0) - 1.5) * (size.y / 4.0),
                        });
                    }
                    circles = _.shuffle(circles);
                    for(var circ in circles)
                    {
                        c = circles[circ];
                        context.strokeStyle = 'hsl('+c.h+','+c.s+'%,'+(c.l-20)+'%)';
                        context.lineWidth = 2;
                        context.fillStyle = 'hsl('+c.h+','+c.s+'%,'+c.l+'%)';
                        context.beginPath();
                        context.arc(c.x, c.y, (size.x / 4.0) - 5.0, 0, Math.PI*2);
                        context.fill();
                        context.stroke();
                    }
                }
            },
            text: function(text, size){
                return function textDrawFunc(context){
                    context.font = size + "px serif";
                    context.fillStyle = "black";
                    context.strokeStyle = "lightgrey";
                    context.lineWidth = 3.0;
                    context.strokeText(text, 0, size * 0.5);
                    context.fillText(text, 0, size * 0.5);
                }
            }
        }
    }
})

Object.defineProperties(TerrainTile, {
    id: {
        value: 0,
        writable: true
    },
    drawFunc: {
        value: function(canvas, position, size){
            return function drawFunc(context){
                context.drawImage(canvas, position.x, position.y, size.x, size.y, size.x * -0.5, size.y * -0.5, size.x, size.y);
            }
        }
    }
})