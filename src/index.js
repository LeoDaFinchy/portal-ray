var _ = require('underscore')._;

var Vector2 = require('./Vector2.js').Vector2;
var Matrix2 = require('./Matrix2.js').Matrix2;
var Matrix3 = require('./Matrix3.js').Matrix3;
var Intersect2 = require("./Intersect2").Intersect2;

var LineSegment2JS = require("./LineSegment2");
var LineSegment2 = LineSegment2JS.LineSegment2;
var LineSegment2Collection = LineSegment2JS.LineSegment2Collection;

var Polygon2 = require('./Polygon2').Polygon2;

var Visualiser2 = require('./Visualiser2').Visualiser2;
var Hitzone2 = require('./Hitzone2').Hitzone2;


var LineSegmentVisualiser = new Visualiser2([
    Visualiser2.line(
        Visualiser2.key('a'),
        Visualiser2.key('b'),
        {lineColour: "#333333", lineWidth: 0.2}
    ),
    Visualiser2.circle(
        Visualiser2.key('a'),
        Visualiser2.value(0.2),
        {lineColour: "#ffcc33", lineWidth: 0.2}
    ),
    Visualiser2.circle(
        Visualiser2.key('b'),
        Visualiser2.value(0.2),
        {lineColour: "#33ccff", lineWidth: 0.2}
    )
]);

var RayVisualiser = new Visualiser2([
    Visualiser2.line(
        Visualiser2.key('a'),
        Visualiser2.key('b'),
        {lineColour: "#ff3333", lineWidth: 0.3}
    ),
    Visualiser2.circle(
        Visualiser2.key('a'),
        Visualiser2.value(0.3),
        {lineColour: "#ff3333", lineWidth: 0.1, fillColour: "#cc0000"}
    )
]);

hexLineSegment = new LineSegment2(Vector2.unit, Matrix3.rotation(Math.PI / 3.0).rotateVector2(Vector2.unit));
hexMatrices = [
    Matrix3.identity,
    Matrix3.rotation(Math.PI/3.0),
    Matrix3.rotation(Math.PI/3.0 * 2.0),
    Matrix3.rotation(Math.PI/3.0 * 3.0),
    Matrix3.rotation(Math.PI/3.0 * 4.0),
    Matrix3.rotation(Math.PI/3.0 * 5.0),
];

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

var hex = new Polygon2(
    _.map(hexMatrices, function(matrix){
        return matrix.transformVector2(Vector2.unit);
    })
);

var hex = Polygon2.regular(3, 0.5, 1);

var hitzoneA = new Hitzone2(new Visualiser2([
    Visualiser2.circle(
        Visualiser2.value(new Vector2(5, 0)),
        Visualiser2.value(1.0),
        {
            lineWidth: 0.1
        }
    )
]));

var hitzoneB = new Hitzone2(new Visualiser2([
    Visualiser2.circle(
        Visualiser2.value(new Vector2(0, 5)),
        Visualiser2.value(1.0),
        {
            lineWidth: 0.1
        }
    )
]));

var castRaysAgainstPortals = function(rays, lineSegments, generations)
{
    if(generations <= 0 || rays.length <= 0){return {rays:[], hits:[]}};

    var hits = _.chain(rays).map(function(ray, i, rays){

        return _.chain(ray.intersect(lineSegments))
            .each(function(x){x.solve();})                                          //  Prepare
            .filter(function(x){return x.x;})                                       //  Get rid of non-intersects (parallels)
            .filter(function(x){return x.fractionA > 0;})                           //  Get rid of intersects in the wrong direction
            .filter(function(x){return x.fractionB >= 0 && x.fractionB <= 1;})      //  Get rid of intersects that miss the segment
            .sortBy('fractionA')
            .first()
            .value();

    })
        .compact()
        .value();

    var portalRays = _.chain(hits)
    .filter(function(x){
        return x.b.portal;
    })
    .map(function(x){
        var front = x.b;
        var back = x.b.portal;
        var matFront = Matrix3.fromReferencePoints(front.a, front.b, front.normal.add(front.a));
        var matBack = Matrix3.fromReferencePoints(back.a, back.b, back.normal.add(back.a));
        var matWarp = Matrix3.identity
            .applyMatrix3(matBack)
            .applyMatrix3(Matrix3.scale(new Vector2(1.0, -1.0)))
            .applyMatrix3(matFront.inverse);

        var exitDir = matWarp.transformVector2(x.a.tangent.add(x.x));
        var exitPoint = matWarp.transformVector2(x.x._).subtract(exitDir._.multiplyByScalar(0.00001));
        return new LineSegment2(exitPoint, exitDir);
    })
    .value();

    var result = castRaysAgainstPortals(portalRays, lineSegments, generations - 1);

    rays = _.union(rays, result.rays);
    hits = _.union(hits, result.hits);

    return {rays:rays, hits:hits};
};

