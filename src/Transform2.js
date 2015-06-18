var Matrix3 = require('./Matrix3.js').Matrix3;
var Component = require('./Component.js').Component;

var Transform2 = function(m)
{
    this.matrix = m || new Matrix3();
    this.parent = null;
    this.children = [];
};

exports['Transform2'] = Transform2;

Transform2.prototype = new Component("transform2");

Object.defineProperty(Transform2, 'cloneable', {
    value: true
});

Object.defineProperty(Transform2.prototype, 'clone', {
    get: function()
    {
        var clone = new Transform2(this.matrix._);
        clone.children = this.children.map(function(i){return i._;});
        clone.parent = this.parent;
        return clone;
    }
});

Object.defineProperty(Transform2.prototype, '_', {
    get: function(){
        return this.clone;
    }
});

Object.defineProperty(Transform2.prototype, 'applyContextTransform', {
    value: function(context){
        context.save();
        context.transform(
            this.matrix.m[0],
            this.matrix.m[3],
            this.matrix.m[1],
            this.matrix.m[4],
            this.matrix.m[2],
            this.matrix.m[5]
        );
    }
});

Object.defineProperty(Transform2.prototype, 'drawEdit', {
    value: function(context, mouse){
        this.applyContextTransform(context);

        context.beginPath();
        context.arc(0, 0, 1, 0, Math.PI * 2);
        if(context.isPointInPath(mouse.coords.x, mouse.coords.y))
        {
            if(context.isPointInPath(mouse.oldCoords.x, mouse.oldCoords.y))
            {
                // Stay
                var colours = [
                    "rgba(0, 0, 0, 0.5)",
                    "rgba(255, 0, 0, 0.5)",
                    "rgba(0, 255, 0, 0.5)",
                    "rgba(255, 255, 0, 0.5)",
                    "rgba(0, 0, 255, 0.5)",
                    "rgba(255, 0, 255, 0.5)",
                    "rgba(0, 255, 255, 0.5)",
                    "rgba(255, 255, 255, 0.5)",
                ];

                context.fillStyle = colours[mouse.buttons];
            }
            else
            {
                context.fillStyle = "rgba(255, 0, 0, 1.0)";
            }
        }
        else
        {
            if(context.isPointInPath(mouse.oldCoords.x, mouse.oldCoords.y))
            {
                context.fillStyle = "rgba(0, 255, 255, 1.0)";
            }
            else
            {
                // Just not here
                context.fillStyle = "rgba(0, 0, 0, 0.2)";
            }
        }
        context.fill();

        for(var i = 0; i < this.children.length; i++)
        {
            this.children[i].drawEdit(context, mouse);
        }

        this.releaseContextTransform(context);
    }
});

Object.defineProperty(Transform2.prototype, 'releaseContextTransform', {
    value: function(context){
        context.restore();
    }
});

Object.defineProperty(Transform2.prototype, 'drawDebug', {
    value: function(context){
        this.applyContextTransform(context);

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

        for(var i = 0; i < this.children.length; i++)
        {
            this.children[i].drawDebug(context);
        }

        this.releaseContextTransform(context);
    }
});
