var _ = require('underscore')._;

var Visualiser2 = function(commands){
    this.commands = commands || [];
};

exports['Visualiser2'] = Visualiser2;

var Vector2 = require('./Vector2').Vector2;

Object.defineProperties(Visualiser2.prototype,{
    draw: {
        value: function (subject, context) {
            _.each(this.commands, function(command){
                Visualiser2[command.name](subject, context, command.kwargs);
            });
        }
    }
});

Object.defineProperties(Visualiser2, {
    fetch: {
        value: function(subject, key)
        {
            return key.subject ? subject[key.value] : key.value;
        }
    },
    value: {
        value: function(value)
        {
            return {subject: false, value: value};
        }
    },
    key: {
        value: function(key)
        {
            return {subject: true, value: key};
        }
    },
    drawCircle: {
        value: function(subject, context, kwargs)
        {
            var pos = this.fetch(subject, kwargs.position);
            var radius = this.fetch(subject, kwargs.radius);

            context.strokeStyle = kwargs.lineColour;
            context.fillStyle = kwargs.fillColour;
            context.lineWidth = kwargs.lineWidth;

            context.beginPath();

            context.arc(pos.x, pos.y, radius, 0, Math.PI * 2.0);
            context.fill();
            context.stroke();
        }
    },
    circle: {
        value: function(position, radius, styleKWArgs)
        {
            return {
                name: "drawCircle",
                kwargs: {
                    position: position ? position : Visualiser2.value(Vector2.zero),
                    radius: radius ? radius : Visualiser2.value(5),
                    lineWidth: styleKWArgs.lineWidth || 1,
                    lineColour: styleKWArgs.lineColour || '#000000',
                    fillColour: styleKWArgs.fillColour || '#ffffff'
                }
            };
        }
    }
});