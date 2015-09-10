var Kinetic = require('kinetic');
var _ = require('underscore');

var Geometry = require('geometry');
var Vector2 = Geometry.Vector2;

var PortalUI = function(portal, layer){
    this.layer = layer;
    this.portal = portal;

    this.group = new Kinetic.Group({
        x: 0,
        y: 0,
    });
    this.shapeArea = PortalUI.shapeArea(this);
    this.group
        .add(
            this.shapeArea
        );
    this.layer.add(this.group);
}

exports['PortalUI'] = PortalUI;

Object.defineProperties(PortalUI, {
    shapeArea: {
        value: function(instance){
            return new Kinetic.Shape({
                strokeWidth: 0.1,
                stroke: 'blue',
                fill: 'rgba(51, 51, 255, 0.1)',
                drawFunc: function(context){
                    context.beginPath();
                    context.moveTo(instance.portal.a.a.x, instance.portal.a.a.y);
                    context.lineTo(instance.portal.a.b.x, instance.portal.a.b.y);
                    context.lineTo(instance.portal.b.a.x, instance.portal.b.a.y);
                    context.lineTo(instance.portal.b.b.x, instance.portal.b.b.y);
                    context.lineTo(instance.portal.a.a.x, instance.portal.a.a.y);
                    context.fillStrokeShape(this);
                },
            });
        }
    },
});
