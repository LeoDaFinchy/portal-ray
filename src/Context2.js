var Context2 = function(context){
    this.context = context;
    this.transformStack = [];
};

exports["Context2"] = Context2;

Object.defineProperty(Context2.prototype, 'push', {
    value: function(transform)
    {
        transform.applyContextTransform(this.context);
        this.transformStack.push(transform);

        if(transform.parent && transform.parent != this.activeTransform)
        {
            console.warn("Applying a transform on top of one that isn't it's parent");
        }
    }
});

Object.defineProperty(Context2.prototype, 'pop', {
    value: function()
    {
        this.activeTransform.releaseContextTransform(this.context);
        return this.transformStack.pop();
    }
});

Object.defineProperty(Context2.prototype, 'activeTransform', {
    get: function()
    {
        return this.transformStack[this.transformStack.length - 1];
    }
});