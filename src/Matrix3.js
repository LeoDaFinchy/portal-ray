var Matrix3 = function(initial)
{
    if(initial && initial.length === 9)
    {
        this.m = initial;
    }
    else
    {
        this.m = [
            1, 0, 0,
            0, 1, 0,
            0, 0, 1
        ];
    }
};

var Vector2 = require('./Vector2.js').Vector2;

Object.defineProperty(Matrix3.prototype, 'applyMatrix3', {
    value: function(other){
        this.m = [
            (this.m[0] * other.m[0]) + (this.m[1] * other.m[3]) + (this.m[2] * other.m[6]),
              (this.m[0] * other.m[1]) + (this.m[1] * other.m[4]) + (this.m[2] * other.m[7]),
                (this.m[0] * other.m[2]) + (this.m[1] * other.m[5]) + (this.m[2] * other.m[8]),
            (this.m[3] * other.m[0]) + (this.m[4] * other.m[3]) + (this.m[5] * other.m[6]),
              (this.m[3] * other.m[1]) + (this.m[4] * other.m[4]) + (this.m[5] * other.m[7]),
                (this.m[3] * other.m[2]) + (this.m[4] * other.m[5]) + (this.m[5] * other.m[8]),
            (this.m[6] * other.m[0]) + (this.m[7] * other.m[3]) + (this.m[8] * other.m[6]),
              (this.m[6] * other.m[1]) + (this.m[7] * other.m[4]) + (this.m[8] * other.m[7]),
                (this.m[6] * other.m[2]) + (this.m[7] * other.m[5]) + (this.m[8] * other.m[8])
        ];
        return this;
    }
});

Object.defineProperty(Matrix3, 'coordFromIndex', {
    value: function(index){
        var col = index % 3;
        var row = (index - col) / 3.0;
        return new Vector2(col, row);
    }
});

Object.defineProperty(Matrix3, 'indexFromCoord', {
    value: function(coord){
        return coord.x + (coord.y * 3.0);
    }
});

Object.defineProperty(Matrix3.prototype, 'getAtCoord', {
    value: function(coord){
        return this.m[Matrix3.indexFromCoord(coord)];
    }
});

Object.defineProperty(Matrix3.prototype, 'setAtCoord',{
    value: function(coord, value){
        this.m[Matrix3.indexFromCoord(coord)] = value;
        return this;
    }
});

Object.defineProperty(Matrix3.prototype, 'transpose', {
    get: function(){
        return new Matrix3([
            this.m[0],  this.m[3],  this.m[6],
            this.m[1],  this.m[4],  this.m[7],
            this.m[2],  this.m[5],  this.m[8]
        ]);
    }
});

Object.defineProperty(Matrix3, 'identity', {
    value: function(){
        return new Matrix3();
    }
});
