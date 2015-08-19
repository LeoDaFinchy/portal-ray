var _ = require('underscore')._;

var Shapes = {};

exports['Shapes'] = Shapes;

var Vector2 = require('./Vector2').Vector2;

Object.defineProperties(Shapes, {
    draw: {
        value: function(context, style){

            if(!style)
            {
                context.fill();
                context.stroke();
                return;
            }

            if(style === Shapes.styles.EDGELESS)
            {
                context.fill();
                return;
            }

            if(style === Shapes.styles.HOLLOW)
            {
                context.stroke();
                return;
            }
        }
    },
    line: {
        value: function(context, a, b, style){
            context.beginPath();
            context.moveTo(a.x, a.y);
            context.lineTo(b.x, b.y);
            this.draw(context, style);
        }
    },
    circle: {
        value: function(context, pt, radius, style){
            context.beginPath();
            context.arc(pt.x, pt.y, radius, 0, Math.PI * 2.0);
            this.draw(context, style);
        }
    },
    dots: {
        value: function(context, pts, radius, style){
            _.each(pts, function(pt){
                context.beginPath();
                context.arc(pt.x, pt.y, radius, 0, Math.PI * 2.0);
                this.draw(context, style);
            })
        }
    },
    linePath: {
        value: function(context, pts, style){
            context.beginPath();
            context.moveTo(pts[0].x, pts[0].y);
            _.each(positions.slice(1), function(pos){
                context.lineTo(pos.x, pos.y);
            })
            this.draw(context, style);
        }
    },
    polygon: {
        value: function(context, pts, style){
            context.beginPath();
            context.moveTo(pts[0].x, pts[0].y);
            _.each(pts.slice(1), function(pt){
                context.lineTo(pt.x, pt.y);
            })
            context.lineTo(pts[0].x, pts[0].y);
            this.draw(context, style);
        }
    },
    styles: {
        value: {
            FULL: 0,
            HOLLOW: 1,
            EDGELESS: 2
        }
    }
});
