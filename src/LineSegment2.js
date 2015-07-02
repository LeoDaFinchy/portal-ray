var LineSegment2 = function(a, b)
{
    this.a = a;
    this.b = b;
};

exports['LineSegment2'] = LineSegment2;

Object.defineProperties(LineSegment2.prototype, {
    offset:{
        get: function(){
            return this.b._.subtract(this.a);
        }
    },
    tangent:{
        get: function(){
            return this.offset.tangent;
        }
    },
    normal:{
        get: function(){
            return this.offset.normal;
        }
    },
    matrix:{
        get: function(){
            return Matrix3.translation(this.a)
            .rotate(Math.atan2(this.offset.y, this.offset.x))
            .scale(new Vector2(this.offset.length, 1))
            ;
        }
    }
});
