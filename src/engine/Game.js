function Game(newGameKwargs)
{
    this.mapSize = newGameKwargs.mapSize || 20;
    this.seed = newGameKwargs.seed;
}

exports.Game = Game;