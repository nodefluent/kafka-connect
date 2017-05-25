"use strict";

const Converter = require("./../common/Converter.js");

class SourceBaseConverter extends Converter {

    constructor(){
        super();
    }

    toConnectData(){
        //empty
    }

    /**
     * from connect data to kafka message
     * @param data
     * @param callback
     */
    fromConnectData(data, callback){

        //if no converter has serialised the SourceRecord yet
        //we have to to it as a last step before kafka production
        if(typeof data === "object"){
            data = JSON.stringify(data);
        }

        callback(null, data);
    }
}

module.exports = SourceBaseConverter;