var Component = require('./Component.js').Component;

var DebugVisage = function(){};

exports["DebugVisage"] = DebugVisage;

DebugVisage.prototype = new Component("debugVisage", ["transform2"]);

Object.defineProperty(DebugVisage.prototype, 'clone', {
    get: function()
    {
        return new DebugVisage();
    }
});

Object.defineProperty(DebugVisage.prototype, '_', {
    get: function(){
        return this.clone;
    }
});

Object.defineProperty(DebugVisage.prototype, 'draw', {
    value: function(context, components)
    {
        components = components || DebugVisage.drawFunctions.keys();

        components.filter(function(c){
            return this.hasOwnProperty(c);
        }, this.actor);

        components.reduce(function(dbv, c){
            dbv[DebugVisage.drawFunctions[c]](context);
            return dbv;
        }, this);

        this.actor.transform2.children.map(function(a){
            a.draw(context);
        });
    }
});

Object.defineProperty(DebugVisage, 'drawFunctions', {
    value: {
        "transform2": "drawTransform2",
    }
});

Object.defineProperty(DebugVisage.prototype, 'drawTransform2', {
    value: function(context)
    {
        var transform = this.actor.transform2;

        transform.applyContextTransform(context);

        context.beginPath();
        context.moveTo(0,0);
        context.lineTo(1,0);
        context.lineTo(1,1);
        context.lineTo(0,1);
        context.lineTo(0,0);
        context.fillStyle = "rgba(0, 0, 255, 0.2)";
        context.fill();

        context.beginPath();
        context.moveTo(0,0);
        context.lineTo(1,0);
        context.strokeStyle = "rgba(255, 0, 0, 1.0)";
        context.lineWidth = 0.2;
        context.stroke();

        context.beginPath();
        context.moveTo(0,0);
        context.lineTo(0,1);
        context.strokeStyle = "rgba(0, 255, 0, 1.0)";
        context.lineWidth = 0.2;
        context.stroke();

        transform.releaseContextTransform(context);
    }
});