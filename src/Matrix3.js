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
var Matrix2 = require('./Matrix2.js').Matrix2;

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

Object.defineProperty(Matrix3.prototype, 'cofactor', {
    value: function(index){
        var coord = Matrix3.coordFromIndex(index);
        var xs = [0, 1, 2];
        var ys = [0, 1, 2];
        xs.splice(coord.x, 1);
        ys.splice(coord.y, 1);
        var det = new Matrix2([
            this.getAtCoord(new Vector2(xs[0], ys[0])),
              this.getAtCoord(new Vector2(xs[1], ys[0])),
            this.getAtCoord(new Vector2(xs[0], ys[1])),
              this.getAtCoord(new Vector2(xs[1], ys[1]))
        ]).determinant;
        
        return ((coord.x + coord.y) % 2) === 0 ? det : -det;
    }
});

Object.defineProperty(Matrix3.prototype, 'determinant', {
    get: function(){
        return this.cofactor(0) + this.cofactor(1) + this.cofactor(2);
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
