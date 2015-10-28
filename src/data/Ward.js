function Ward(id, tile, position){
    this.id = id;
    this.tile = tile;
    // 0-5: sides, 6: centre
    this.position = position;
}

exports.Ward = Ward;

Object.defineProperties(Ward, {
    id:{
        value: 0,
        writable: true
    }
});
