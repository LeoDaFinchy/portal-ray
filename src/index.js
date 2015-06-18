var Vector2 = require('./Vector2.js').Vector2;
var Matrix2 = require('./Matrix2.js').Matrix2;
var Matrix3 = require('./Matrix3.js').Matrix3;
var Transform2 = require('./Transform2.js').Transform2;
var DebugVisage = require('./DebugVisage.js').DebugVisage;
var Actor = require('./Actor').Actor;
var Context2 = require('./Context2.js').Context2;

Vector2.prototype.rotation = function()
{
    var angle = Math.atan2(this.y, this.x);
    return new Matrix2([
        Math.cos(angle), -Math.sin(angle),
        Math.sin(angle), Math.cos(angle)]
    );
}
Vector2.prototype.rotate = function(matrix){
    return matrix.rotateVector2(this);
}
Vector2.crossProductMagnitude = function(a, b)
{
    return (a.x * b.y) - (a.y * b.x);
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


var LineSegment = function (a, b){
    this.a = a || new Vector2();
    this.b = b || new Vector2();
    this.matrix = Matrix3.translation(a)
        .rotate(Math.atan2(this.offset().y, this.offset().x))
        .scale(new Vector2(this.offset().length, 1))
        ;
    // console.log(this.matrix);
};

LineSegment.prototype.offset = function(){
    return this.b._.subtract(this.a);
}

LineSegment.prototype.normal = function()
{
    return this.offset().normal;
}

var Ray = function(origin, direction){
    this.origin = origin || new Vector2();
    this.direction = direction ? direction.tangent : new Vector2(1.0, 0.0);
    this.matrix = Matrix3.translation(this.origin).rotate(Math.atan2(this.direction.y, this.direction.x));
    // console.log(this.matrix);
};


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

    var offset = lineSegment.offset();
    var segmentFraction = offset.x > offset.y?
        ((x.x - a.x) / lineSegment.offset().x):
        ((x.y - a.y) / lineSegment.offset().y);

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


var Raycast = function(incidence, rayDistance, segmentFraction, ray, segment){
    this.incidence = incidence;
    this.rayDistance = rayDistance;
    this.segmentFraction = segmentFraction;
    this.ray = ray;
    this.segment = segment;
}

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

var castRaysAgainstPortals = function(rays, lineSegments, generations)
{
    if(generations <= 0 || rays.length <= 0){return {rays:[], hits:[]}};

    var hits = [];

    for(var r = 0; r < rays.length; r++)
    {
        hits.push(rays[r].findNearestHitOnSegments(lineSegments));
    }
    hits = hits.filter(function(raycast){ return raycast;});
    ports = hits.filter(function(raycast){
        return raycast.segment.portal && raycast.isHittingFront();
    }).map(function(raycast){return raycast.portalExitRay();});
    result = castRaysAgainstPortals(ports, lineSegments, generations - 1);
    rays = rays.concat(result.rays);
    hits = hits.concat(result.hits);
    return {rays:rays, hits:hits};
}

var lineSegments = [
    // new LineSegment(new Vector2(-1.0, 7.0), new Vector2(-2.0, -12.0)),
    new LineSegment(new Vector2(-11.0, 7.0), new Vector2(-10.0, -12.0)),
    new LineSegment(new Vector2(-8.0, -12.0), new Vector2(-9.0, 7.0)),
    new LineSegment(new Vector2(-8.0, -12.0), new Vector2(-2.0, -12.0)),
];

var rays = [
    // new Ray(new Vector2(0.0, 1.0)),
    new Ray(new Vector2(-5.0, 3.0))
];

var mouse = {
    coords: new Vector2(),
    oldCoords: new Vector2(),
    alt: false,
    ctrl: false,
    shift: false,
    buttons: 0,
    type: ""
};

mouse.refresh = function(event){
    this.oldCoords = this.coords;
    this.coords = new Vector2(event.clientX, event.clientY)
        .subtract(new Vector2(event.target.offsetLeft, event.target.offsetTop));
    this.ctrl = event.ctrlKey;
    this.alt = event.altKey;
    this.shift = event.shiftKey;
    this.type = event.type;
    this.buttons = event.buttons;
};

var root = new Actor();
new Transform2(Matrix3.identity().translate(new Vector2(5, 2)).rotate(1)).attach(root);
new DebugVisage().attach(root);
var child1 = root.clone;
child1.transform2 = new Transform2(Matrix3.identity().translate(new Vector2(1, 6)));
var child2 = root.clone;
child2.transform2 = new Transform2(Matrix3.identity().translate(new Vector2(3, -2)));
var grandchild11 = root.clone;
grandchild11.transform2 = new Transform2(Matrix3.identity().translate(new Vector2(2,0)));

root.transform2.children.push(child1);
root.transform2.children.push(child2);
child1.transform2.children.push(grandchild11);

Portal(lineSegments[0], lineSegments[1]);

var toDraw = {rays:rays, lineSegments:lineSegments, raycasts:[]};

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
        canvas.onmousedown = mouseDown;
        canvas.oncontextmenu = function(){return false;}

        window.PortalRay = {
            canvas: canvas,
            context: context
        }

        window.setTimeout(draw, 100);
    };

    function mouseMoved(e){
        var canvasSpaceMouse = new Vector2(e.clientX, e.clientY).subtract(new Vector2(e.target.offsetLeft, e.target.offsetTop));
        var graphSpaceMouse = canvasSpaceMouse._.multiplyByVector2(Scaling.reciprocal).subtract(GraphSize._.multiplyByVector2(new Vector2(0.5,-0.5)));
        for(var x = 0; x < rays.length; x++)
        {
            rays[x].direction = graphSpaceMouse.subtract(rays[x].origin);
            rays[x].matrix = Matrix3.translation(rays[x].origin).rotate(Math.atan2(rays[x].direction.y, rays[x].direction.x));
        }
        portal = castRaysAgainstPortals(rays, lineSegments, 10);
        toDraw.rays = portal.rays;
        toDraw.raycasts = portal.hits;

        mouse.refresh(e);
    };

    function mouseDown(e)
    {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        e.cancelBubble = true;
        mouse.refresh(e);
        return false;
    }

    function draw(){
        context = window.PortalRay.context;
        context.clearRect(-1000,-1000, 2000, 2000);
        drawAxes(context);

        root.transform2.matrix.rotate(0.01);
        child1.transform2.matrix.rotate(-0.03);

        drawLineSegments(context, toDraw.lineSegments);
        drawRays(context, toDraw.rays);
        drawRaycasts(context, toDraw.raycasts);

        // root.drawEdit(context, mouse);

        var con = new Context2(context);
        root.debugVisage.draw(con, ["transform2"]);

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

            var normalPosition = segment.a._.add(segment.normal());
            context.strokeStyle = "#33cc33";
            context.lineWidth = 0.1;
            context.beginPath();
            context.moveTo(segment.a.x, segment.a.y);
            context.lineTo(normalPosition.x, normalPosition.y);
            context.stroke();

            //MATRIX

            var A = segment.matrix.transformVector2(Vector2.zero);
            var B = segment.matrix.transformVector2(Vector2.x);
            var C = segment.matrix.transformVector2(Vector2.y);

            context.strokeStyle = "#cc3333";
            context.beginPath();
            context.moveTo(B.x, B.y);
            context.lineTo(A.x, A.y);
            context.lineTo(C.x, C.y);
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
            context.strokeStyle = raycast.isHittingFront() ? "#cccc33" : "#cc3333";
            context.beginPath();
            context.arc(raycast.incidence.x, raycast.incidence.y, 0.2, 0, Math.PI * 2);
            context.stroke();

            //ray path
            context.beginPath();
            context.moveTo(raycast.ray.origin.x, raycast.ray.origin.y);
            dist = raycast.ray.direction._.multiplyByScalar(raycast.rayDistance).add(raycast.ray.origin);
            context.lineTo(dist.x, dist.y);
            context.stroke();

            //lineSegment fraction
            context.strokeStyle = "#33cc33";
            context.beginPath();
            context.moveTo(raycast.segment.a.x, raycast.segment.a.y);
            portion = raycast.segment.offset().multiplyByScalar(raycast.segmentFraction).add(raycast.segment.a);
            context.lineTo(portion.x, portion.y);
            context.stroke();

            // MATRIX

            // 0 = mx + c;

            var rayMat = raycast.ray.matrix;
            var segMat = raycast.segment.matrix;

            var A = segMat.inverse.applyMatrix3(rayMat).transformVector2(Vector2.zero);
            var B = segMat.inverse.applyMatrix3(rayMat).transformVector2(Vector2.x);
            var C = Vector2.zero;
            var D = Vector2.x;
            var R = B._.subtract(A);

            var X = R.x === 0 ? new Vector2(A.x, 0.0) : new Vector2(A.x - ((R.x/R.y) * A.y), 0.0);
            var X2 = segMat.transformVector2(X._);

            context.strokeStyle = "#cc33cc";
            context.beginPath();
            context.moveTo(A.x, A.y);
            context.lineTo(B.x, B.y);
            context.stroke();
            context.beginPath();
            context.moveTo(C.x, C.y);
            context.lineTo(D.x, D.y);
            context.stroke();

            context.beginPath();
            context.arc(X.x, X.y, 0.2, 0, Math.PI * 2);
            context.stroke();

            context.beginPath();
            context.arc(X2.x, X2.y, 0.2, 0, Math.PI * 2);
            context.stroke();

            if(raycast.segment.portal)
            {
                var portMat = raycast.segment.portal.matrix;

                var exit = portMat._
                    .translate(new Vector2(1.0, 0.0))
                    .scale(new Vector2(-1,0));

                var O = exit.transformVector2(X._);
                var O2 = rayMat._.applyMatrix3(portMat).rotateVector2(Vector2.y).add(O);
                context.beginPath();
                context.arc(O.x, O.y, 0.2, 0, Math.PI * 2);
                context.moveTo(O.x, O.y);
                context.lineTo(O2.x, O2.y);
                context.stroke();
            }

        }
    };

    function drawRays(context, rays)
    {
        for(var i = 0; i < rays.length; i++)
        {
            context.lineWidth = 0.2;
            context.strokeStyle = "#33cccc";

            ray = rays[i];
            context.beginPath();
            context.arc(ray.origin.x, ray.origin.y, 0.2, 0, Math.PI * 2);
            context.moveTo(ray.origin.x, ray.origin.y);
            context.lineTo(ray.forward().x, ray.forward().y);

            context.stroke();

            //MATRIX

            var A = ray.matrix.transformVector2(Vector2.zero);
            var B = ray.matrix.transformVector2(Vector2.x);
            
            context.strokeStyle = "#cccc33";
            context.beginPath();
            context.moveTo(B.x, B.y);
            context.lineTo(A.x, A.y);
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
