var Kinetic = require('kinetic');
var _ = require('underscore');

var Geometry = require('geometry');
var Vector2 = Geometry.Vector2;

var LineSegment2UI = function(lineSegment, layer){
    this.layer = layer;
    this.lineSegment = lineSegment;

    this.group = new Kinetic.Group({
        x: 0,
        y: 0,
        draggable: true
    });
    this.circleA = LineSegment2UI.circleA(this);
    this.circleA.on('dragmove', _.bind(this.export, this));
    this.circleB = LineSegment2UI.circleB(this);
    this.circleB.on('dragmove', _.bind(this.export, this));
    this.shapeLine = LineSegment2UI.shapeLine(this);
    this.group
        .on('dragmove', this.onGroupDrag)
        .on('dragmove', _.bind(this.export, this))
        .on('dragend', _.bind(this.import, this))
        .add(
            this.shapeLine,
            this.circleA,
            this.circleB
        );
    this.layer.add(this.group);
}

exports['LineSegment2UI'] = LineSegment2UI;

Object.defineProperties(LineSegment2UI.prototype, {
    onGroupDrag: {
        get: function(){
            return _.bind(LineSegment2UI.groupDrag, this);
        }
    },
    export: {
        value: function(){
            var groupPosition = Vector2.fromObject(this.group.position());
            this.lineSegment.a = Vector2.fromObject(this.circleA.position()).add(groupPosition);
            this.lineSegment.b = Vector2.fromObject(this.circleB.position()).add(groupPosition);
        }
    },
    import: {
        value: function(){
            this.circleA.position(this.lineSegment.a);
            this.circleB.position(this.lineSegment.b);
            this.group.position({x:0, y:0});
            this.shapeLine.position({x:0, y:0});
        }
    }
})

Object.defineProperties(LineSegment2UI, {
    circleA: {
        value: function(instance){
            return new Kinetic.Circle({
                x: instance.lineSegment.a.x,
                y: instance.lineSegment.a.y,
                radius: 0.2,
                strokeWidth: 0.3,
                stroke: "orange",
                draggable: true,
            });
        }
    },
    circleB: {
        value: function(instance){
            return new Kinetic.Circle({
                x: instance.lineSegment.b.x,
                y: instance.lineSegment.b.y,
                radius: 0.2,
                strokeWidth: 0.3,
                stroke: "cyan",
                draggable: true,
            });
        }
    },
    shapeLine: {
        value: function(instance){
            return new Kinetic.Shape({
                strokeWidth: 0.4,
                stroke: 'black',
                drawFunc: function(context){
                    context.beginPath();
                    context.moveTo(instance.lineSegment.b.x, instance.lineSegment.b.y);
                    context.lineTo(instance.lineSegment.a.x, instance.lineSegment.a.y);
                    context.lineTo(instance.lineSegment.normalPoint.x, instance.lineSegment.normalPoint.y);
                    context.strokeShape(this);
                },
            });
        }
    },
    groupDrag: {
        value: function(e){
            this.shapeLine.position(Vector2.fromObject(this.group.position()).multiplyByScalar(-1));
        }
    },
});
