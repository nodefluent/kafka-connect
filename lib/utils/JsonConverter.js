"use strict";

const { Converter } = require("./../common/Converter.js");

class JsonConverter extends Converter {

    fromConnectData(data, callback) {
        callback(null, data); //no action required, as we produce objects directly
    }

    toConnectData(message, callback) {

        try {
            message.value = JSON.parse(message.value);
        } catch (error) {
            return callback(error);
        }

        callback(null, message);
    }
}

module.exports = JsonConverter;