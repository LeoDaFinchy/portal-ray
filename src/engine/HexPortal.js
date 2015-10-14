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
