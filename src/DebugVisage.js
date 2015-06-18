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
        components = components || Object.keys(DebugVisage.drawFunctions);

        components.filter(function(c){
            return this.hasOwnProperty(c);
        }, this.actor);

        components.reduce(function(dbv, c){
            dbv[DebugVisage.drawFunctions[c]](context);
            return dbv;
        }, this);

        this.actor.transform2.children.map(function(a){
            a.debugVisage.draw(context);
        });
    }
});

Object.defineProperty(DebugVisage, 'drawFunctions', {
    value: {
        "transform2": "drawTransform2",
    }
});

Object.defineProperty(DebugVisage.prototype, 'drawTransform2', {
    value: function(con)
    {
        var transform = this.actor.transform2;

        con.push(transform);

        con.context.beginPath();
        con.context.moveTo(0,0);
        con.context.lineTo(1,0);
        con.context.lineTo(1,1);
        con.context.lineTo(0,1);
        con.context.lineTo(0,0);
        con.context.fillStyle = "rgba(0, 0, 255, 0.2)";
        con.context.fill();

        con.context.beginPath();
        con.context.moveTo(0,0);
        con.context.lineTo(1,0);
        con.context.strokeStyle = "rgba(255, 0, 0, 1.0)";
        con.context.lineWidth = 0.2;
        con.context.stroke();

        con.context.beginPath();
        con.context.moveTo(0,0);
        con.context.lineTo(0,1);
        con.context.strokeStyle = "rgba(0, 255, 0, 1.0)";
        con.context.lineWidth = 0.2;
        con.context.stroke();

        con.pop();
    }
});