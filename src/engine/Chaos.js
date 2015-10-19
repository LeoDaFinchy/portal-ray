function Chaos(input, then){
    window.crypto.subtle.digest("sha-256", Chaos.encoder.encode(input)).then(function(x){
        then(Chaos.encoder.encode(Chaos.decoder.decode(x)));
    })
}

exports.Chaos = Chaos;

Object.defineProperties(Chaos, {
    encoder:{
        value: new window.TextEncoder()
    },
    decoder:{
        value: new window.TextDecoder()
    }
});