var Kinetic = require('kinetic');
var _ = require('underscore');

var Vector2 = require('../lib/Vector2').Vector2;

var RayUI = function(ray, layer){
    this.layer = layer;
    this.ray = ray;

    this.group = new Kinetic.Group({
        x: 0,
        y: 0,
        draggable: true
    });
    this.circleA = RayUI.circleA(this);
    this.circleA.on('dragmove', _.bind(this.export, this));
    this.circleB = RayUI.circleB(this);
    this.circleB.on('dragmove', _.bind(this.export, this));
    this.shapeLine = RayUI.shapeLine(this);
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

exports['RayUI'] = RayUI;

Object.defineProperties(RayUI.prototype, {
    onGroupDrag: {
        get: function(){
            return _.bind(RayUI.groupDrag, this);
        }
    },
    export: {
        value: function(){
            var groupPosition = Vector2.fromObject(this.group.position());
            this.ray.a = Vector2.fromObject(this.circleA.position()).add(groupPosition);
            this.ray.b = Vector2.fromObject(this.circleB.position()).add(groupPosition);
        }
    },
    import: {
        value: function(){
            this.circleA.position(this.ray.a);
            this.circleB.position(this.ray.b);
            this.group.position({x:0, y:0});
            this.shapeLine.position({x:0, y:0});
        }
    }
})

Object.defineProperties(RayUI, {
    circleA: {
        value: function(instance){
            return new Kinetic.Circle({
                x: instance.ray.a.x,
                y: instance.ray.a.y,
                radius: 0.3,
                strokeWidth: 0.2,
                stroke: "goldenrod",
                fill: "yellow",
                draggable: true,
            });
        }
    },
    circleB: {
        value: function(instance){
            return new Kinetic.Circle({
                x: instance.ray.b.x,
                y: instance.ray.b.y,
                radius: 0.2,
                strokeWidth: 0.1,
                stroke: "goldenrod",
                fill: "goldenrod",
                draggable: true,
            });
        }
    },
    shapeLine: {
        value: function(instance){
            return new Kinetic.Shape({
                strokeWidth: 0.3,
                stroke: 'goldenrod',
                drawFunc: function(context){
                    context.beginPath();
                    context.moveTo(instance.ray.b.x, instance.ray.b.y);
                    context.lineTo(instance.ray.a.x, instance.ray.a.y);
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
