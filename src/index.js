var Vector2 = function(x,y){
    this.x = x || 0.0;
    this.y = y || 0.0;
}
Vector2.prototype.add = function(other){
    return new Vector2(this.x + other.x, this.y + other.y);
}
Vector2.prototype.substract = function(other){
    return new Vector2(this.x - other.x, this.y - other.y);
}
Vector2.prototype.multiply = function(scale){
    return new Vector2(this.x * scale, this.y * scale);
}
Vector2.prototype.length = function(){
    return Math.sqrt(Math.pow(this.x, 2.0) + Math.pow(this.y, 2.0));
}
Vector2.prototype.normalise = function(){
    return this.multiply(1.0 / this.length());
}

var LineSegment = function(a, b){
    this.a = a || new Vector2();
    this.b = b || new Vector2();
}
LineSegment.prototype.offset = function(){
    return this.b.substract(this.a);
}

var Ray = function(origin, direction){
    this.origin = origin || new Vector2();
    this.direction = direction ? direction.normalise() : new Vector2(1.0, 0.0);
}
Ray.prototype.forward = function(distance){
    return this.origin.add(this.direction);
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

    return new Raycast(x,
        ((x.x - this.origin.x) / this.direction.x) || ((x.y - this.origin.y) / this.direction.y),
        ((x.x - a.x) / lineSegment.offset().x) || ((x.y - a.y) / lineSegment.offset().y)
    );
}

var Raycast = function(incidence, rayDistance, segmentFraction){
    this.incidence = incidence;
    this.rayDistance = rayDistance;
    this.segmentFraction = segmentFraction;
}

var vectorA = new Vector2(-2, 5);
var vectorB = new Vector2(8, 0);
var lineSegmentA = new LineSegment(vectorA, vectorB);

vectorX = new Vector2(0, 1);
vectorC = new Vector2(-1, 1);
var rayA = new Ray(vectorX, vectorC);

console.log(lineSegmentA);
console.log(lineSegmentA.offset());
console.log(rayA);

console.log(rayA.castAgainstLineSegment(lineSegmentA));
