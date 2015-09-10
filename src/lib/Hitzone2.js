var _ = require('underscore')._;

var Hitzone2 = function(visualiser, visualiserTarget){
    this.visualiser = visualiser || new Visualiser2();
    this.visualiserTarget = visualiserTarget;
    this.downListeners = [];
    this.dragListeners = [];
};

exports['Hitzone2'] = Hitzone2;

var Geometry = require('geometry');
var Vector2 = Geometry.Vector2;

Object.defineProperties(Hitzone2.prototype,{
    checkHit: {
        value: function (context, event) {
            var coords = new Vector2(event.clientX, event.clientY)
                .subtract(new Vector2(event.target.offsetLeft, event.target.offsetTop));
            var hit = this.visualiser.draw(this.visualiserTarget, context, coords);

            if(hit){
                if(event.type === "mousedown" || event.type === "touchstart")
                {
                    _.each(this.downListeners, function(x){x(event);});
                }

                if((event.type === "mousemove" && event.buttons & 1) || event.type === "touchmove")
                {
                    _.each(this.dragListeners, function(x){x(event);});
                }
            }
        }
    },
    onDown: {
        value: function(listener)
        {
            this.downListeners.push(listener);
        }
    },
    onDrag: {
        value: function(listener)
        {
            this.dragListeners.push(listener);
        }
    }
});