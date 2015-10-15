var Hex = require('./Hex');

function HexPortal(hex, exit){
    this.exit = exit;
    this.hex = hex;
    this.hex.portals[exit] = this;
    this.other = this;
}

exports.HexPortal = HexPortal;

Object.defineProperties(HexPortal.prototype, {
    mirror: {
        value: function(){
            if(this.other != this)
            {
                this.other = this;
                _.union(this.hex.grid.mirrors, [this]);
            }
        }
    },
    otherExit: {
        get: function(){
            return this.other.exit;
        }
    },
    otherHex: {
        get: function(){
            return this.other.hex;
        }
    },
    isMirror: {
        get: function(){
            return this == this.other;
        }
    },
    relativeRotation: {
        get: function(){
            return Hex.numBind(this.exit - this.otherExit + 3);
        }
    }
});

Object.defineProperties(HexPortal, {
    link: {
        value: function(a, b){
            a.other = b;
            b.other = a;
        }
    }
});
