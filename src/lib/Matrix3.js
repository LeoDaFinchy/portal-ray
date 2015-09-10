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

exports['Matrix3'] = Matrix3;

var Geometry = require('geometry');
var Vector2 = Geometry.Vector2;
var Matrix2 = require('./Matrix2.js').Matrix2;
var LineSegment2 = require('./LineSegment2.js').LineSegment2;

Object.defineProperties(Matrix3.prototype, {
    //  Get
    clone: {
        get:function(){
            return new Matrix3([
                this.m[0],
                  this.m[1],
                    this.m[2],
                this.m[3],
                  this.m[4],
                    this.m[5],
                this.m[6],
                  this.m[7],
                    this.m[8],
            ]);
        }
    },
    '_': {
        get: function(){return this.clone;}
    },
    determinant: {
        get: function(){
            return (this.m[0] * this.cofactor(0)) +
                (this.m[1] * this.cofactor(1)) +
                (this.m[2] * this.cofactor(2));
        }
    },
    inverse: {
        get: function(){
            var det = this.determinant;
            return new Matrix3([
                this.cofactor(0) / det,
                  this.cofactor(1) / det,
                    this.cofactor(2) / det,
                this.cofactor(3) / det,
                  this.cofactor(4) / det,
                    this.cofactor(5) / det,
                this.cofactor(6) / det,
                  this.cofactor(7) / det,
                    this.cofactor(8) / det
            ]).transpose;
        }
    },
    transpose: {
        get: function(){
            return new Matrix3([
                this.m[0],  this.m[3],  this.m[6],
                this.m[1],  this.m[4],  this.m[7],
                this.m[2],  this.m[5],  this.m[8]
            ]);
        }
    },
    //  Function
    applyMatrix3: {
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
    },
    transformVector2: {
        value: function(vector){
            return new Vector2((this.m[0] * vector.x) + (this.m[1] * vector.y) + this.m[2],(this.m[3] * vector.x) + (this.m[4] * vector.y) + this.m[5]);
        }
    },
    transformLineSegment2: {
        value: function(segment){
            return new LineSegment2(this.transformVector2(segment.a), this.transformVector2(segment.b));
        }
    },
    rotateVector2: {
        value: function(vector){
            return new Vector2((this.m[0] * vector.x) + (this.m[1] * vector.y),(this.m[3] * vector.x) + (this.m[4] * vector.y));
        }
    },
    getAtCoord: {
        value: function(coord){
            return this.m[Matrix3.indexFromCoord(coord)];
        }
    },
    setAtCoord: {
        value: function(coord, value){
            this.m[Matrix3.indexFromCoord(coord)] = value;
            return this;
        }
    },
    cofactor: {
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
    },
    scale: {
        value:function(factor){
            this.applyMatrix3(Matrix3.scale(factor));
            return this;
        }
    },
    translate: {
        value:function(vector){
            this.applyMatrix3(Matrix3.translation(vector));
            return this;
        }
    },
    rotate: {
        value:function(angle){
            this.applyMatrix3(Matrix3.rotation(angle));
            return this;
        }
    },
    shear: {
        value:function(factor){
            this.applyMatrix3(Matrix3.shear(factor));
            return this;
        }
    }
});

Object.defineProperties(Matrix3, {
    identity: {
        get: function(){
            return new Matrix3();
        }
    },
    coordFromIndex: {
        value: function(index){
            var col = index % 3;
            var row = (index - col) / 3.0;
            return new Vector2(col, row);
        }
    },
    indexFromCoord: {
        value: function(coord){
            return coord.x + (coord.y * 3.0);
        }
    },
    scale: {
        value: function(factor){
            return new Matrix3([
                factor.x, 0, 0,
                0, factor.y, 0,
                0, 0, 1,
            ]);
        }
    },
    translation: {
        value: function(vector){
            return new Matrix3([
                1, 0, vector.x,
                0, 1, vector.y,
                0, 0, 1,
            ]);
        }
    },
    rotation: {
        value: function(angle){
            return new Matrix3([
                Math.cos(angle), -Math.sin(angle), 0,
                Math.sin(angle), Math.cos(angle), 0,
                0, 0, 1,
            ]);
        }
    },
    shear: {
        value: function(factor){
            return new Matrix3([
                Math.cos(factor.y), -Math.sin(factor.x), 0,
                Math.sin(factor.y), Math.cos(factor.x), 0,
                0, 0, 1,
            ]);
        }
    },
    fromReferencePoints: {
        value: function(origin, x, y){
            x = x ? x : Vector2.x;
            y = y ? y : Vector2.y;
            var ab = x._.subtract(origin);
            var ac = y._.subtract(origin);
            return Matrix3.identity
                .translate(origin)
                .shear(new Vector2(Math.atan2(-ac.x, ac.y), Math.atan2(ab.y, ab.x)))
                .scale(new Vector2(ab.length, ac.length))
        }
    }
});
