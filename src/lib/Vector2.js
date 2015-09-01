var Vector2 = function(x,y){
    this.x = x || 0.0;
    this.y = y || 0.0;
};

exports['Vector2'] = Vector2;

Object.defineProperties(Vector2.prototype, {
    //  Get
    length: {
        get: function()
        {
            return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
        }
    },
    clone: {
        get: function()
        {
            return new Vector2(this.x, this.y);
        }
    },
    _: {
        get: function()
        {
            return this.clone;
        }
    },
    tangent: {
        get: function()
        {
            return this.clone.divideByScalar(this.length);
        }
    },
    normal: {
        get: function()
        {
            return new Vector2(-this.y, this.x).tangent;
        }
    },
    reciprocal: {
        get: function()
        {
            return Vector2.one.divideByVector2(this);
        }
    },
    angle: {
        get: function()
        {
            return Math.atan2(this.y, this.x);
        }
    },
    //  Function
    add: {
        value: function(other)
        {
            this.x = this.x + other.x;
            this.y = this.y + other.y;
            return this;
        }
    },
    subtract: {
        value: function(other)
        {
            this.x = this.x - other.x;
            this.y = this.y - other.y;
            return this;
        }
    },
    multiplyByScalar: {
        value: function(scalar)
        {
            this.x = this.x * scalar;
            this.y = this.y * scalar;
            return this;
        }
    },
    multiplyByVector2: {
        value: function(other)
        {
            this.x = this.x * other.x;
            this.y = this.y * other.y;
            return this;
        }
    },
    divideByScalar: {
        value: function(scalar)
        {
            this.x = this.x / scalar;
            this.y = this.y / scalar;
            return this;
        }
    },
    divideByVector2: {
        value: function(other)
        {
            this.x = this.x / other.x;
            this.y = this.y / other.y;
            return this;
        }
    },
});

Object.defineProperties(Vector2, {
    x: {
        get: function(){
            return new Vector2(1, 0);
        }
    },
    y: {
        get: function(){
            return new Vector2(0, 1);
        }
    },
    zero: {
        get:function(){
            return new Vector2(0, 0);
        }
    },
    one: {
        get:function(){
            return new Vector2(1, 1);
        }
    },
    unit: {
        get: function()
        {
            return this.x;
        }
    },
    crossProductMagnitude: {
        value: function(a, b)
        {
            return (a.x * b.y) - (a.y * b.x);
        }
    },
    fromObject: {
        value: function(obj)
        {
            return new Vector2(obj.x, obj.y);
        }
    }
});
