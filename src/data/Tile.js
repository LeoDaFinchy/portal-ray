var _ = require('underscore');

var Ward = require('./Ward').Ward;

function Tile(id, terrain){
    this.id = id;
    this.terrain = terrain;
    this.wards = [];
}

exports.Tile = Tile

Object.defineProperties(Tile.prototype, {
    generateWards: {
        value: function(){
            this.wards = _.map(_.range(7), function(pos){
                return new Ward(Ward.id++, this, pos);
            });
        }
    }
})

Object.defineProperties(Tile, {
    id: {
        value: 0,
        writable: true
    }
})