"use strict";

const EventEmitter = require("events");
const async = require("async");

const Interface = require("./../utils/Interface.js");
const Connector = require("./../common/Connector.js");
const Task = require("./../common/Task.js");
const Converter = require("./Converter.js");

const CONNECTOR_FUNCTIONS = [
    "start",
    "taskConfigs",
    "stop"
];

const TASK_FUNCTIONS = [
    "start",
    "stop"
];

const ADD_TASK_FUNCTIONS = [
    "poll",
    "put"
];

const CONVERTER_FUNCTIONS = [
    "fromConnectData",
    "toConnectData"
];

class Config extends EventEmitter {

    constructor(config, Connector, Task, Converters) {
        super();

        this.config = config;

        this.Connector = Connector;
        this.Task = Task;
        this.Converters = Converters;
        this.composedToConverters = null;
        this.composedFromConverters = null;

        this._evaluate();
        super.on("error", () => {}); //dont throw
    }

    /**
     * js does not allow for interfaces
     * therefore we have to evaluate a few things
     * before running to give at least a little support
     * for connector developers
     * @private
     */
    _evaluate() {

        if (!(new this.Connector() instanceof Connector)) {
            throw new Error(`A Connector must inherit from SinkConnector or SourceConnector.`);
        }

        if (!(new this.Task() instanceof Task)) {
            throw new Error(`A Task must inherit from SinkTask or SourceTask.`);
        }

        const toConverters = [];
        const fromConverters = [];

        if (this.Converters.length > 0) {
            this.Converters.forEach(_Converter => {
                const converter = typeof _Converter === "object" ? _Converter : new _Converter();

                if (!(converter instanceof Converter)) {
                    throw new Error(`A Converter must inherit from Converter Base Class.`);
                }

                try {
                    Interface.validate(_Converter, CONVERTER_FUNCTIONS);
                } catch (error) {
                    throw new Error(`A Converter must have the following functions ${CONVERTER_FUNCTIONS.join(", ")}.`);
                }

                toConverters.push(converter.toConnectData.bind(converter));
                fromConverters.push(converter.fromConnectData.bind(converter));
            });

            toConverters.reverse();
            fromConverters.reverse();

            this.composedToConverters = async.compose.apply(async, toConverters);
            this.composedFromConverters = async.compose.apply(async, fromConverters);
        }

        try {
            Interface.validate(this.Connector, CONNECTOR_FUNCTIONS);
        } catch (error) {
            throw new Error(`A Connector must have the following functions ${CONNECTOR_FUNCTIONS.join(", ")}.`);
        }

        try {
            Interface.validate(this.Task, TASK_FUNCTIONS);
        } catch (error) {
            throw new Error(`A Task must have the following functions ${TASK_FUNCTIONS.join(", ")}.`);
        }

        let oneSet = false;

        try {
            Interface.validate(this.Task, [ADD_TASK_FUNCTIONS[0]]);
            oneSet = true;
        } catch (error) {
            //empty
        }

        try {
            Interface.validate(this.Task, [ADD_TASK_FUNCTIONS[1]]);
            oneSet = true;
        } catch (error) {
            //empty
        }

        if (!oneSet) {
            throw new Error(`A Task must have one of the following functions ${ADD_TASK_FUNCTIONS.join(", ")}.`);
        }
    }

    convertTo(message, callback) {

        if (!this.composedToConverters) {
            return callback(null, message);
        }

        this.composedToConverters(message, callback);
    }

    convertFrom(message, callback) {

        if (!this.composedFromConverters) {
            return callback(message);
        }

        this.composedFromConverters(message, callback);
    }

    run() {
        //empty
    }
}

module.exports = Config;