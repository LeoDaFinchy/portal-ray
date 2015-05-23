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
Vector2.prototype.clone = function()
{
    return new Vector2(this.x, this.y);
}
Vector2.prototype.rotation = function()
{
    var norm = this.normalise();
    return new Matrix2([norm.x, (1-norm.y), (1-norm.x), norm.y]);
}
Vector2.prototype.rotate = function(matrix){
    return matrix.rotateVector2(this);
}

Vector2.zero = function(){
    return new Vector2()
}
Vector2.unit = function(){
    return new Vector2(1,0)
}


var Matrix2 = function(initial){
    this.m = initial || [ 1, 0, 0, 1];
}
Matrix2.prototype.rotateVector2 = function(vector)
{
    return new Vector2((vector.x * this.m[0]) + (vector.y * this.m[1]), (vector.x * this.m[2]) + (vector.y * this.m[3]));
}
/** TODO Functions
    We need a function for rotating a Matrix by a Matrix i.e. A x B = M
    We need a function to find the difference'difference' rotation matrix to get from 
    one to another aka 'which matrix M satisfiess M x B = A
**/ 


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

    return new Raycast(
        x,
        ((x.x - this.origin.x) / this.direction.x) || ((x.y - this.origin.y) / this.direction.y),
        ((x.x - a.x) / lineSegment.offset().x) || ((x.y - a.y) / lineSegment.offset().y)
    );
}
Ray.fromLineSegment = function(lineSegment)
{
    return new Ray(lineSegment.a.clone(), lineSegment.b.normalise());
}


var Raycast = function(incidence, rayDistance, segmentFraction){
    this.incidence = incidence;
    this.rayDistance = rayDistance;
    this.segmentFraction = segmentFraction;
}


var Portal = function(a, b){
    this.a = a;
    this.b = b;
}

//  TODO Functions: Need functions for transforming rays.

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

var rotation = new Vector2(1,1).rotation();
var subject = new Vector2(2,1);

var subjectRotated = subject.rotate(rotation);

console.log("Rotating Vectors");
console.log(subject, subject.normalise())
console.log(rotation);
console.log(subjectRotated, subjectRotated.normalise());
