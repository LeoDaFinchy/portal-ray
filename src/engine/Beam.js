var Beam = function(a, b)
{
    this.a = a;
    this.b = b;
};

exports['Beam'] = Beam;

var Intersect2 = require('../lib/Intersect2').Intersect2;

Object.defineProperties(Beam.prototype, {
    crossPoint: {
        get: function(){
            return new Intersect2(this.a, this.b).x;
        }
    }
});
