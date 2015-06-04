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

exports['Vector2'] = Vector2;
