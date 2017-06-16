"use strict";

const Converter = require("./../common/Converter.js");

class InjectableConverter extends Converter {

    constructor(etl) {
        super();
        this.etl = etl;
    }

    fromConnectData(data, callback) {
        callback(null, data); //no action required, as we produce objects directly
    }

    toConnectData(message, callback) {
        this.etl(message, callback);
    }
}

class ConverterFactory {

    /**
     * Pass in the JSON Schema of the Sequelize Table
     * and a function that receives the message value
     * calls a callback(null, {}) with the transformed value
     * in form of the table that is defined by the sequelize schema
     * returns an instance of a Converter that can be passed into the 
     * Converter-Array param of the SinkConfig
     * @param {*} sequelizeSchema 
     * @param {*} etlFunction 
     * @return {}
     */
    static createSinkSchemaConverter(sequelizeSchema, etlFunction) {

        if (typeof sequelizeSchema !== "object") {
            throw new Error("sequelizeSchema must be an object.");
        }

        if (typeof etlFunction !== "function") {
            throw new Error("etlFunction must be a function.");
        }

        return new InjectableConverter(ConverterFactory._getSinkSchemaETL(sequelizeSchema, etlFunction));
    }

    static _getSinkSchemaETL(sequelizeSchema, etlFunction) {

        const schema = sequelizeSchema;
        const etl = etlFunction;

        return function(message, callback) {

            etlFunction(message.value, (error, messageValue) => {

                if (error) {
                    return callback(error);
                }

                message.value = {
                    key: message.key,
                    keySchema: null,
                    value: messageValue,
                    valueSchema: Object.assign({}, schema),
                    partition: message.partition,
                    timestamp: new Date().toISOString(),
                    topic: message.topic
                };

                callback(null, message);
            });
        };
    }
}

module.exports = ConverterFactory;