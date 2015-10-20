function Game()
{
}

exports.Game = Game;

Object.defineProperties(Game, {
    newGame: {
        value: function(newGameKwargs){
            var game = new Game();
            game.seed = newGameKwargs.seed || "New Game"
            game.mapSize = newGameKwargs.mapSize || 20;
        }
    }
})