var Component = function(name, prereqs)
{
    this.prereqs = prereqs || [];
    this.name = name || "component";
};

exports["Component"] = Component;

Object.defineProperty(Component.prototype, "attach", {
    value: function(actor)
    {
        var needed = this.prereqs.filter(function(c){
            return this.components.indexOf(c.constructor) === -1;
        }, actor);
        if(needed.length > 0)
        {
            needed.reduce(function(c){
                console.log(c);
                c.attach(actor);
                return c;
            });
        }
        actor.components.push(this);
        actor[this.name] = this;
        this.actor = actor;

        return this;
    }
});
