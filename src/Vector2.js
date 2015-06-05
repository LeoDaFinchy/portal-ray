var Vector2 = function(x,y){
    this.x = x || 0.0;
    this.y = y || 0.0;
};

Object.defineProperty(Vector2.prototype, 'add', {
    value: function(other)
    {
        this.x = this.x + other.x;
        this.y = this.y + other.y;
        return this;
    }
});

Object.defineProperty(Vector2.prototype, 'subtract', {
    value: function(other)
    {
        this.x = this.x - other.x;
        this.y = this.y - other.y;
        return this;
    }
});

Object.defineProperty(Vector2.prototype, 'multiplyByScalar', {
    value: function(scalar)
    {
        this.x = this.x * scalar;
        this.y = this.y * scalar;
        return this;
    }
});

Object.defineProperty(Vector2.prototype, 'multiplyByVector2', {
    value: function(other)
    {
        this.x = this.x * other.x;
        this.y = this.y * other.y;
        return this;
    }
});

Object.defineProperty(Vector2.prototype, 'divideByScalar', {
    value: function(scalar)
    {
        this.x = this.x / scalar;
        this.y = this.y / scalar;
        return this;
    }
});

Object.defineProperty(Vector2.prototype, 'divideByVector2', {
    value: function(other)
    {
        this.x = this.x / other.x;
        this.y = this.y / other.y;
        return this;
    }
});

Object.defineProperty(Vector2.prototype, 'length', {
    get: function()
    {
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
    }
});

Object.defineProperty(Vector2.prototype, 'clone', {
    get: function()
    {
        return new Vector2(this.x, this.y);
    }
});

Object.defineProperty(Vector2.prototype, '_', {
    get: function()
    {
        return this.clone;
    }
});

Object.defineProperty(Vector2.prototype, 'tangent', {
    get: function()
    {
        return this.clone.divideByScalar(this.length);
    }
});

Object.defineProperty(Vector2.prototype, 'normal', {
    get: function()
    {
        return new Vector2(this.y, -this.x).tangent;
    }
});

Object.defineProperty(Vector2, 'x', {
    get: function(){
        return new Vector2(1, 0);
    }
});

Object.defineProperty(Vector2, 'y', {
    get: function(){
        return new Vector2(0, 1);
    }
});

Object.defineProperty(Vector2, 'zero', {
    get:function(){
        return new Vector2(0, 0);
    }
});

Object.defineProperty(Vector2, 'one', {
    get:function(){
        return new Vector2(1, 1);
    }
});

Object.defineProperty(Vector2, 'unit', {
    get: function()
    {
        return this.x;
    }
});

exports['Vector2'] = Vector2;
