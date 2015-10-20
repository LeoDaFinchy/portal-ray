function Chaos(input, then){
    window.crypto.subtle.digest("sha-256", Chaos.encoder.encode(input)).then(function(x){
        then(Chaos.encoder.encode(Chaos.toHex(x)));
    })
}

exports.Chaos = Chaos;

Object.defineProperties(Chaos, {
    encoder:{
        value: new window.TextEncoder('utf-8')
    },
    toHex: {
        value: function(input){
            var codes = [];
            var data = new DataView(input);
            var zeros = '00000000'
            for (var i = 0; i < data.byteLength; i += 4) {
                var num = data.getUint32(i)
                var chars = num.toString(32)
                var paddedValue = (zeros + chars).slice(-zeros.length)
                codes.push(paddedValue);
            }
            return codes.join("");
        }
    }
});