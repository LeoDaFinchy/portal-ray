var _ = require('underscore');

var Geometry = require('geometry');
var Vector2 = Geometry.Vector2;
var Matrix3 = Geometry.Matrix3;
var LineSegment2 = Geometry.LineSegment2;

function TileNexusView(coord, level){
    this.coord = coord;
    this.position = TileGridView.corners[0]._.multiplyByScalar(this.coord.x).add(TileGridView.corners[1]._.multiplyByScalar(this.coord.y));
    this.level = level;
    // console.log(this.position);
}

function TilePortalView(front, back){
    this.front = front;
    this.back = back;
}

function TileHexView(nexii){
    this.nexii = nexii;
}

function TileGridView(applet, context, viewPort){
    if(!TileGridView.ready){TileGridView.initialise(50.0);}
    this.applet = applet;
    this.context = context;
    this.viewPort = viewPort;

    var limit = (viewPort.offset.length / 2.0)+ TileGridView.radius;
    this.nexii = this.generateNexii(limit);
}

// exports.TileNexusView = TileNexusView;
exports.TileGridView = TileGridView;

Object.defineProperties(TileGridView.prototype, {
    draw: {
        value: function(){
            var colours = ["red", "orange", "goldenrod", "yellow", "lightgreen", "green", "cyan", "blue", "violet", "purple", "black", "black", "black"]
            this.context.save();
            this.context.translate(400, 300);
            _.each(_.flatten(this.nexii), function drawNexus(nexus){
                this.context.strokeStyle = "black";
                this.context.fillStyle = colours[nexus.level];
                this.context.lineWidth = 0.5;
                this.context.beginPath()
                this.context.arc(nexus.position.x, nexus.position.y, 10 - (nexus.level * 0.5), 0, Math.PI * 2);
                this.context.fill();
                this.context.stroke();
            }, this);
            this.context.restore();
        }
    },
    generateNexii: {
        value: function(limit){
            var nexii = [];
            var level = 0;
            while(this.generateNexiiLevel(nexii, level++, limit));
            return nexii;
        }
    },
    generateNexiiLevel: {
        value: function(nexii, level, limit){
            var levelNexii = [];
            var phase = level % 2;
            var rad = Math.floor(level * 1.5) + 1;
            if(phase == 0)
            {
                // console.log(level)
                var corners = [
                    {x:  rad, y:    0},
                    {x:    0, y:  rad},
                    {x: -rad, y:  rad},
                    {x: -rad, y:    0},
                    {x:    0, y: -rad},
                    {x: rad,  y: -rad}
                ]
                // console.info(corners[1].y - corners[0].y)

                var paths = [
                    [{x: -1, y: +1}, {x:  0, y: +1}, {x: -1, y: +1}, {x: -1, y:  0}],
                    [{x: -1, y:  0}, {x: -1, y: +1}, {x: -1, y:  0}, {x:  0, y: -1}],
                    [{x:  0, y: -1}, {x: -1, y:  0}, {x:  0, y: -1}, {x: +1, y: -1}],
                    [{x: +1, y: -1}, {x:  0, y: -1}, {x: +1, y: -1}, {x: +1, y:  0}],
                    [{x: +1, y:  0}, {x: +1, y: -1}, {x: +1, y:  0}, {x:  0, y: +1}],
                    [{x:  0, y: +1}, {x: +1, y:  0}, {x:  0, y: +1}, {x: -1, y: +1}]
                ];

                var levelNexii = _.map(corners, function sideForCorner(corner, i){
                    var pathIter = 0;
                    return _.reduce(_.range(level * 2), function getNextNexusView(result, value){
                        var newStep = {
                            x: _.last(result).x + paths[i][pathIter].x,
                            y: _.last(result).y + paths[i][pathIter].y
                        }
                        pathIter = (pathIter + 1) % 4;
                        result.push(newStep);
                        return result;
                    }, [corner]);
                });
                // console.log(levelNexii)

                levelNexii = _.flatten(levelNexii);
                nexii[level] = _.map(levelNexii, function makeTileNexusViews(x){return new TileNexusView(x, level);});
            }
            else if(phase == 1)
            {
                // console.log(level)
                var corners = [
                    {x:  rad, y:    0},
                    {x:    0, y:  rad},
                    {x: -rad, y:  rad},
                    {x: -rad, y:    0},
                    {x:    0, y: -rad},
                    {x: rad,  y: -rad}
                ]
                console.info(corners[1].y - corners[0].y)

                var paths = [
                    [{x:  0, y: +1}, {x: -1, y: +1}, {x: -1, y:  0}, {x: -1, y: +1}],
                    [{x: -1, y: +1}, {x: -1, y:  0}, {x:  0, y: -1}, {x: -1, y:  0}],
                    [{x: -1, y:  0}, {x:  0, y: -1}, {x: +1, y: -1}, {x:  0, y: -1}],
                    [{x:  0, y: -1}, {x: +1, y: -1}, {x: +1, y:  0}, {x: +1, y: -1}],
                    [{x: +1, y: -1}, {x: +1, y:  0}, {x:  0, y: +1}, {x: +1, y:  0}],
                    [{x: +1, y:  0}, {x:  0, y: +1}, {x: -1, y: +1}, {x:  0, y: +1}]
                ];

                var levelNexii = _.map(corners, function sideForCorner(corner, i){
                    var pathIter = 0;
                    return _.reduce(_.range(level * 2), function getNextNexusView(result, value){
                        var newStep = {
                            x: _.last(result).x + paths[i][pathIter].x,
                            y: _.last(result).y + paths[i][pathIter].y
                        }
                        pathIter = (pathIter + 1) % 4;
                        result.push(newStep);
                        return result;
                    }, [corner]);
                });
                // console.log(levelNexii)

                levelNexii = _.flatten(levelNexii);
                nexii[level] = _.map(levelNexii, function makeTileNexusViews(x){return new TileNexusView(x, level);});
            }
            else if(phase == 2)
            {
                // console.log(level)
                var corners = [
                    {x:  rad, y:    0},
                    {x:    0, y:  rad},
                    {x: -rad, y:  rad},
                    {x: -rad, y:    0},
                    {x:    0, y: -rad},
                    {x: rad,  y: -rad}
                ]
                // console.info(corners[1].y - corners[0].y)

                var paths = [
                    [{x: -1, y: +1}, {x:  0, y: +1}, {x: -1, y: +1}, {x: -1, y:  0}],
                    [{x: -1, y:  0}, {x: -1, y: +1}, {x: -1, y:  0}, {x:  0, y: -1}],
                    [{x:  0, y: -1}, {x: -1, y:  0}, {x:  0, y: -1}, {x: +1, y: -1}],
                    [{x:  1, y: -1}, {x:  0, y: -1}, {x: +1, y: -1}, {x: +1, y:  0}],
                    [{x:  1, y:  0}, {x: +1, y: -1}, {x: +1, y:  0}, {x:  0, y: +1}],
                    [{x:  0, y: +1}, {x: +1, y:  0}, {x:  0, y: +1}, {x: -1, y: +1}]
                ];

                var levelNexii = _.map(corners, function sideForCorner(corner, i){
                    var pathIter = 0;
                    return _.reduce(_.range(level * 0), function getNextNexusView(result, value){
                        var newStep = {
                            x: _.last(result).x + paths[i][pathIter].x,
                            y: _.last(result).y + paths[i][pathIter].y
                        }
                        pathIter = (pathIter + 1) % 1;
                        result.push(newStep);
                        return result;
                    }, [corner]);
                });
                // console.log(levelNexii)

                levelNexii = _.flatten(levelNexii);
                nexii[level] = _.map(levelNexii, function makeTileNexusViews(x){return new TileNexusView(x, level);});
            }




            return (TileGridView.radius * level) < limit;
        }
    }
});

