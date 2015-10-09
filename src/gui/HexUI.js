var Kinetic = require('kinetic');
var _ = require('underscore');

var Geometry = require('geometry');
var Vector2 = Geometry.Vector2;
var LineSegment2 = Geometry.LineSegment2;
var Matrix3 = Geometry.Matrix3;

var offset = Vector2.unit.multiplyByScalar(30.0);
var sixth = Math.PI / 3.0;

var HexUI = function(applet, hex, layer, entrance, bounds){
    this.layer = layer;
    this.group = new Kinetic.Group({
        x: 0,
        y: 0,
        draggable: true,
    });
    this.applet = applet;
    this.hex = hex;
    this.entrance = entrance;
    this.bounds = bounds;
    this.beyonds = [];
    this.rotation = 0;

    this.eye = this.applet.eye._.subtract(Vector2.fromObject(this.group.position()));


    this.vis = this.visibility();


    this.hexShape = HexUI.hexShape(this);
    // this.visibilityShape = HexUI.visibilityShape(this, entrance);
    this.eyeShape = HexUI.eyeShape(this);
    // this.exitShape = HexUI.exitShape(this, entrance);
    // this.entranceShape = HexUI.entranceShape(this);
    // this.entranceBoundsShape = HexUI.entranceBoundsShape(this);
    this.clipShape = HexUI.clipShape(this);
    this.group.add(
        this.hexShape,
        // this.visibilityShape,
        // this.entranceShape,
        // this.entranceBoundsShape,
        this.eyeShape,
        this.clipShape
    );
    this.layer.add(this.group);
}

exports['HexUI'] = HexUI;

Object.defineProperties(HexUI.prototype, {
    draw: {
        value: function(origin, range){
            this.eye = HexUI.rotMats[HexUI.numBind(-this.rotation)].rotateVector2(this.applet.eye._.subtract(this.position));
            this.vis = this.visibility();
            this.group.draw();

            _.each(this.vis.bounds, function(bound, i){
                if(bound)
                {
                    // console.log(this.beyonds);
                    if(!this.beyonds[i] && this.hex.portals[i])
                    {
                        var edge = HexUI.edges[i];
                        var targetPoint = this.matrix.inverse.rotateVector2(edge.lerp(0.5).multiplyByScalar(2)).add(Vector2.fromObject(this.group.position()));

                        if(Vector2.displacement(targetPoint, origin).length <= range)
                        {
                            var hui = new HexUI(
                                this.applet,
                                this.hex.portals[i].other.hex, 
                                this.layer,
                                this.hex.portals[i].other.exit,
                                bound
                            );

                            this.beyonds[i] = hui;

                            var rotation = (i - this.hex.portals[i].other.exit + 3) % 6;
                            hui.rotation = rotation + this.rotation
                            hui.group.position(targetPoint);
                            hui.group.rotation(hui.rotation * 60);
                        }
                    }
                    if(this.beyonds[i])
                    {
                        var rotation = (i - this.hex.portals[i].other.exit + 3) % 6;

                        var newBound = {lower: 1 - bound.upper, upper: 1 - bound.lower};
                        this.beyonds[i].bounds = newBound;
                        this.beyonds[i].draw(origin, range);
                    }
                }
            }, this);
        }
    },
    visibility: {
        value: function(){
            var entrance = HexUI.edges[this.entrance];
            if(this.entrance == null){entrance = HexUI.edges[0];}
            var leftEntry = entrance.lerp(this.bounds.lower);
            var rightEntry = entrance.lerp(this.bounds.upper);
            var left = new LineSegment2(leftEntry, Vector2.lerp(this.eye, leftEntry, 1.2));
            var right = new LineSegment2(rightEntry, Vector2.lerp(this.eye, rightEntry, 1.2));

            var leftX = _.map(left.intersect(HexUI.edges), function(x){return x.solve();});
            var rightX = _.map(right.intersect(HexUI.edges), function(x){return x.solve();});

            _.each(leftX, function(x){
                if(x.x){
                    if(x.fractionB < 0)
                    {
                        x.fractionB = 0;
                        x.x = x.b.a;
                    }
                    if(x.fractionB > 1)
                    {
                        x.fractionB = 1;
                        x.x = x.b.b;
                    }
                }
            });

            _.each(rightX, function(x){
                if(x.x){
                    if(x.fractionB < 0)
                    {
                        x.fractionB = 0;
                        x.x = x.b.a;
                    }
                    if(x.fractionB > 1)
                    {
                        x.fractionB = 1;
                        x.x = x.b.b;
                    }
                }
            });

            leftX = _.rotate(leftX, this.entrance);
            rightX = _.rotate(rightX, this.entrance);

            var patch = [
                leftEntry,
                rightEntry
            ];

            var bounds = [null];

            if(this.entrance == null)
            {
                patch.push(leftX[1].b.b);
                patch.push(leftX[2].b.b);
                patch.push(leftX[3].b.b);
                patch.push(leftX[4].b.b);
                bounds = [
                    {lower: 0, upper:1},
                    {lower: 0, upper:1},
                    {lower: 0, upper:1},
                    {lower: 0, upper:1},
                    {lower: 0, upper:1},
                    {lower: 0, upper:1},
                ];
            }
            else if(leftX[5].angle > 0 && rightX[1].angle > 0 && leftX[0].angle < 0 && rightX[0].angle < 0)
            {
                patch.push(leftX[1].b.b);
                patch.push(leftX[2].b.b);
                patch.push(leftX[3].b.b);
                patch.push(leftX[4].b.b);
                bounds.push({lower: 0, upper:1});
                bounds.push({lower: 0, upper:1});
                bounds.push({lower: 0, upper:1});
                bounds.push({lower: 0, upper:1});
                bounds.push({lower: 0, upper:1});
            }
            else
            {
                for(var i = 1; i < 6; i++)
                {
                    var left = leftX[i];
                    var right = rightX[i];
                    if((left.fractionB > right.fractionB) && (left.angle > 0) && (right.angle > 0))
                    {
                        patch.push(right.x);
                        patch.push(left.x);
                        bounds.push({lower: right.fractionB, upper: left.fractionB});
                        continue;
                    }
                    if((right.angle <= 0) && (left.angle > 0) && (left.fractionB > 0)){
                        patch.push(left.x);
                        bounds.push({lower: 0, upper: left.fractionB});
                        continue;
                    }
                    if((left.angle <= 0) && (right.angle > 0) && (right.fractionB < 1)){
                        patch.push(right.x);
                        bounds.push({lower: right.fractionB, upper: 1});
                        continue
                    }
                    bounds.push(null);
                }
            }

            patch.push(leftEntry);

            bounds = _.rotate(bounds, -this.entrance);

            return {
                patch: patch,
                left: left,
                right: right,
                bounds: bounds,
                beam: [
                    this.eye,
                    leftEntry,
                    rightEntry
                ]
            }
        }
    },
    matrix: {
        get: function(){
            var m = this.group.getTransform().m;
            return new Matrix3([m[0], m[1], m[4], m[2], m[3], m[5], 0, 0, 1]);
        }
    },
    position: {
        get: function(){
            return this.group.position();
        },
        set: function(vector){
            this.group.position(vector);
        }
    },
    rotation: {
        get: function(){
            return this._rotation;
        },
        set: function(rotation){
            this._rotation = rotation;
            this.group.rotation(this._rotation * 60);
        }
    },
})

