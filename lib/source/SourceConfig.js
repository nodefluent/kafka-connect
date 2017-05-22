"use strict";

const {Producer} = require("sinek");

const Config = require("./../common/Config.js");

/**
 * starts poll process from datastore table to kafka topic
 */
class SourceConfig extends Config {

    constructor(config, Connector, Task, Converters = []){
        super(config, Connector, Task, Converters);
        this.config = config;
    }

    run(){
        super.run();

        //TODO connect to producer

        const connector = new this.Connector();
        connector.start(this.config.connector);
        const taskConfig = connector.taskConfigs(this.config.maxTasks);

        const task = new this.Task();
        task.start(taskConfig);

        setInterval(() => {
            task.poll((error, records) => {
                //apply converters
                records.map(record => super.convertTo(record));
                //TODO write to kafka
            });
        }, 5000);
    }
}

module.exports = SourceConfig;