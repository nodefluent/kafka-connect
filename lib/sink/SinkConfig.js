"use strict";

const {Consumer} = require("sinek");

const Config = require("./../common/Config.js");

/**
 * starts consume process from kafka topic to datastore table
 */
class SinkConfig extends Config {

    constructor(config, Connector, Task){
        super(Connector, Task);
        this.config = config;
    }

    run(){

    }
}

module.exports = SinkConfig;