"use strict";

class Record {

    constructor(){

        this.keySchema = null;
        this.key = null;
        this.valueSchema = null;
        this.value = null;
        this.partition = null;
        this.timestamp = null;
    }
}

module.exports = Record;