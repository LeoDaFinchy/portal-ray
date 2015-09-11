var _ = require('underscore')._;
var $ = require('jquery');
var Kinetic = require('kinetic');

var Geometry = require('geometry');
var Vector2 = Geometry.Vector2;
var Matrix2 = require('./lib/Matrix2.js').Matrix2;
var Matrix3 = require('./lib/Matrix3.js').Matrix3;
var Intersect2 = require("./lib/Intersect2").Intersect2;

var LineSegment2JS = require("./lib/LineSegment2");
var LineSegment2 = LineSegment2JS.LineSegment2;
var LineSegment2Collection = LineSegment2JS.LineSegment2Collection;

var Polygon2 = require('./lib/Polygon2').Polygon2;

var Visualiser2 = require('./lib/Visualiser2').Visualiser2;
var Shapes = require('./lib/Shapes').Shapes;
var Hitzone2 = require('./lib/Hitzone2').Hitzone2;

var Portal = require('./engine/Portal').Portal;
var Beam = require('./engine/Beam').Beam;
var Applet = require('./engine/Applet').Applet;

var LineSegment2UI = require("./gui/LineSegment2UI").LineSegment2UI;
var RayUI = require("./gui/RayUI").RayUI;
var PortalUI = require("./gui/PortalUI").PortalUI;
var BeamUI = require("./gui/BeamUI").BeamUI;
var RaycastCollectionUI = require("./gui/RaycastCollectionUI").RaycastCollectionUI;

var visualiseLineSegment = function(lineSegment, context){
    var a = lineSegment.a;
    var b = lineSegment.b;
    var n = lineSegment.normalPoint;
    var r = 0.2;

    context.strokeStyle = 'rgb(51, 51, 51)';
    context.fillStyle = null;
    context.lineWidth = 0.2;

    Shapes.line(context, a, b);
    Shapes.line(context, a, n);

    context.strokeStyle = "#ffcc33";
    Shapes.circle(context, a, r);

    context.strokeStyle = "#33ccff";
    Shapes.circle(context, b, r);
};

var visualiseRay = function(ray, context)
{
    var a = ray.a;
    var b = ray.b;
    var rA = 0.3;
    var rB = 0.2;

    context.strokeStyle = "#cccc00"
    context.lineWidth = 0.3;
    context.fillStyle = null;
    Shapes.line(context, a, b);

    context.lineWidth = 0.1;
    context.fillStyle = "#ffff33";
    Shapes.circle(context, a, rA);

    context.fillStyle = "#cccc00";
    Shapes.circle(context, b, rB);
}

var visualisePortal = function(portal, context)
{
    var pts = [
        portal.a,
        portal.b,
        portal.portal.other(portal).a,
        portal.portal.other(portal).b
    ];

    context.strokeStyle = null;
    context.lineWidth = 0.1;
    context.fillStyle = "rgba(102,102,204,0.4)";
    Shapes.polygon(context, pts, Shapes.styles.EDGELESS);
}

var visualiseBeam = function(beam, context)
{
    var pts = [
        beam.a.a,
        beam.a.b,
        beam.b.b,
        beam.b.a
    ];

    context.strokeStyle = null;
    context.lineWidth = 0;
    context.fillStyle = "rgba(51,51,51,0.2)";

    Shapes.polygon(context, pts, Shapes.styles.EDGELESS);
}

var visualiseBeamLineSegmentIntersect = function(intersect, context)
{
    var pts = [
        intersect.a.a.a,     //  I.Left.Ray.Origin
        intersect.b.a.a,     //  I.Right.Ray.Origin
        intersect.b.x,
        intersect.a.x,
    ];

    context.strokeStyle = null;
    context.lineWidth = 0;
    context.fillStyle = "rgba(153,153,51,0.2)";

    Shapes.polygon(context, pts, Shapes.styles.EDGELESS);
}

