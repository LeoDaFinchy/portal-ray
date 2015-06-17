var Transform2 = require("./Transform2.js").Transform2;

var Actor = function()
{
    id = Actor.id++;
};

exports["Actor"] = Actor;

Object.defineProperty(Actor, 'id', {
    value: 0,
    writable: true,
    configurable: false,
});

Object.defineProperty(Actor.prototype, 'giveTransform2', {
    value: function(){
        this.transform2 = new Transform2();
        this.transform2.actor = this;
    }
});