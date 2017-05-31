"use strict";

const assert = require("assert");

class Interface {

    static getFunctionsOfClass(constructor, except = []) {
        return Object.getOwnPropertyNames(constructor).filter(function(p) {
            return typeof constructor[p] === "function" && except.indexOf(p) === -1;
        });
    }

    static checkFunctionsOfObject(object, functions) {
        functions.forEach(func => {
            assert.equal(!!object[func], true);
        });
    }

    static validate(reference, functions) {

        if (typeof reference === "object") {
            return Interface.checkFunctionsOfObject(reference, functions);
        }

        const funcs = Interface.getFunctionsOfClass(reference.prototype);
        functions.forEach(func => {
            const isSet = funcs.indexOf(func);
            assert.equal(isSet === -1, false);
        });
    }
}

module.exports = Interface;