var mixin = function(){
    var constructors = arguments;
    var obj = {};
    for(var c = 0; c < constructors.length; c++)
    {
        constructor = constructors[c];
        constructor.call(obj);
    }
    return obj;
};

Drivable = function(){
    this.wheel = "go";
    this.drive = function(){
        return("broom!");
    };
};

Enterable = function(){
    this.door = "yes";
    this.enter = function(){
        return("I'm in!");
    };
};

Car = function(){
    this.vehicle = "totally";
    this.beUseful = function()
    {
        return this.enter() + this.drive();
    };
};

Car.prototype = mixin(Drivable, Enterable);

car = new Car();

console.log(car);
console.log(car.drive());
console.log(car.enter());
console.log(car.door);
console.log(car.wheel);
console.log(car.vehicle);
console.log(car.beUseful());
