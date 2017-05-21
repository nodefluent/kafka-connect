"use strict";

const {Producer} = require("sinek");

const Config = require("./../common/Config.js");

/**
 * starts poll process from datastore table to kafka topic
 */
class SourceConfig extends Config {

    constructor(config, Connector, Task){
        super(Connector, Task);
        this.config = config;
    }

    run(){

    }
}

module.exports = SourceConfig;