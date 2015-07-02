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

            var a = this.a.a;
            var b = this.a.b;
            var c = this.b.a;
            var d = this.b.b;

            this.x = new Vector2(
                (
                    (
                        (
                            ((a.x*b.y)-(a.y*b.x)) * (c.x-d.x)) -
                            ((a.x-b.x) * ((c.x*d.y)-(c.y*d.x))
                        )
                    )/(
                        (((a.x-b.x)*(c.y-d.y)) - ((a.y-b.y)*(c.x-d.x))))
                ),(
                    (
                        (
                            ((a.x*b.y)-(a.y*b.x)) * (c.y-d.y)) -
                            ((a.y-b.y) * ((c.x*d.y)-(c.y*d.x))
                        )
                    )/(
                        (((a.x-b.x)*(c.y-d.y)) - ((a.y-b.y)*(c.x-d.x)))
                    )
                )
            );

            this.fractionA = this.a.offset.x > this.a.offset.y?
                ((this.x.x - a.x) / this.a.offset.x):
                ((this.x.y - a.y) / this.a.offset.y);
            this.fractionB = this.b.offset.x > this.b.offset.y?
                ((this.x.x - c.x) / this.b.offset.x):
                ((this.x.y - c.y) / this.b.offset.y);

            return this;
        }
    }
});