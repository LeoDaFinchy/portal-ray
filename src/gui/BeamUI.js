var Kinetic = require('kinetic');
var _ = require('underscore');

var Vector2 = require('../lib/Vector2').Vector2;

var BeamUI = function(beam, layer){
    this.layer = layer;
    this.beam = beam;

    this.group = new Kinetic.Group({
        x: 0,
        y: 0,
    });
    this.shapeArea = BeamUI.shapeArea(this);
    this.group
        .add(
            this.shapeArea
        );
    this.layer.add(this.group);
}

exports['BeamUI'] = BeamUI;

Object.defineProperties(BeamUI, {
    shapeArea: {
        value: function(instance){
            return new Kinetic.Shape({
                strokeWidth: 0.1,
                stroke: 'orange',
                fill: 'rgba(204, 153, 51, 0.2)',
                drawFunc: function(context){
                    context.beginPath();
                    context.moveTo(instance.beam.a.a.x, instance.beam.a.a.y);
                    context.lineTo(instance.beam.a.b.x, instance.beam.a.b.y);
                    context.lineTo(instance.beam.b.b.x, instance.beam.b.b.y);
                    context.lineTo(instance.beam.b.a.x, instance.beam.b.a.y);
                    context.lineTo(instance.beam.a.a.x, instance.beam.a.a.y);
                    context.fillStrokeShape(this);
                },
            });
        }
    },
});
