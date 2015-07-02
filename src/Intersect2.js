var Intersect2 = function(a, b)
{
    this.a = a;
    this.b = b;
    this.x = null;
    this.fractionA = null;
    this.fractionB = null;
    this.angle = null;
};

exports["Intersect2"] = Intersect2;

var Vector2 = require('./Vector2').Vector2;

Object.defineProperties(Intersect2.prototype, {
    solve: {
        value: function(){

            this.angle = Math.asin(Vector2.crossProductMagnitude(this.a, this.b));

            if(this.angle === 0)
            {
                this.x = null;
                this.fractionA = null;
                this.fractionB = null;
                return this;
            }

            this.x = new Vector2(
                (
                    (
                        (
                            ((a.a.x*a.b.y)-(a.a.y*a.b.x)) * (b.a.x-b.b.x)) -
                            ((a.a.x-a.b.x) * ((b.a.x*b.b.y)-(b.a.y*b.b.x))
                        )
                    )/(
                        (((a.a.x-a.b.x)*(b.a.y-b.b.y)) - ((a.a.y-a.b.y)*(b.a.x-b.b.x))))
                ),(
                    (
                        (
                            ((a.a.x*a.b.y)-(a.a.y*a.b.x)) * (b.a.y-b.b.y)) -
                            ((a.a.y-a.b.y) * ((b.a.x*b.b.y)-(b.a.y*b.b.x))
                        )
                    )/(
                        (((a.a.x-a.b.x)*(b.a.y-b.b.y)) - ((a.a.y-a.b.y)*(b.a.x-b.b.x)))
                    )
                )
            );

            this.fractionA = a.offset.x > a.offset.y?
                ((x.x - a.a.x) / a.offset.x):
                ((x.y - a.a.y) / a.offset.y);
            this.fractionB = b.offset.x > b.offset.y?
                ((x.x - b.a.x) / b.offset.x):
                ((x.y - b.a.y) / b.offset.y);

            return this;
        }
    }
});