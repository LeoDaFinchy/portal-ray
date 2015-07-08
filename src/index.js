var _ = require('underscore')._;

var Vector2 = require('./Vector2.js').Vector2;
var Matrix2 = require('./Matrix2.js').Matrix2;
var Matrix3 = require('./Matrix3.js').Matrix3;
var Transform2 = require('./Transform2.js').Transform2;
var DebugVisage = require('./DebugVisage.js').DebugVisage;
var Visage = require('./Visage').Visage;
var Actor = require('./Actor').Actor;
var Context2 = require('./Context2.js').Context2;
var HitRegion = require('./HitRegion').HitRegion;
var Intersect2 = require("./Intersect2").Intersect2;

var LineSegment2JS = require("./LineSegment2");
var LineSegment2 = LineSegment2JS.LineSegment2;
var LineSegment2Collection = LineSegment2JS.LineSegment2Collection;

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

    return {rays:rays, hits:hits};
};

var lineSegments = new LineSegment2Collection();
lineSegments.push(
    new LineSegment2(new Vector2(-11.0, 7.0), new Vector2(-10.0, -12.0)),
    new LineSegment2(new Vector2(-8.0, -12.0), new Vector2(-9.0, 7.0)),
    new LineSegment2(new Vector2(-8.0, -12.0), new Vector2(-2.0, -12.0)),
    hexLineSegment,
    Matrix3.fromReferencePoints(hexLineSegment.a, hexLineSegment.b, hexLineSegment.normal.add(hexLineSegment.a)).transformLineSegment2(new LineSegment2(Vector2.zero, Vector2.y))
);

var rays = new LineSegment2Collection();
rays.push(new LineSegment2(Vector2.zero, new Vector2(-5.0, 3.0)));
rays.push(new LineSegment2(new Vector2(0.0, 5.0), new Vector2(-5.0, 3.0)));
rays.push(new LineSegment2(new Vector2(-3.0, 0.0), new Vector2(-5.0, 3.0)));

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
            rays[x].b = graphSpaceMouse;
        }
        portal = castRaysAgainstPortals(rays, lineSegments, 10);
        toDraw.rays = portal.rays;
        toDraw.raycasts = portal.hits;
    };

    function draw(){
        context = window.PortalRay.context;
        context.clearRect(-1000,-1000, 2000, 2000);
        drawAxes(context);

        drawLineSegments(context, toDraw.lineSegments);
        drawRays(context, toDraw.rays);
        drawRaycasts(context, toDraw.raycasts);

        // root.drawEdit(context, mouse);

        var con = new Context2(context);

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

            var normalPosition = segment.a._.add(segment.normal);
            context.strokeStyle = "#33cc33";
            context.lineWidth = 0.1;
            context.beginPath();
            context.moveTo(segment.a.x, segment.a.y);
            context.lineTo(normalPosition.x, normalPosition.y);
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

    function drawRays(context, rays)
    {
        for(var i = 0; i < rays.length; i++)
        {
            context.lineWidth = 0.2;
            context.strokeStyle = "#33cccc";

            ray = rays[i];
            context.beginPath();
            context.arc(ray.a.x, ray.a.y, 0.2, 0, Math.PI * 2);
            context.moveTo(ray.a.x, ray.a.y);
            context.lineTo(ray.b.x, ray.b.y);

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
