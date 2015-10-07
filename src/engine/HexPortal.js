function HexPortal(hex, exit){
    this.exit = exit;
    this.hex = hex;
    this.hex.portals[exit] = this;
    this.other = null;
}

exports.HexPortal = HexPortal;

Object.defineProperties(HexPortal, {
    tidy: {
        value: function(){
            delete this.hex.portals[this.exit];
            delete other;
        }
    }
});
