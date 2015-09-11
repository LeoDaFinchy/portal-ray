var Kinetic = require('kinetic');
var _ = require('underscore');

var Geometry = require('geometry');
var Vector2 = Geometry.Vector2;

var BeamcastCollectionUI = function(intersects, layer){
    this.layer = layer;

    Object.defineProperty(this, 'intersects', {
        get: function(){return intersects}
    })
    this.intersects = intersects;

    this.group = new Kinetic.Group({
        x: 0,
        y: 0,
    });
    this.shapeBeamPath = BeamcastCollectionUI.shapeBeamPath(this);
    this.group
        .add(
            this.shapeBeamPath
        );
    this.layer.add(this.group);
}

exports['BeamcastCollectionUI'] = BeamcastCollectionUI;

Object.defineProperties(BeamcastCollectionUI, {
    shapeBeamPath: {
        value: function(instance){
            return new Kinetic.Shape({
                strokeWidth: 0.1,
                stroke: 'goldenrod',
                fill: 'rgba(204, 153, 51, 0.2)',
                listening: false,
                drawFunc: function(context){
                    console.log(instance.intersects())
                    _.each(instance.intersects(), function(intersect){
                        if(intersect.a.x || intersect.b.x)
                        {
                            context.beginPath();
                            context.moveTo(intersect.a.a.a.x, intersect.a.a.a.y);
                            context.lineTo(intersect.a.x.x, intersect.a.x.y);
                            context.lineTo(intersect.b.x.x, intersect.b.x.y);
                            context.lineTo(intersect.b.a.a.x, intersect.b.a.a.y);
                            context.lineTo(intersect.a.a.a.x, intersect.a.a.a.y);
                            context.fillStrokeShape(instance.shapeBeamPath);
                        }
                    });
                },
            });
        }
    },
});
