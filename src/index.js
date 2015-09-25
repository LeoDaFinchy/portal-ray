var _ = require('underscore')._;
var $ = require('jquery');
var Kinetic = require('kinetic');

_.mixin({
    rotate: function(array, amount){
        if(!amount){return array};
        if(amount > 0)
        {
            var removed = array.splice(0, amount);
            return array.concat(removed);
        }
        else
        {
            var removed = array.splice(array.length + amount, -amount);
            return removed.concat(array);
        }
    }
});

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
var HexUI = require("./gui/HexUI").HexUI;
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
        applet.initialise(new Vector2(800,600));
        applet.addLayer("InertLayer");
        applet.addLayer("HexLayer");
        applet.addLayer("InteractiveLayer");
        applet.hex = new Hex();
        applet.hex2 = new Hex();

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
        applet.eye.on("dragmove", function(e){
            _.each(applet.hUIs, function(x){
                x.eye = Vector2.fromObject(applet.eye.position()).subtract(Vector2.fromObject(x.group.position()))
                x.vis = x.visibility();
            })
        });

        applet.hUIs = [
            new HexUI(applet.hex, applet.namedLayers.HexLayer, 0, {lower: 0, upper: 1}),
            (function(){
                var hex = new HexUI(applet.hex, applet.namedLayers.HexLayer, 0, {lower: 0, upper: 1});
                hex.group.position(new Vector2(0.0, 6.0));
                return hex;
            })()
        ];

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
        // applet.vis = _.map(_.range(6), function(x){
        //     return applet.hex.visibility(applet.eye.position(), x, {lower: 0, upper: 1});
        // });

        // applet.stage.draw();
        applet.stage.clear();
        applet.namedLayers.InertLayer.draw();
        applet.namedLayers.InteractiveLayer.draw();
        _.each(applet.hUIs, function(x){x.group.draw();});
        
        portal = castRaysAgainstPortals(rays, lineSegments, 100);
        toDraw.rays = portal.rays;
        toDraw.raycasts = portal.hits;

        beamCast = castBeamsAgainstPortals(beams, lineSegments, 10);
        toDraw.beams = beamCast.beams;
        toDraw.beamCasts = beamCast.hits;

        window.setTimeout(draw, 10);
    };
}
