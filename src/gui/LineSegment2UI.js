var Kinetic = require('kinetic');
var _ = require('underscore');

var Vector2 = require('../lib/Vector2').Vector2;

var LineSegment2UI = function(lineSegment, layer){
    this.layer = layer;
    this.lineSegment = lineSegment;

    this.group = new Kinetic.Group({
        x: 0,
        y: 0,
        draggable: true
    });
    this.circleA = LineSegment2UI.circleA(this);
    this.circleA.on('dragmove', this.onCircleADrag);
    this.circleB = LineSegment2UI.circleB(this);
    this.circleB.on('dragmove', this.onCircleBDrag);
    this.shapeLine = LineSegment2UI.shapeLine(this);
    this.group
        .on('dragmove', this.onGroupDrag)
        .on('dragend', this.onGroupDragEnd)
        .add(
            this.shapeLine,
            this.circleA,
            this.circleB
        );
    this.layer.add(this.group);
}

exports['LineSegment2UI'] = LineSegment2UI;

Object.defineProperties(LineSegment2UI.prototype, {
    onCircleADrag: {
        get: function(){
            return _.bind(LineSegment2UI.circleADrag, this);
        }
    },
    onCircleBDrag: {
        get: function(){
            return _.bind(LineSegment2UI.circleBDrag, this);
        }
    },
    onGroupDrag: {
        get: function(){
            return _.bind(LineSegment2UI.groupDrag, this);
        }
    },
    onGroupDragEnd: {
        get: function(){
            return _.bind(LineSegment2UI.groupDragEnd, this);
        }
    },
    setLineSegmentA: {
        value: function(){
            this.lineSegment.a = Vector2.fromObject(this.circleA.position()).add(Vector2.fromObject(this.group.position()));
        }
    },
    setLineSegmentB: {
        value: function(){
            this.lineSegment.b = Vector2.fromObject(this.circleA.position()).add(Vector2.fromObject(this.group.position()));
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
    circleADrag: {
        value: function(e){
            this.lineSegment.a = Vector2.fromObject(this.circleA.position());
        }
    },
    circleBDrag: {
        value: function(e){
            this.lineSegment.b = Vector2.fromObject(this.circleB.position());
        }
    },
    groupDrag: {
        value: function(e){
            var groupPosition = Vector2.fromObject(this.group.position());
            this.lineSegment.a = Vector2.fromObject(this.circleA.position()).add(groupPosition);
            this.lineSegment.b = Vector2.fromObject(this.circleB.position()).add(groupPosition);
            this.shapeLine.position(groupPosition.multiplyByScalar(-1));
        }
    },
    groupDragEnd: {
        value: function(e){
            this.circleA.position(this.lineSegment.a);
            this.circleB.position(this.lineSegment.b);
            this.group.position({x:0, y:0});
            this.shapeLine.position({x:0, y:0});
        }
    }
});
