"use strict";

const Converter = require("./../common/Converter.js");

class SinkBaseConverter extends Converter {

    constructor(){
        super();
    }

    /**
     * from kafka message to connect data
     * @param message
     * @param callback
     */
    toConnectData(message, callback){

        if(typeof message.value === "string"){
            try {
                message.value = JSON.parse(message.value);
            } catch(error){
                //empty
            }
        }

        callback(null, message);
    }

    fromConnectData(){
        //empty
    }
}

module.exports = SinkBaseConverter;