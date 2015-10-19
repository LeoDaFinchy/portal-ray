var Game = require('./engine/Game').Game

function App(){
    this.game = null;
    this.newGameKwargs = {
        mapSize: 100,
    }
}

exports.App = App;

Object.defineProperties(App.prototype, {
    settings: {
        value: {
            terrainTextureGenerationSize: 64,
        }
    },
    newGame: {
        value: function()
        {
            this.game = new Game(this.newGameKwargs);
        }
    }
})