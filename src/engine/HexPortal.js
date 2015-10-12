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
            other = this;
        }
    }
});
