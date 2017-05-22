"use strict";

const Interface = require("./../utils/Interface.js");
const Connector = require("./../common/Connector.js");
const Task = require("./../common/Task.js");
const Converter = require("./../utils/Converter.js");

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

class Config {

    constructor(config, Connector, Task, Converters){

        this.config = config;

        this.Connector = Connector;
        this.Task = Task;
        this.Converters = Converters;
        this.converters = [];

        this._evaluate();
    }

    /**
     * js does not allow for interfaces
     * therefore we have to evaluate a few things
     * before running to give at least a little support
     * for connector developers
     * @private
     */
    _evaluate(){

        if(!(new this.Connector() instanceof Connector)){
            throw new Error(`A Connector must inherit from SinkConnector or SourceConnector.`);
        }

        if(!(new this.Task() instanceof Task)){
            throw new Error(`A Task must inherit from SinkTask or SourceTask.`);
        }

        if(this.Converters.length > 0){
            this.Converters.forEach(_Converter => {
                const converter = new _Converter();

                if(!(converter instanceof Converter)){
                    throw new Error(`A Converter must inherit from Converter Base Class.`);
                }

                try {
                    Interface.validate(_Converter, CONVERTER_FUNCTIONS);
                } catch(error){
                    throw new Error(`A Converter must have the following functions ${CONVERTER_FUNCTIONS.join(", ")}.`);
                }

                this.converters.push(converter);
            });
            this.converters.reverse();
        }

        try {
            Interface.validate(this.Connector, CONNECTOR_FUNCTIONS);
        } catch(error){
            throw new Error(`A Connector must have the following functions ${CONNECTOR_FUNCTIONS.join(", ")}.`);
        }

        try {
            Interface.validate(this.Task, TASK_FUNCTIONS);
        } catch(error){
            throw new Error(`A Task must have the following functions ${TASK_FUNCTIONS.join(", ")}.`);
        }

        let oneSet = false;

        try {
            Interface.validate(this.Task, [ADD_TASK_FUNCTIONS[0]]);
            oneSet = true;
        } catch(error){
            //empty
        }

        try {
            Interface.validate(this.Task, [ADD_TASK_FUNCTIONS[1]]);
            oneSet = true;
        } catch(error){
            //empty
        }

        if(!oneSet){
            throw new Error(`A Task must have one of the following functions ${ADD_TASK_FUNCTIONS.join(", ")}.`);
        }
    }

    convertTo(message){

        if(this.converters.length <= 0){
            return message;
        }

        for(let i = 0; i < this.converters.length; i++){
            message = this.converters[i].toConnectData(message);
        }

        return message;
    }

    convertFrom(message){

        if(this.converters.length <= 0){
            return message;
        }

        for(let i = 0; i < this.converters.length; i++){
            message = this.converters[i].fromConnectData(message);
        }

        return message;
    }

    run(){
        //empty
    }
}

module.exports = Config;