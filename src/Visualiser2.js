var _ = require('underscore')._;

var Visualiser2 = function(commands){
    this.commands = commands || [];
};

exports['Visualiser2'] = Visualiser2;

var Vector2 = require('./Vector2').Vector2;

Object.defineProperties(Visualiser2.prototype,{
    draw: {
        value: function (subject, context, hitPoint) {
            if(hitPoint)
            {
                var hits = _.map(this.commands, function(command){
                    Visualiser2[command.name](subject, context, command.kwargs);
                    return context.isPointInPath(hitPoint.x, hitPoint.y);
                });
                return _.some(hits);
            }
            else
            {
                _.each(this.commands, function(command){
                    Visualiser2[command.name](subject, context, command.kwargs);
                });
            }
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
    drawLine: {
        value: function(subject, context, kwargs)
        {
            var posA = this.fetch(subject, kwargs.positionA);
            var posB = this.fetch(subject, kwargs.positionB);

            context.strokeStyle = kwargs.lineColour;
            context.fillStyle = kwargs.fillColour;
            context.lineWidth = kwargs.lineWidth;

            context.beginPath();
            context.moveTo(posA.x, posA.y);
            context.lineTo(posB.x, posB.y);
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
    },
    line: {
        value: function(positionA, positionB, styleKWArgs)
        {
            return {
                name: "drawLine",
                kwargs: {
                    positionA: positionA ? positionA : Visualiser2.value(Vector2.zero),
                    positionB: positionB ? positionB : Visualiser2.value(Vector2.unit),
                    lineWidth: styleKWArgs.lineWidth || 1,
                    lineColour: styleKWArgs.lineColour || '#000000',
                    fillColour: styleKWArgs.fillColour || '#ffffff'
                }
            };
        }
    }
});