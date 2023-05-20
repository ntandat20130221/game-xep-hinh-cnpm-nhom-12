function range(start, end, inc) {
    inc = inc || 1;
    var array = [];
    for (var i = start; i < end; i += inc) {
        array.push(i);
    }
    return array;
}

Number.prototype.mod = function (n) {
    return ((this % n) + n) % n;
};

var rng = new function () {
    this.seed = 1;
    this.next = function () {
        return this.gen() / 2147483647;
    };
    this.gen = function () {
        return (this.seed = (this.seed * 16807) % 2147483647);
    };
}();