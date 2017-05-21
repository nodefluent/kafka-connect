"use strict";

const Interface = require("./../utils/Interface.js");
const Connector = require("./../common/Connector.js");
const Task = require("./../common/Task.js");

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

class Config {

    constructor(Connector, Task){
        this.Connector = Connector;
        this.Task = Task;

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
}

module.exports = Config;