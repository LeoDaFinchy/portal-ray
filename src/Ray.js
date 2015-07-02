Vector2 = require("./Vector2").Vector2;
Matrix3 = require("./Matrix3").Matrix3;

var Ray = function(origin, direction){
    this.origin = origin || new Vector2();
    this.direction = direction ? direction.tangent : new Vector2(1.0, 0.0);
    this.matrix = Matrix3.translation(this.origin).rotate(Math.atan2(this.direction.y, this.direction.x));
    // console.log(this.matrix);
};

exports['Ray'] = Ray;
Raycast = require("./Raycast.js").Raycast;

Ray.prototype.forward = function(distance){
    return this.origin._.add(this.direction);
}
Ray.prototype.castAgainstLineSegment = function(lineSegment){
    a = lineSegment.a;
    b = lineSegment.b;
    c = this.origin;
    d = this.forward(1.0);

    x = new Vector2(
        (
            (
                (
                    ((a.x*b.y)-(a.y*b.x)) * (c.x-d.x)) -
                    ((a.x-b.x) * ((c.x*d.y)-(c.y*d.x))
                )
            )/(
                (((a.x-b.x)*(c.y-d.y)) - ((a.y-b.y)*(c.x-d.x))))
        ),(
            (
                (
                    ((a.x*b.y)-(a.y*b.x)) * (c.y-d.y)) -
                    ((a.y-b.y) * ((c.x*d.y)-(c.y*d.x))
                )
            )/(
                (((a.x-b.x)*(c.y-d.y)) - ((a.y-b.y)*(c.x-d.x)))
            )
        )
    );

    this.matrix.inverse.applyMatrix3(lineSegment.matrix);

    var offset = lineSegment.offset;
    var segmentFraction = offset.x > offset.y?
        ((x.x - a.x) / lineSegment.offset.x):
        ((x.y - a.y) / lineSegment.offset.y);

    return new Raycast(
        x,
        ((x.x - this.origin.x) / this.direction.x) || ((x.y - this.origin.y) / this.direction.y),
        segmentFraction,
        this,
        lineSegment
    );
}

Ray.prototype.castAgainstLineSegments = function(lineSegments)
{
    return lineSegments.map(function(segment){
        return this.castAgainstLineSegment(segment);
    }, this);
}

Ray.prototype.findNearestHitOnSegments = function(lineSegments)
{
    return this.castAgainstLineSegments(lineSegments).filter(function(raycast){
        return raycast.isHit();
    }).reduce(function(prev, current){
        if(!prev){return current};
        if(current.rayDistance < prev.rayDistance){
            return current;
        }else{return prev;}
    }, undefined);
}

Ray.fromLineSegment = function(lineSegment)
{
    return new Ray(lineSegment.a._, lineSegment.b.tangent);
}