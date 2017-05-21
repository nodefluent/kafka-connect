"use strict";

const Task = require("./../common/Task.js");

/**
 * SourceTask is a Task that pulls records from another system for storage in Kafka.
 */
class SourceTask extends Task {

    constructor(){
        super();
    }

}

module.exports = SourceTask;