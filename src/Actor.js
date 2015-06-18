var Transform2 = require("./Transform2.js").Transform2;

var Actor = function()
{
    this.id = Actor.id++;
    this.components = [];
};

exports["Actor"] = Actor;

Object.defineProperty(Actor, 'id', {
    value: 0,
    writable: true,
    configurable: false,
});

Object.defineProperty(Actor.prototype, 'clone', {
    get: function()
    {
        var clone = new Actor();
        clone.components = this.components.map(function(a){
            return a._.attach(this);
        }, clone);
        return clone;
    }
});