hexLineSegment = new LineSegment2(Vector2.unit, Matrix3.rotation(Math.PI / 3.0).rotateVector2(Vector2.unit));
hexMatrices = [
    Matrix3.identity,
    Matrix3.rotation(Math.PI/3.0),
    Matrix3.rotation(Math.PI/3.0 * 2.0),
    Matrix3.rotation(Math.PI/3.0 * 3.0),
    Matrix3.rotation(Math.PI/3.0 * 4.0),
    Matrix3.rotation(Math.PI/3.0 * 5.0),
];

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
    .filter(function(x){
        return x.angle > 0;
    })
    .map(function(x){
        return x.b.portal.createExitRay(x);
    })
    .value();

    var result = castRaysAgainstPortals(portalRays, lineSegments, generations - 1);

    rays = _.union(rays, result.rays);
    hits = _.union(hits, result.hits);

    return {rays:rays, hits:hits};
};

var castBeamsAgainstPortals = function(beams, lineSegments, generations)
{
    if(generations <= 0 || rays.length <= 0){return {rays:[], hits:[]}};

    var hits = _.chain(beams).map(function(beam, i, beams){
        return _.chain(beam.intersect(lineSegments))
            .each(function(x){x.solve();})                                          //  Prepare
            .filter(function(x){return x.a.x || x.b.x})                             //  Get rid of non-intersects (both edges parallel)
            .filter(function(x){return x.a.fractionA > 0 || x.b.fractionA > 0})     //  Get rid of intersects in the wrong direction (backwards to both edges)
            .filter(function(x){return (                                            //  Get rid of intersects that completely miss
                    x.a.fractionB >= 0 && x.a.fractionB <= 1                        //  Side A hits
                ) || (
                    x.b.fractionB >= 0 && x.b.fractionB <= 1                        //  Side B hits
                ) || (
                    x.a.fractionB <= 0 && x.b.fractionB >= 1                        //  Beam envelops line
                ) || (
                    x.b.fractionB <= 0 && x.a.fractionB >= 1                        //  Likewise but vice versa
                )
            })
            .value();
    })
        .flatten()
        .value();

    return {beams: beams, hits: hits};
}

var lineSegments = [
    new LineSegment2(new Vector2(-10.0,  10.0), new Vector2(-10.0, -10.0)),
    new LineSegment2(new Vector2(-12.0, -10.0), new Vector2(-12.0,  10.0)),
    new LineSegment2(new Vector2(-17.0,  10.0), new Vector2(-17.0, -10.0)),
    new LineSegment2(new Vector2( 10.0, -10.0), new Vector2( 10.0,  10.0)),
];

// lineSegments = _.union(lineSegments, hex.edges);

var rays = [
    new LineSegment2(Vector2.zero, Vector2.unit),
    new LineSegment2(new Vector2(0.0, 5.0), new Vector2(1.0, 3.0)),
    new LineSegment2(new Vector2(-3.0, 0.0), new Vector2(-5.0, 3.0))
];

var beams = [
    new Beam(rays[0], rays[1])
]

var portals = [
    new Portal(lineSegments[0], lineSegments[1]),
    new Portal(lineSegments[2], lineSegments[3])
];

var toDraw = {
    rays:rays,
    lineSegments:lineSegments,
    raycasts:[],
    beams:beams,
    beamCasts: [],
};

Object.defineProperties(toDraw, {
    getRaycasts: {
        value: _.bind(function(){
            return this.raycasts;
        }, toDraw)
    }
});

var applet;

