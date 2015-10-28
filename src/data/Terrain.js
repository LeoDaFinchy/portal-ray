function Terrain(id, name){
    this.id = id;
    this.name = name;
}

exports.Terrain = Terrain

Object.defineProperties(Terrain, {
    id:{
        value: 0,
        writable: true
    }
});
