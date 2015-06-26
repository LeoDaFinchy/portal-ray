var Matrix2 = function(initial)
{
    if(initial && initial.length === 4)
    {
        this.m = initial;
    }
    else
    {
        this.m = [
            1, 0,
            0, 1,
        ];
    }
};

exports["Matrix2"] = Matrix2;

var Vector2 = require('./Vector2.js').Vector2;

Object.defineProperties(Matrix2.prototype, {
    //  Get
    'determinant': {
        get: function(){
            return (this.m[0] * this.m[3]) - (this.m[1] * this.m[2]);
        }
    },
    'transpose': {
        get: function(){
            return new Matrix2([
                this.m[0],
                this.m[2],
                this.m[1],
                this.m[3]
            ]);
        }
    },
    'inverse': {
        get: function(){
            return new Matrix2([
                this.m[0],
                -this.m[1],
                -this.m[2],
                this.m[3]
            ]);
        }
    },
    //  Function
    'applyMatrix2': {
        value: function(other){
            this.m = [
                (this.m[0] * other.m[0]) + (this.m[1] * other.m[2]),
                  (this.m[0] * other.m[1]) + (this.m[1] * other.m[3]),
                (this.m[2] * other.m[0]) + (this.m[3] * other.m[2]),
                  (this.m[2] * other.m[1]) + (this.m[3] * other.m[3]),
            ];
            return this;
        }
    },
    'getAtCoord': {
        value: function(coord){
            return this.m[Matrix3.indexFromCoord(coord)];
        }
    },
    'setAtCoord': {
        value: function(coord, value){
            this.m[Matrix3.indexFromCoord(coord)] = value;
            return this;
        }
    },
});

Object.defineProperties(Matrix2, {
    'coordFromIndex': {
        value: function(index){
            var col = index % 2;
            var row = (index - col) / 2.0;
            return new Vector2(col, row);
        }
    },
    'indexFromCoord': {
        value: function(coord){
            return coord.x + (coord.y * 2.0);
        }
    },
});
