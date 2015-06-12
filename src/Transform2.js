var Matrix3 = require('./Matrix3.js').Matrix3;

var Transform2 = function(m)
{
    this.matrix = m || new Matrix3();
    this.parent = null;
    this.children = [];
};

exports['Transform2'] = Transform2;

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