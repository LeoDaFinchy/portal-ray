var Game = require('./engine/Game').Game

function App(){
    this.game = null;
}

exports.App = App;

Object.defineProperties(App.prototype, {
    settings: {
        value: {
            terrainTextureGenerationSize: 64,
            newGameMapSize: 100,
            newGameSeed: ""
        }
    },
    newGame: {
        value: function()
        {
            this.game = Game(this.newGameKwargs);
        }
    },
    newGameSeed: {
        value: function(newSeed){
            this.settings.newGameSeed = newSeed
        }
    },
    newGameKwargs: {
        get: function(){
            return {
                mapSize: this.settings.newGameMapSize,
                seed: this.settings.newGameSeed
            }
        }
    }
})