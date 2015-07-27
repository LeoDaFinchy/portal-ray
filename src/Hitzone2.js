var _ = require('underscore')._;

var Hitzone2 = function(visualiser){
    this.visualiser = visualiser || new Visualiser2();
    this.downListeners = [];
};

exports['Hitzone2'] = Hitzone2;

var Vector2 = require('./Vector2').Vector2;

Object.defineProperties(Hitzone2.prototype,{
    checkHit: {
        value: function (context, event) {
            var coords = new Vector2(event.clientX, event.clientY)
                .subtract(new Vector2(event.target.offsetLeft, event.target.offsetTop));
            this.visualiser.draw(null, context);
            var hit = context.isPointInPath(coords.x, coords.y);

            if(hit){
                if(event.type === "mousedown" || event.type === "touchstart")
                {
                    _.each(this.downListeners, function(x){x(event);});
                }
            }
        }
    },
    onDown: {
        value: function(listener)
        {
            this.downListeners.push(listener);
        }
    }
});