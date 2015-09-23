var Beam = function(a, b)
{
    this.a = a;
    this.b = b;
};

exports['Beam'] = Beam;

var Geometry = require('geometry');
var Intersect2 = Geometry.Intersect2;

Object.defineProperties(Beam.prototype, {
    crossPoint: {
        get: function(){
            return new Intersect2(this.a, this.b).solve().x;
        }
    },
    intersect:{
        value: function(targets){
            return targets.map(function(value){
                return new BeamLineSegmentIntersect(this, value);
            }, this);
        }
    },
});

var BeamLineSegmentIntersect = function(beam, lineSegment)
{
    this.beam = beam;
    this.lineSegment = lineSegment;
    this.a = new Intersect2(this.beam.a, this.lineSegment);
    this.b = new Intersect2(this.beam.b, this.lineSegment);
}

Object.defineProperties(BeamLineSegmentIntersect.prototype, {
    solve: {
        value: function(){
            this.a.solve();
            this.b.solve();
            return this;
        }
    }
});