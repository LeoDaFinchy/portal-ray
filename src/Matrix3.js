var Matrix3 = function()
{
    this.m = [
        1, 0, 0,
        0, 1, 0,
        0, 0, 1
    ];
};

Object.defineProperty(Matrix3, 'identity', {
    value: function(){
        return new Matrix3();
    }
});