var Vector2 = function(x,y){
    this.x = x || 0.0;
    this.y = y || 0.0;
}

Vector2.prototype.add = function(other){
    return new Vector2(this.x + other.x, this.y + other.y);
}
Vector2.prototype.subtract = function(other){
    return new Vector2(this.x - other.x, this.y - other.y);
}
Vector2.prototype.multiply = function(scale){
    return new Vector2(this.x * scale, this.y * scale);
}
Vector2.prototype.scale = function(scale){
    return new Vector2(this.x * scale.x, this.y * scale.y);
}
Vector2.prototype.reciprocal = function()
{
    return new Vector2(1.0 / this.x, 1.0 / this.y);
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
    return this.b.subtract(this.a);
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
        ((x.x - a.x) / lineSegment.offset().x) || ((x.y - a.y) / lineSegment.offset().y),
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

Ray.fromLineSegment = function(lineSegment)
{
    return new Ray(lineSegment.a.clone(), lineSegment.b.normalise());
}


var Raycast = function(incidence, rayDistance, segmentFraction, ray, segment){
    this.incidence = incidence;
    this.rayDistance = rayDistance;
    this.segmentFraction = segmentFraction;
    this.ray = ray;
    this.segment = segment;
}


var Portal = function(a, b){
    //  clear up any prexisting links
    if(a.portal){
        delete(a.portal.portal)
    }
    if(b.portal){
        delete(b.portal.portal)
    }
    a.portal = b;
    b.portal = a;
}

//  TODO Functions: Need functions for transforming rays.

var vectorA = new Vector2(-2, 5);
var vectorB = new Vector2(8, 0);
var lineSegmentA = new LineSegment(vectorA, vectorB);
var lineSegmentB = new LineSegment(new Vector2(-8.0, -8.0), new Vector2(10.0, -5.0));

var lineSegments = [
    new LineSegment(new Vector2(-2.0, 10.0), new Vector2(12.0, 0.0)),
    new LineSegment(new Vector2(-8.0,-8.0), new Vector2(10.0, -5.0))
];

var rays = [
    new Ray(new Vector2(0.0, 1.0)),
    new Ray(new Vector2(-5.0, 3.0))
]

if(window && document)
{
    var CanvasSize = new Vector2(800, 600);
    var GraphSize = new Vector2(40, 30);
    var Scaling = new Vector2(CanvasSize.x / GraphSize.x, -CanvasSize.y / GraphSize.y)

    window.onload = function(){
        window.PortalRay = {};
        canvas = document.getElementById('canvas');
        context = canvas.getContext("2d");
        context.scale(Scaling.x, Scaling.y);
        context.translate(GraphSize.x / 2.0, -GraphSize.y / 2.0);

        canvas.onmousemove = mouseMoved;

        window.PortalRay = {
            canvas: canvas,
            context: context
        }

        Object.defineProperty(window.PortalRay, 'raycasts', {
            get: function()
            {
                var rayCasts = [];
                for(var x = 0; x < rays.length; x++)
                {
                    for(var y = 0; y < lineSegments.length; y++)
                    {
                        rayCasts.push(rays[x].castAgainstLineSegment(lineSegments[y]));
                    }
                }
                return rayCasts;
            }
        });

        Object.defineProperty(window.PortalRay, 'rayHits', {
            get: function()
            {
                return this.raycasts.filter(function(raycast){
                    return (raycast.rayDistance > 0.0) &&
                        (raycast.segmentFraction >= 0.0) &&
                        (raycast.segmentFraction <= 1.0)
                })
            }
        })

        window.setTimeout(draw, 100);
    };

    function mouseMoved(e){
        var graphSpaceMouse = new Vector2(e.offsetX, e.offsetY).scale(Scaling.reciprocal()).subtract(GraphSize.scale(new Vector2(0.5,-0.5)));
        for(var x = 0; x < rays.length; x++)
        {
            rays[x].direction = graphSpaceMouse.subtract(rays[x].origin)
        }
    };

    function draw(){
        context = window.PortalRay.context;
        context.clearRect(-1000,-1000, 2000, 2000);
        drawAxes(context);
        drawLineSegments(context, lineSegments);
        drawRays(context, rays);
        drawRaycasts(context, window.PortalRay.rayHits);

        window.setTimeout(draw, 10);
    };

    function drawLineSegments(context, segments)
    {
        for(var i = 0; i < segments.length; i++)
        {
            context.lineWidth = 0.3;
            context.strokeStyle = "#3333cc";

            segment = segments[i];
            context.beginPath();
            context.moveTo(segment.a.x, segment.a.y);
            context.lineTo(segment.b.x, segment.b.y);

            context.stroke();
        }
    };

    function drawRaycasts(context, raycasts)
    {
        for(var i = 0; i < raycasts.length; i++)
        {
            raycast = raycasts[i];

            context.lineWidth = 0.1;

            //incidence
            context.strokeStyle = "#cccc33";
            context.beginPath();
            context.arc(raycast.incidence.x, raycast.incidence.y, 0.2, 0, Math.PI * 2);
            context.stroke();

            //ray path
            context.beginPath();
            context.moveTo(raycast.ray.origin.x, raycast.ray.origin.y);
            dist = raycast.ray.direction.multiply(raycast.rayDistance).add(raycast.ray.origin);
            context.lineTo(dist.x, dist.y);
            context.stroke();

            context.fillCol
            for(var x = 0; x < Math.min(GraphSize.x, raycast.rayDistance); x++)
            {
                var blipPoint = raycast.ray.direction.multiply(x).add(raycast.ray.origin)
                context.beginPath();
                context.arc(blipPoint.x, blipPoint.y, 0.2, 0, Math.PI * 2);
                context.fillStyle = "#cccc33";
                context.fill();
            }

            //lineSegment fraction
            context.strokeStyle = "#33cc33";
            context.beginPath();
            context.moveTo(raycast.segment.a.x, raycast.segment.a.y);
            portion = raycast.segment.offset().multiply(raycast.segmentFraction).add(raycast.segment.a);
            context.lineTo(portion.x, portion.y);
            context.stroke();

        }
    };

    function drawRays(context, rays)
    {
        for(var i = 0; i < rays.length; i++)
        {
            context.lineWidth = 0.2;
            context.strokeStyle = "#cc3333";

            ray = rays[i];
            context.beginPath();
            context.arc(ray.origin.x, ray.origin.y, 0.2, 0, Math.PI * 2);
            context.moveTo(ray.origin.x, ray.origin.y);
            context.lineTo(ray.forward().x, ray.forward().y);

            context.stroke();
        }
    };

    function drawAxes(context, segments)
    {
        context.lineWidth = 0.1;
        context.strokeStyle = "#dddddd";

        context.beginPath();
        context.moveTo(0, GraphSize.y);
        context.lineTo(0, -GraphSize.y);
        context.stroke();
        context.beginPath();
        context.moveTo(GraphSize.x, 0);
        context.lineTo(-GraphSize.x, 0);

        context.stroke();
    };
}