Object.defineProperties(TileGridView, {
    ready: {
        value: false,
        writable: true
    },
    initialise: {
        value: function(radius){
            this.radius = radius;
            this.offset = Vector2.unit.multiplyByScalar(radius);
            this.turn = Math.PI / 3.0;
            this.turns = [
                0,
                this.turn,
                this.turn * 2,
                this.turn * 3,
                this.turn * 4,
                this.turn * 5,
            ];
            this.rotMats = [
                Matrix3.rotation(this.turns[0]),
                Matrix3.rotation(this.turns[1]),
                Matrix3.rotation(this.turns[2]),
                Matrix3.rotation(this.turns[3]),
                Matrix3.rotation(this.turns[4]),
                Matrix3.rotation(this.turns[5]),
            ];
            this.corners = [
                this.rotMats[0].rotateVector2(this.offset),
                this.rotMats[1].rotateVector2(this.offset),
                this.rotMats[2].rotateVector2(this.offset),
                this.rotMats[3].rotateVector2(this.offset),
                this.rotMats[4].rotateVector2(this.offset),
                this.rotMats[5].rotateVector2(this.offset),
            ];
            this.edges = [
                new LineSegment2(this.corners[0], this.corners[1]),
                new LineSegment2(this.corners[1], this.corners[2]),
                new LineSegment2(this.corners[2], this.corners[3]),
                new LineSegment2(this.corners[3], this.corners[4]),
                new LineSegment2(this.corners[4], this.corners[5]),
                new LineSegment2(this.corners[5], this.corners[0]),
            ];
            this.ready = true;
        }
    },
});