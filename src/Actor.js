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
