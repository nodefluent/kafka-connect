"use strict";

const assert = require("assert");

class Interface {

    static getFunctionsOfObject(constructor, except = []){
        return Object.getOwnPropertyNames(constructor).filter(function (p) {
            return typeof constructor[p] === "function" && except.indexOf(p) === -1;
        });
    }

    static validate(reference, functions){
        const funcs = Interface.getFunctionsOfObject(reference.prototype);
        functions.forEach(func => {
            const isSet = funcs.indexOf(func);
            assert.equal(isSet === -1, false);
        });
    }
}

module.exports = Interface;