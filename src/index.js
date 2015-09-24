var _ = require('underscore')._;
var $ = require('jquery');
var Kinetic = require('kinetic');

var Geometry = require('geometry');
var Vector2 = Geometry.Vector2;
var Matrix2 = Geometry.Matrix2;
var Matrix3 = Geometry.Matrix3;
var Intersect2 = Geometry.Intersect2;
var LineSegment2 = Geometry.LineSegment2;

var Portal = require('./engine/Portal').Portal;
var Beam = require('./engine/Beam').Beam;
var Hex = require('./engine/Hex').Hex;
var Applet = require('./engine/Applet').Applet;

var LineSegment2UI = require("./gui/LineSegment2UI").LineSegment2UI;
var RayUI = require("./gui/RayUI").RayUI;
var PortalUI = require("./gui/PortalUI").PortalUI;
var BeamUI = require("./gui/BeamUI").BeamUI;
var RaycastCollectionUI = require("./gui/RaycastCollectionUI").RaycastCollectionUI;
var BeamcastCollectionUI = require("./gui/BeamcastCollectionUI").BeamcastCollectionUI;

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

var getNonParallelForwardCollisionsByDistance = function(ray, lineSegments){
    return _.chain(ray.intersect(lineSegments))
        .each(function(x){x.solve();})
        .filter(function(x){return x.x;})
        .filter(function(x){return x.fractionA > 0;})
        .sortBy('fractionA')
        .value();
}

var castBeamsAgainstPortals = function(beams, lineSegments, generations)
{
    if(generations <= 0 || beams.length <= 0){return {beams:[], hits:[]}};

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

var lineSegments = [];

var rays = [];

var beams = []

var portals = [];

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
    },
    getBeamcasts: {
        value: _.bind(function(){
            return this.beamCasts;
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
        applet.hex = new Hex();

        applet.eye = new Kinetic.Circle({
            x: 2.0,
            y: 3.0,
            radius: 0.5,
            draggable: true,
            stroke: 'black',
            strokeWidth: 0.1,
            fill: 'green'
        })

        applet.entrance = 0;

        applet.namedLayers["InteractiveLayer"].add(applet.eye);

        var hexUI = new Kinetic.Shape({
            fill: 'rgba(255,0,0,0.2)',
            drawFunc: function(context){
                context.beginPath();
                context.moveTo(Hex.corners[0].x, Hex.corners[0].y);
                context.lineTo(Hex.corners[1].x, Hex.corners[1].y);
                context.lineTo(Hex.corners[2].x, Hex.corners[2].y);
                context.lineTo(Hex.corners[3].x, Hex.corners[3].y);
                context.lineTo(Hex.corners[4].x, Hex.corners[4].y);
                context.lineTo(Hex.corners[5].x, Hex.corners[5].y);
                context.lineTo(Hex.corners[0].x, Hex.corners[0].y);
                context.fillShape(this);
            }
        });
        applet.namedLayers["InteractiveLayer"].add(hexUI);
        hexUI.on("click", function(){applet.entrance = (applet.entrance + 1) % 6;});
        applet.namedLayers["InteractiveLayer"].add(new Kinetic.Shape({
            fill: 'blue',
            drawFunc: function(context){
                var vis = applet.hex.visibility(applet.eye.position(), applet.entrance, {lower: 0, upper: 1});
                context.beginPath();
                context.moveTo(vis.beam[0].x, vis.beam[0].y);
                context.lineTo(vis.beam[1].x, vis.beam[1].y);
                context.lineTo(vis.beam[2].x, vis.beam[2].y);
                context.lineTo(vis.beam[0].x, vis.beam[0].y);
                context.fillShape(this);
            }
        }));
        applet.namedLayers["InteractiveLayer"].add(new Kinetic.Shape({
            fill: 'yellow',
            stroke: 'black',
            strokeWidth: 0.1,
            drawFunc: function(context){
                var vis = applet.hex.visibility(applet.eye.position(), applet.entrance, {lower: 0, upper: 1});
                context.beginPath();
                context.moveTo(vis.patch[0].x, vis.patch[0].y);
                for(var i = 0; i < vis.patch.length; i++)
                {
                    context.lineTo(vis.patch[i].x, vis.patch[i].y);
                }
                context.strokeShape(this);
            }
        }));
        applet.namedLayers["InteractiveLayer"].add(new Kinetic.Shape({
            stroke: 'black',
            strokeWidth: 0.1,
            drawFunc: function(context){
                var vis = applet.hex.visibility(applet.eye.position(), applet.entrance, {lower: 0, upper: 1});
                context.beginPath();
                context.moveTo(vis.left.a.x, vis.left.a.y);
                context.lineTo(vis.left.b.x, vis.left.b.y);
                context.strokeShape(this);
                context.beginPath();
                context.moveTo(vis.right.a.x, vis.right.a.y);
                context.lineTo(vis.right.b.x, vis.right.b.y);
                context.strokeShape(this);
            }
        }));

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
        new BeamcastCollectionUI(toDraw.getBeamcasts, applet.namedLayers["InteractiveLayer"]);

        var CanvasSize = new Vector2(800, 600);
        var GraphSize = new Vector2(40, 30);
        var Scaling = new Vector2(CanvasSize.x / GraphSize.x, -CanvasSize.y / GraphSize.y);

        applet.stage.scale(Scaling);
        applet.stage.offset(GraphSize.multiplyByVector2(new Vector2(-0.5, 0.5)));

        window.setTimeout(draw, 10);
    });

    function draw(){

        applet.stage.draw();
        
        portal = castRaysAgainstPortals(rays, lineSegments, 100);
        toDraw.rays = portal.rays;
        toDraw.raycasts = portal.hits;

        beamCast = castBeamsAgainstPortals(beams, lineSegments, 10);
        toDraw.beams = beamCast.beams;
        toDraw.beamCasts = beamCast.hits;

        window.setTimeout(draw, 10);
    };
}
