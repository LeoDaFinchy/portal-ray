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

Object.defineProperty(Matrix2.prototype, 'applyMatrix2', {
    value: function(other){
        this.m = [
            (this.m[0] * other.m[0]) + (this.m[1] * other.m[2]),
              (this.m[0] * other.m[1]) + (this.m[1] * other.m[3]),
            (this.m[2] * other.m[0]) + (this.m[3] * other.m[2]),
              (this.m[2] * other.m[1]) + (this.m[3] * other.m[3]),
        ];
        return this;
    }
});