var lineSegments = [
    new LineSegment2(new Vector2(-10.0, -12.0), new Vector2(-10.2, 7.0)),
    new LineSegment2(new Vector2(-8.0, -12.0), new Vector2(-8.05, 7.0)),
    new LineSegment2(new Vector2(7.95, 7.0), new Vector2(8.0, -12.0)),
    new LineSegment2(new Vector2(-8.0, -12.0), new Vector2(-2.0, -12.0))
];

lineSegments = _.union(lineSegments, hex.edges);

var rays = [
    new LineSegment2(Vector2.zero, new Vector2(-5.0, 3.0)),
    new LineSegment2(new Vector2(0.0, 5.0), new Vector2(-5.0, 3.0)),
    new LineSegment2(new Vector2(-3.0, 0.0), new Vector2(-5.0, 3.0))
];

Portal(lineSegments[1], lineSegments[2]);

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

        hitCanvas = document.getElementById('hitCanvas');
        hitContext = hitCanvas.getContext("2d");
        hitContext.scale(Scaling.x, Scaling.y);
        hitContext.translate(GraphSize.x / 2.0, -GraphSize.y / 2.0);

        canvas.onmousemove = mouseMoved;
        canvas.oncontextmenu = function(){return false;}

        window.PortalRay = {
            canvas: canvas,
            context: context,
            hitContext: hitContext
        }

        window.setTimeout(draw, 100);
    };

    function mouseMoved(e){
        var canvasSpaceMouse = new Vector2(e.clientX, e.clientY).subtract(new Vector2(e.target.offsetLeft, e.target.offsetTop));
        var graphSpaceMouse = canvasSpaceMouse._.multiplyByVector2(Scaling.reciprocal).subtract(GraphSize._.multiplyByVector2(new Vector2(0.5,-0.5)));
        for(var x = 0; x < rays.length; x++)
        {
            rays[x].b = graphSpaceMouse;
        }
        portal = castRaysAgainstPortals(rays, lineSegments, 100);
        toDraw.rays = portal.rays;
        toDraw.raycasts = portal.hits;

        hitzoneA.checkHit(window.PortalRay.hitContext, e);
        hitzoneB.checkHit(window.PortalRay.hitContext, e);
    };

    function draw(){
        context = window.PortalRay.context;
        context.clearRect(-1000,-1000, 2000, 2000);
        drawAxes(context);

        _.map(toDraw.lineSegments, function(x){LineSegmentVisualiser.draw(x, context);});
        _.map(toDraw.rays, function(x){RayVisualiser.draw(x, context);});

        drawRaycasts(context, toDraw.raycasts);

        // root.drawEdit(context, mouse);

        window.setTimeout(draw, 10);
    };

    function drawRaycasts(context, raycasts)
    {
        for(var i = 0; i < raycasts.length; i++)
        {
            raycast = raycasts[i];

            context.lineWidth = 0.1;

            //incidence
            if(raycast.x)
            {
                context.strokeStyle = raycast.angle > 0 ? "#33cc33" : "#cc3333";
                context.beginPath();
                context.arc(raycast.x.x, raycast.x.y, 0.2, 0, Math.PI * 2);
                context.stroke();

                //ray path
                context.beginPath();

                context.strokeStyle = raycast.fractionA > 0 ? "#3333cc" : "#cc9933";
                context.moveTo(raycast.a.a.x, raycast.a.a.y);
                dist = raycast.a.offset._.multiplyByScalar(raycast.fractionA).add(raycast.a.a);
                context.lineTo(dist.x, dist.y);
                context.stroke();

                //lineSegment fraction
                context.strokeStyle = raycast.fractionB > 0 ? "#3333cc" : "#cc9933";
                context.beginPath();
                context.moveTo(raycast.b.a.x, raycast.b.a.y);
                portion = raycast.b.offset.multiplyByScalar(raycast.fractionB).add(raycast.b.a);
                context.lineTo(portion.x, portion.y);
                context.stroke();
            }
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
