"use strict";

const {Consumer} = require("sinek");

const Config = require("./../common/Config.js");

/**
 * starts consume process from kafka topic to datastore table
 */
class SinkConfig extends Config {

    constructor(config, Connector, Task, Converters = []){
        super(config, Connector, Task, Converters);
        this.config = config;
    }

    run(){
        super.run();

        //TODO connect consumer

        const connector = new this.Connector();
        connector.start(this.config.connector);
        const taskConfig = connector.taskConfigs(this.config.maxTasks);

        const task = new this.Task();
        task.start(taskConfig);

        /*
        consumer.drain((message, callback) => {
            task.put([super.convertFrom(message.value)]);
            //TODO pass message from kafka to task
            //TODO handle errors and retries
            callback();
        });
        */
    }
}

module.exports = SinkConfig;