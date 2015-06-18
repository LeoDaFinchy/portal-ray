var Component = function(prereqs)
{
    this.prereqs = prereqs || [];
    this.name = "component";
};

exports["Component"] = Component;

Object.defineProperty(Component.prototype, "attach", {
    value: function(actor)
    {
        var needed = this.prereqs.filter(function(c){
            return this.components.indexOf(c.constructor) === -1;
        }, actor);
        needed.reduce(function(c){
            c.attach(actor);
        }, undefined);
        actor.components.push(this);
        actor[this.name] = this;
    }
});
