var Portal = function(a, b){
    //  clear up any prexisting links
    if(a.portal){
        delete(a.portal.portal)
    }
    if(b.portal){
        delete(b.portal.portal)
    }
    this.a = a;
    this.b = b;
    a.portal = this;
    b.portal = this;
}

exports['Portal'] = Portal;


var Vector2 = require('../lib/Vector2.js').Vector2;
var Matrix3 = require('../lib/Matrix3.js').Matrix3;
var LineSegment2 = require('../lib/LineSegment2.js').LineSegment2;
var $ = require('jquery');

Object.defineProperties(Portal.prototype, {
    other: {
        value: function(one){
            return one === this.a ? this.b :
                    one === this.b ? this.a : null
        }
    },
    rotation: {
        value: function(front){
            back = this.other(front);
            var rotFront = Matrix3.rotation(front.offset.angle);
            var rotBack = Matrix3.rotation(back.offset.angle);
            return rotBack._
                .applyMatrix3(Matrix3.scale(new Vector2(-1.0, -1.0)))
                .applyMatrix3(rotFront.inverse)
        }
    },
    createExitRay: {
        value: function(intersect){
            var front = intersect.b;
            var back = intersect.b.portal.other(front);
            var matFront = Matrix3.fromReferencePoints(front.a, front.b, front.normal.add(front.a));
            var matBack = Matrix3.fromReferencePoints(back.a, back.b, back.normal.add(back.a));
            var matWarp = Matrix3.identity
                .applyMatrix3(matBack)
                .applyMatrix3(Matrix3.translation(new Vector2(1.0, 0.0)))
                .applyMatrix3(Matrix3.scale(new Vector2(-1.0, -1.0)))
                .applyMatrix3(matFront.inverse)
    
            var exitPoint = matWarp.transformVector2(intersect.x._);
    
            if($('#portalFunction').prop('checked'))
            {
                var rotFront = Matrix3.rotation(front.offset.angle);
                var rotBack = Matrix3.rotation(back.offset.angle);
                var rotWarp = Matrix3.identity
                    .applyMatrix3(rotBack)
                    .applyMatrix3(Matrix3.scale(new Vector2(-1.0, -1.0)))
                    .applyMatrix3(rotFront.inverse)
                var exitDir = rotWarp.transformVector2(intersect.a.offset).add(exitPoint);
            }
            else
            {
                var exitDir = matWarp.transformVector2(intersect.a.offset.add(intersect.x));
            }
            exitPoint.add(exitDir._.subtract(exitPoint).multiplyByScalar(0.000001));
            return new LineSegment2(exitPoint, exitDir);
        }
    }
});
