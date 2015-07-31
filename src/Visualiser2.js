var _ = require('underscore')._;

var Visualiser2 = function(commands){
    this.commands = commands || [];
};

var Visualiser2Value = function(type, value)
{
    this._value = value;
    this.value = Visualiser2Value.fetchFunctions[type];
    this.type = type;
}

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
    value: {
        value: function(value)
        {
            return new Visualiser2Value(Visualiser2Value.types.VALUE, value);
        }
    },
    key: {
        value: function(key)
        {
            return new Visualiser2Value(Visualiser2Value.types.KEY, key);
        }
    },
    path: {
        value: function(path)
        {
            return new Visualiser2Value(Visualiser2Value.types.PATH, path)
        }
    },
    drawCircle: {
        value: function(subject, context, kwargs)
        {
            var pos = kwargs.position.value(subject);
            var radius = kwargs.radius.value(subject);

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
            var posA = kwargs.positionA.value(subject);
            var posB = kwargs.positionB.value(subject);

            context.strokeStyle = kwargs.lineColour;
            context.fillStyle = kwargs.fillColour;
            context.lineWidth = kwargs.lineWidth;

            context.beginPath();
            context.moveTo(posA.x, posA.y);
            context.lineTo(posB.x, posB.y);
            context.stroke();
        }
    },
    drawDots: {
        value: function(subject, context, kwargs)
        {
            var positions = kwargs.positions.value(subject);
            var radius = kwargs.radius.value(subject);

            context.strokeStyle = kwargs.lineColour;
            context.fillStyle = kwargs.fillColour;
            context.lineWidth = kwargs.lineWidth;

            _.each(positions, function(pos){
                context.beginPath();
                context.arc(pos.x, pos.y, radius, 0, Math.PI * 2.0);
                context.fill();
            })
        }
    },
    drawLinePath: {
        value: function(subject, context, kwargs)
        {
            var positions = kwargs.positions.value(subject);

            context.strokeStyle = kwargs.lineColour;
            context.fillStyle = kwargs.fillColour;
            context.lineWidth = kwargs.lineWidth;

            context.beginPath();
            context.moveTo(positions[0].x, positions[0].y);

            _.each(positions.slice(1), function(pos){
                context.lineTo(pos.x, pos.y);
            })
            context.stroke();
        }
    },
    drawPolygon: {
        value: function(subject, context, kwargs)
        {
            var positions = kwargs.positions.value(subject);

            context.strokeStyle = kwargs.lineColour;
            context.fillStyle = kwargs.fillColour;
            context.lineWidth = kwargs.lineWidth;

            context.beginPath();
            context.moveTo(positions[0].x, positions[0].y);

            _.each(positions.slice(1), function(pos){
                context.lineTo(pos.x, pos.y);
            })
            context.lineTo(positions[0].x, positions[0].y);
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
    },
    dots: {
        value: function(positions, radius, styleKWArgs)
        {
            return {
                name: "drawDots",
                kwargs: {
                    positions: positions ? positions : Visualiser2.value([Vector2.zero]),
                    radius: radius ? radius : Visualiser2.value(1),
                    lineWidth: styleKWArgs.lineWidth || 1,
                    lineColour: styleKWArgs.lineColour || '#000000',
                    fillColour: styleKWArgs.fillColour || '#ffffff'
                }
            };
        }
    },
    linePath: {
        value: function(positions, radius, styleKWArgs)
        {
            return {
                name: "drawLinePath",
                kwargs: {
                    positions: positions ? positions : Visualiser2.value([Vector2.zero, Vector2.one]),
                    lineWidth: styleKWArgs.lineWidth || 1,
                    lineColour: styleKWArgs.lineColour || '#000000',
                    fillColour: styleKWArgs.fillColour || '#ffffff'
                }
            };
        }
    },
    polygon: {
        value: function(positions, radius, styleKWArgs)
        {
            return {
                name: "drawPolygon",
                kwargs: {
                    positions: positions ? positions : Visualiser2.value([Vector2.zero, Vector2.one]),
                    lineWidth: styleKWArgs.lineWidth || 1,
                    lineColour: styleKWArgs.lineColour || '#000000',
                    fillColour: styleKWArgs.fillColour || '#ffffff'
                }
            };
        }
    }
});

Object.defineProperties(Visualiser2Value, {
    types: {
        value: {
            VALUE: 0,
            KEY: 1,
            PATH: 2
        }
    },
    fetchFunctions: {
        value: {
            0: function(subject){
                return this._value;
            },
            1: function(subject){
                return subject[this._value];
            },
            2: function(subject){
                var result = _.chain([subject]);
                _.each(this._value, function(x){
                    result.tap(
                        function(z)
                        {
                            if(_.isArray(z[0]))
                            {
                                result = result.map(function(y){return _.pluck(y, x);});
                            }
                            else
                            {
                                result = result.pluck(x);
                            }
                        }
                    );
                });
                return result.value()[0];
            }
        }
    }
});

