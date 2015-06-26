Vector2 = require("./Vector2").Vector2;

var Raycast = function(incidence, rayDistance, segmentFraction, ray, segment){
    this.incidence = incidence;
    this.rayDistance = rayDistance;
    this.segmentFraction = segmentFraction;
    this.ray = ray;
    this.segment = segment;
};

exports["Raycast"] = Raycast;
Ray = require("./Ray.js").Ray;

Raycast.prototype.isForward = function()
{
    return this.rayDistance > 0.0;
}

Raycast.prototype.isInBounds = function()
{
    return this.segmentFraction >= 0.0 && this.segmentFraction <= 1.0;
}

Raycast.prototype.isHit = function()
{
    return this.isForward() && this.isInBounds();
}

Raycast.prototype.againstNormal = function()
{
    return Vector2.crossProductMagnitude(this.ray.direction, this.segment.offset()) < 0.0;
}

Raycast.prototype.isHittingFront = function()
{
    return this.isHit() && this.againstNormal();
}

Raycast.prototype.portalExitRay = function()
{
    var thisSide = this.segment;
    var otherSide = thisSide.portal;
    var exitDirection = this.ray.direction._
        .tangent
        .rotate(thisSide.normal().rotation().inverse)
        .rotate(otherSide.normal().rotation())
        .rotate(new Vector2(-1,0).rotation());
    var exitPosition = otherSide.a._
        .add(otherSide.offset().multiplyByScalar(1.0 - this.segmentFraction))
        .add(exitDirection.multiplyByScalar(0.1));
    var exitRay = new Ray(
        exitPosition,
        exitDirection
    );
    return exitRay;
}