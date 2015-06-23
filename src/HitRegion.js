var Component = require('./Component.js').Component;

var HitRegion = function(pattern){
    this.pattern = pattern;
};

exports["HitRegion"] = HitRegion;

HitRegion.prototype = new Component("hitRegion", ["transform2"]);

Object.defineProperty(HitRegion.prototype, 'clone', {
    get: function()
    {
        return new HitRegion(this.pattern);
    }
});

Object.defineProperty(HitRegion.prototype, '_', {
    get: function(){
        return this.clone;
    }
});

Object.defineProperty(HitRegion.prototype, 'detectHit', {
    value: function(context, coords, cascade)
    {
        if(cascade === undefined){cascade = true;}

        context.push(this.actor.transform2);

        this.pattern(context.context);

        var hit = context.context.isPointInPath(coords.x, coords.y);
        if(cascade){
            this.actor.transform2.children.filter(function(a){
                return a.hitRegion;
            }).map(function(a){
                hit = hit || a.hitRegion.detectHit(context, coords);
            });
        }
        
        context.pop();

        return hit;
    }
});
