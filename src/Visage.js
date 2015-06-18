var Component = require('./Component.js').Component;

var Visage = function(pattern){
    this.pattern = pattern;
};

exports["Visage"] = Visage;

Visage.prototype = new Component("visage", ["transform2"]);

Object.defineProperty(Visage.prototype, 'clone', {
    get: function()
    {
        return new Visage(this.pattern);
    }
});

Object.defineProperty(Visage.prototype, '_', {
    get: function(){
        return this.clone;
    }
});

Object.defineProperty(Visage.prototype, 'draw', {
    value: function(context)
    {
        context.push(this.actor.transform2);

        this.pattern(context.context);

        this.actor.transform2.children.filter(function(a){
            return a.visage;
        }).map(function(a){
            a.visage.draw(context);
        });

        context.pop();
    }
});
