var $ = require('jquery');
var Kinetic = require('kinetic');

var Applet = function(containerId){

}

exports['Applet'] = Applet;

Object.defineProperties(Applet.prototype, {
    initialise: {
        value: function(containerId){
            this.canvasContainer = $('#' + containerId);

            this.stage = new Kinetic.Stage({
                width: this.canvasContainer.width(),
                height: this.canvasContainer.height(),
                container: containerId,
            });

            this.backgroundLayer = new Kinetic.Layer({
                width: this.canvasContainer.width(),
                height: this.canvasContainer.height(),
            });
            this.stage.add(this.backgroundLayer);

            this.layers = [this.backgroundLayer];
            this.namedLayers = {
                "Background": this.backgroundLayer
            }
        }
    },
    addLayer: {
        value: function(name){
            var newLayer = new Kinetic.Layer({
                width: this.canvasContainer.width(),
                height: this.canvasContainer.height(),
            });
            this.layers.push(newLayer);
            if(name)
            {
                this.namedLayers[name] = newLayer;
            }
            this.stage.add(newLayer);
            return newLayer;
        }
    }
});