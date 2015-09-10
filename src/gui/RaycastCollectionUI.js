var Kinetic = require('kinetic');
var _ = require('underscore');

var Geometry = require('geometry');
var Vector2 = Geometry.Vector2;

var RaycastCollectionUI = function(intersects, layer){
    this.layer = layer;

    Object.defineProperty(this, 'intersects', {
        get: function(){return intersects}
    })
    this.intersects = intersects;

    this.group = new Kinetic.Group({
        x: 0,
        y: 0,
    });
    this.shapeRayPath = RaycastCollectionUI.shapeRayPath(this);
    this.shapeRayStart = RaycastCollectionUI.shapeRayStart(this);
    this.shapeRayFraction = RaycastCollectionUI.shapeRayFraction(this);
    this.group
        .add(
            this.shapeRayStart,
            this.shapeRayPath,
            this.shapeRayFraction
        );
    this.layer.add(this.group);
}

exports['RaycastCollectionUI'] = RaycastCollectionUI;

Object.defineProperties(RaycastCollectionUI, {
    shapeRayPath: {
        value: function(instance){
            return new Kinetic.Shape({
                strokeWidth: 0.1,
                stroke: 'darkcyan',
                listening: false,
                drawFunc: function(context){
                    _.each(instance.intersects(), function(intersect){
                        if(intersect.x)
                        {
                            context.beginPath();
                            context.moveTo(intersect.a.a.x, intersect.a.a.y);
                            dist = intersect.a.offset._.multiplyByScalar(intersect.fractionA).add(intersect.a.a);
                            context.lineTo(dist.x, dist.y);
                            context.strokeShape(instance.shapeRayPath);
                        }
                    });
                },
            });
        }
    },
    shapeRayStart: {
        value: function(instance){
            return new Kinetic.Shape({
                strokeWidth: 0.1,
                stroke: 'limegreen',
                listening: false,
                drawFunc: function(context){
                    _.each(instance.intersects(), function(intersect){
                        if(intersect.x)
                        {
                            context.beginPath();
                            context.arc(intersect.x.x, intersect.x.y, 0.2, 0, Math.PI * 2);
                            context.strokeShape(instance.shapeRayStart);
                        }
                    });
                },
            });
        }
    },
    shapeRayFraction: {
        value: function(instance){
            return new Kinetic.Shape({
                strokeWidth: 0.1,
                stroke: 'yellow',
                listening: false,
                drawFunc: function(context){
                    _.each(instance.intersects(), function(intersect){
                        if(intersect.x)
                        {
                            context.beginPath();
                            context.moveTo(intersect.b.a.x, intersect.b.a.y);
                            portion = intersect.b.offset.multiplyByScalar(intersect.fractionB).add(intersect.b.a);
                            context.lineTo(portion.x, portion.y);
                            context.strokeShape(instance.shapeRayFraction);
                        }
                    });
                },
            });
        }
    },
});