if(window && document)
{   

    $('document').ready(function(){
        applet = new Applet();
        applet.initialise('canvasContainer');
        applet.addLayer("InertLayer");
        applet.addLayer("InteractiveLayer");

        _.each(lineSegments, function(lineSegment){
            new LineSegment2UI(lineSegment, applet.namedLayers["InteractiveLayer"]);
        });

        _.each(rays, function(ray){
            new RayUI(ray, applet.namedLayers["InteractiveLayer"]);
        });

        _.each(portals, function(portal){
            new PortalUI(portal, applet.namedLayers["InertLayer"]);
        });

        _.each(beams, function(beam){
            new BeamUI(beam, applet.namedLayers["InertLayer"]);
        });

        new RaycastCollectionUI(toDraw.getRaycasts, applet.namedLayers["InteractiveLayer"]);

        var CanvasSize = new Vector2(800, 600);
        var GraphSize = new Vector2(40, 30);
        var Scaling = new Vector2(CanvasSize.x / GraphSize.x, -CanvasSize.y / GraphSize.y);

        applet.stage.scale(Scaling);
        applet.stage.offset(GraphSize.multiplyByVector2(new Vector2(-0.5, 0.5)));

    });

    var CanvasSize = new Vector2(800, 600);
    var GraphSize = new Vector2(40, 30);
    var Scaling = new Vector2(CanvasSize.x / GraphSize.x, -CanvasSize.y / GraphSize.y);

    var dragVector = function(e, vector){
        delta = new Vector2(e.movementX, e.movementY)
            .divideByVector2(Scaling);
        vector.add(delta);
    }

    var lineSegmentAHitzoneVisualiser = new Visualiser2([
        Visualiser2.circle(
            Visualiser2.key('a'),
            Visualiser2.value(0.4),
            {
                lineWidth: 0.1
            }
        ),
    ]);

    var lineSegmentBHitzoneVisualiser = new Visualiser2([
        Visualiser2.circle(
            Visualiser2.key('b'),
            Visualiser2.value(0.4),
            {
                lineWidth: 0.1
            }
        ),
    ]);

    var lineHitzones = _.chain(lineSegments)
        .map(function(x){
            var a = new Hitzone2(lineSegmentAHitzoneVisualiser, x);
            var b = new Hitzone2(lineSegmentBHitzoneVisualiser, x);
            a.onDrag(_.partial(dragVector, _, x.a));
            b.onDrag(_.partial(dragVector, _, x.b));
            return [a,b];
        })
        .flatten()
        .value();

    var rayHitzones = _.chain(rays)
        .map(function(x){
            var a = new Hitzone2(lineSegmentAHitzoneVisualiser, x);
            var b = new Hitzone2(lineSegmentBHitzoneVisualiser, x);
            a.onDrag(_.partial(dragVector, _, x.a));
            b.onDrag(_.partial(dragVector, _, x.b));
            return [a,b];
        })
        .flatten()
        .value();

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
        canvas.onmousedown = down;
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

        _.each(lineHitzones, function(x){x.checkHit(window.PortalRay.hitContext, e)});
        _.each(rayHitzones, function(x){x.checkHit(window.PortalRay.hitContext, e)});
    };

    function down(e){
        _.each(lineHitzones, function(x){x.checkHit(window.PortalRay.hitContext, e)});
        _.each(rayHitzones, function(x){x.checkHit(window.PortalRay.hitContext, e)});
    }

    function draw(){

        applet.stage.draw();
        
        portal = castRaysAgainstPortals(rays, lineSegments, 100);
        toDraw.rays = portal.rays;
        toDraw.raycasts = portal.hits;

        beamCast = castBeamsAgainstPortals(beams, lineSegments, 10);
        toDraw.beams = beamCast.beams;
        toDraw.beamCasts = beamCast.hits;

        window.PortalRay.hitContext.clearRect(-1000,-1000, 2000, 2000);

        context = window.PortalRay.context;
        context.clearRect(-1000,-1000, 2000, 2000);
        drawAxes(context);

        if($('#showLineSegments').prop('checked'))
        {
            _.map(toDraw.lineSegments, function(x){visualiseLineSegment(x, context);});
        }

        if($('#showRays').prop('checked'))
        {
            _.map(toDraw.rays, function(x){visualiseRay(x, context);});
        }

        if($('#showIntersects').prop('checked'))
        {
            drawRaycasts(context, toDraw.raycasts);
        }

        if($('#showPortals').prop('checked'))
        {
            visualisePortal(lineSegments[0], context);
            visualisePortal(lineSegments[2], context);
        }

        if($('#showBeams').prop('checked'))
        {
            _.map(toDraw.beams, function(x){visualiseBeam(x, context);});
        }

        if($('#showBeamIntersects').prop('checked'))
        {
            _.map(toDraw.beamCasts, function(x){visualiseBeamLineSegmentIntersect(x, context);});
        }

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
