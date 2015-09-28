var Kinetic = require('kinetic');
var _ = require('underscore');

var Geometry = require('geometry');
var Vector2 = Geometry.Vector2;
var LineSegment2 = Geometry.LineSegment2;
var Matrix3 = Geometry.Matrix3;

var offset = Vector2.unit.multiplyByScalar(3.0);

var corners = [
    offset,
    Matrix3.rotation(Math.PI * (1.0/3.0)).transformVector2(offset),
    Matrix3.rotation(Math.PI * (2.0/3.0)).transformVector2(offset),
    Matrix3.rotation(Math.PI).transformVector2(offset),
    Matrix3.rotation(Math.PI * (4.0/3.0)).transformVector2(offset),
    Matrix3.rotation(Math.PI * (5.0/3.0)).transformVector2(offset)
];

var edges = [
    new LineSegment2(corners[0], corners[1]),
    new LineSegment2(corners[1], corners[2]),
    new LineSegment2(corners[2], corners[3]),
    new LineSegment2(corners[3], corners[4]),
    new LineSegment2(corners[4], corners[5]),
    new LineSegment2(corners[5], corners[0]),
];

var HexUI = function(hex, layer, entrance, bounds){
    this.layer = layer;
    this.hex = hex;
    this.entrance = entrance;
    this.eye = Vector2.unit;
    this.bounds = bounds;
    this.vis = this.visibility();
    this.beyonds = [];

    this.group = new Kinetic.Group({
        x: 0,
        y: 0,
        draggable: true,
    });
    this.hexShape = HexUI.hexShape(this);
    this.visibilityShape = HexUI.visibilityShape(this, entrance);
    this.eyeShape = HexUI.eyeShape(this);
    this.exitShape = HexUI.exitShape(this, entrance);
    this.entranceShape = HexUI.entranceShape(this);
    this.entranceBoundsShape = HexUI.entranceBoundsShape(this);
    this.group.add(
        this.hexShape,
        this.visibilityShape,
        this.entranceShape,
        this.entranceBoundsShape,
        this.eyeShape
    );
    this.layer.add(this.group);
}

exports['HexUI'] = HexUI;

Object.defineProperties(HexUI.prototype, {
    draw: {
        value: function(){
            this.vis = this.visibility();
            this.group.draw();
            _.each(this.vis.bounds, function(bound, i){
                if(bound && !this.beyonds[i])
                {
                    if(this.hex.portals[i])
                    {
                        var hui = new HexUI(
                            this.hex.portals[i].hex, 
                            this.layer,
                            this.hex.portals[i].otherSide,
                            bound
                        );

                        this.beyonds[i] = hui;

                        var edge = HexUI.edges[i];
                        var targetPoint = edge.lerp(0.5).multiplyByScalar(2).add(Vector2.fromObject(this.group.position()));

                        hui.group.position(targetPoint);
                    }
                }
                if(!bound && this.beyonds[i])
                {
                    this.beyonds[i].group.destroy();
                    delete this.beyonds[i];
                }
                if(this.beyonds[i])
                {
                    this.beyonds[i].eye = this.eye._
                        .add(Vector2.fromObject(this.group.position()))
                        .subtract(Vector2.fromObject(this.beyonds[i].group.position()))
                        ;
                    var newBound = {lower: 1 - bound.upper, upper: 1 - bound.lower};
                    this.beyonds[i].bounds = newBound;
                    this.beyonds[i].draw();
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
})

Object.defineProperties(HexUI, {
    corners:{
        value: corners
    },
    edges:{
        value: edges
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
                    context.arc(eye.x, eye.y, 0.4, 0, Math.PI * 2);
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