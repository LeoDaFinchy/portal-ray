var _ = require('underscore');

var Geometry = require('geometry');
var Vector2 = Geometry.Vector2;
var Matrix3 = Geometry.Matrix3;
var LineSegment2 = Geometry.LineSegment2;

function TileNexusView(coord){
    this.coord = coord;
    this.position = TileGridView.corners[0]._.multiplyByScalar(this.coord.x).add(TileGridView.corners[1]._.multiplyByScalar(this.coord.y));
    console.log(this.position);
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
            this.context.save();
            this.context.translate(400, 300);
            _.each(_.flatten(this.nexii), function drawNexus(nexus){
                this.context.strokeStyle = "black";
                this.context.lineWidth = 1.0;
                this.context.beginPath()
                this.context.arc(nexus.position.x, nexus.position.y, 10, 0, Math.PI * 2);
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
            // console.log(level, limit)
            var levelNexii = [];
            var inOrOut = level % 2;
            var rad = Math.floor(level * 1.5) + 1;
            var corners = [
                new TileNexusView({x: rad, y: inOrOut}),
                new TileNexusView({x: -inOrOut, y: rad + inOrOut}),
                new TileNexusView({x: -rad - inOrOut, y: rad}),
                new TileNexusView({x: -rad, y: -inOrOut}),
                new TileNexusView({x: inOrOut, y: -rad - inOrOut}),
                new TileNexusView({x: rad + inOrOut, y: -rad}),
            ];

            var sides = _.map(corners, function(corner, i){
                var side = [];
                if(inOrOut)
                {
                    side.push(new TileNexusView({x: corner.coord.x - 1, y:corner.coord.y + 1}));
                }
                return side;
            });


            levelNexii = _.zip(corners, sides);
            nexii[level] = _.flatten(levelNexii);


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