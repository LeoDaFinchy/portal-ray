var Context2 = function(context){
    this.context = context;
    this.transformStack = [];
};

Object.defineProperty(Context2.prototype, 'push', {
    value: function(transform)
    {
        transform.applyContextTransform(this.context);
        this.transformStack.push(transform);
    }
});

Object.defineProperty(Context2.prototype, 'pop', {
    value: function(transform)
    {
        transform.releaseContextTransform(this.context);
        this.transformStack.pop();
    }
});

Object.defineProperty(Context2.prototype, 'activeTransform', {
    get: function()
    {
        return transformStack[transformStack.length - 1];
    }
});