Object.defineProperties(HexUI, {
    initialise:{
        value: function(hexRadius){
            this.hexRad = hexRadius;
            this.hexDia = this.hexRad * 2;
            this.offset = Vector2.unit.multiplyByScalar(this.hexRad);
            this.turns = [
                0,
                this.turn,
                this.turn * 2,
                this.turn * 3,
                this.turn * 4,
                this.turn * 5,
            ];
            this.rotMats = [
                Matrix3.rotation(this.turns[0]),
                Matrix3.rotation(this.turns[1]),
                Matrix3.rotation(this.turns[2]),
                Matrix3.rotation(this.turns[3]),
                Matrix3.rotation(this.turns[4]),
                Matrix3.rotation(this.turns[5]),
            ];
            this.corners = [
                this.rotMats[0].rotateVector2(this.offset),
                this.rotMats[1].rotateVector2(this.offset),
                this.rotMats[2].rotateVector2(this.offset),
                this.rotMats[3].rotateVector2(this.offset),
                this.rotMats[4].rotateVector2(this.offset),
                this.rotMats[5].rotateVector2(this.offset),
            ];
            this.edges = [
                new LineSegment2(this.corners[0], this.corners[1]),
                new LineSegment2(this.corners[1], this.corners[2]),
                new LineSegment2(this.corners[2], this.corners[3]),
                new LineSegment2(this.corners[3], this.corners[4]),
                new LineSegment2(this.corners[4], this.corners[5]),
                new LineSegment2(this.corners[5], this.corners[0]),
            ];
            this.neighbourPoints = [
                this.edges[0].lerp(0.5).multiplyByScalar(2.0),
                this.edges[1].lerp(0.5).multiplyByScalar(2.0),
                this.edges[2].lerp(0.5).multiplyByScalar(2.0),
                this.edges[3].lerp(0.5).multiplyByScalar(2.0),
                this.edges[4].lerp(0.5).multiplyByScalar(2.0),
                this.edges[5].lerp(0.5).multiplyByScalar(2.0),
            ];

            this.ready = true;
        }
    },
    turn: {
        value: Math.PI / 3.0
    },
    numBind: {
        value: function(input){
            var remainder = input % 6;
            return remainder >= 0 ? remainder : remainder + 6;
        }
    },
    ready: {
        value: false
    },
    hexShape: {
        value: function(instance){
            return new Kinetic.Shape({
            fill: 'rgba(255,0,0,0.2)',
                drawFunc: function(context){
                    context.beginPath();
                    context.moveTo(HexUI.corners[0].x, HexUI.corners[0].y);
                    context.lineTo(HexUI.corners[1].x, HexUI.corners[1].y);
                    context.lineTo(HexUI.corners[2].x, HexUI.corners[2].y);
                    context.lineTo(HexUI.corners[3].x, HexUI.corners[3].y);
                    context.lineTo(HexUI.corners[4].x, HexUI.corners[4].y);
                    context.lineTo(HexUI.corners[5].x, HexUI.corners[5].y);
                    context.lineTo(HexUI.corners[0].x, HexUI.corners[0].y);
                    context.fillShape(this);
                }
            });
        },
    },
    clipShape: {
        value: function(instance){
            return new Kinetic.Shape({
                stroke: 'red',
                strokeWidth: 0.1,
                fill: 'green',
                drawFunc: function(context){
                    var vis = instance.vis;
                    context.beginPath();
                    context.moveTo(vis.patch[0].x, vis.patch[0].y);
                    for(var i = 0; i < vis.patch.length; i++)
                    {
                        context.lineTo(vis.patch[i].x, vis.patch[i].y);
                    }
                    context.save();
                    context.clip();
                    if(instance.hex.drawFunc)
                    {
                        instance.hex.drawFunc.func(context);
                    }
                    context.restore();
                }
            });
        },
    },
    exitShape: {
        value: function(instance, entrance){
            return new Kinetic.Shape({
                stroke: 'black',
                fill: 'yellow',
                lineJoin: 'bevel',
                strokeWidth: 0.1,
                drawFunc: function(context){
                    var vis = instance.vis;
                    for(var i = 0; i < vis.bounds.length; i++)
                    {
                        var bounds = vis.bounds[i];
                        var edge = HexUI.edges[i];
                        if(bounds)
                        {
                            var lowerPoint = edge.lerp(bounds.lower);
                            var upperPoint = edge.lerp(bounds.upper);
                            var lowerOutPoint = Vector2.lerp(instance.eye, lowerPoint, 1.2);
                            var upperOutPoint = Vector2.lerp(instance.eye, upperPoint, 1.2);;
                            context.beginPath();
                            context.moveTo(lowerPoint.x, lowerPoint.y);
                            context.lineTo(upperPoint.x, upperPoint.y);
                            context.lineTo(upperOutPoint.x, upperOutPoint.y);
                            context.lineTo(lowerOutPoint.x, lowerOutPoint.y);
                            context.lineTo(lowerPoint.x, lowerPoint.y);
                            context.fillStrokeShape(this);
                        }
                    }
                }
            });
        }
    },
    visibilityShape: {
        value: function(instance, entrance){
            return new Kinetic.Shape({
                fill: 'yellow',
                stroke: 'black',
                lineJoin: 'bevel',
                strokeWidth: 0.1,
                drawFunc: function(context){
                    var vis = instance.vis;
                    context.beginPath();
                    context.moveTo(vis.patch[0].x, vis.patch[0].y);
                    for(var i = 0; i < vis.patch.length; i++)
                    {
                        context.lineTo(vis.patch[i].x, vis.patch[i].y);
                    }
                    context.fillStrokeShape(this);
                }
            })
        }
    },
    eyeShape: {
        value: function(instance){
            return new Kinetic.Shape({
                fill: 'blue',
                stroke: 'blue',
                strokeWidth: 0.1,
                drawFunc: function(context){
                    var eye = instance.eye;
                    context.beginPath();
                    context.moveTo(0, 0);
                    context.arc(eye.x, eye.y, 1, 0, Math.PI * 2);
                    context.fillStrokeShape(this);
                }
            });
        }
    },
    entranceShape: {
        value: function(instance){
            return new Kinetic.Shape({
                stroke: 'cyan',
                strokeWidth: 0.2,
                drawFunc: function(context){
                    var entrance = HexUI.edges[instance.entrance];
                    if(instance.entrance == null){entrance = HexUI.edges[0];}
                    context.beginPath();
                    context.moveTo(entrance.a.x, entrance.a.y);
                    context.lineTo(entrance.b.x, entrance.b.y);
                    context.strokeShape(this);
                }
            });
        }
    },
    entranceBoundsShape: {
        value: function(instance){
            return new Kinetic.Shape({
                stroke: 'red',
                strokeWidth: 0.3,
                drawFunc: function(context){
                    var entrance = HexUI.edges[instance.entrance];
                    if(instance.entrance == null){entrance = HexUI.edges[0];}
                    var leftEntry = entrance.lerp(instance.bounds.lower);
                    var rightEntry = entrance.lerp(instance.bounds.upper);
                    context.beginPath();
                    context.moveTo(leftEntry.x, leftEntry.y);
                    context.lineTo(rightEntry.x, rightEntry.y);
                    context.strokeShape(this);
                }
            });
        }
    }
});
