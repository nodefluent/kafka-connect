"use strict";

const Promise = require("bluebird");
const {Consumer} = require("sinek");

const Config = require("./../common/Config.js");

/**
 * starts consume process from kafka topic to datastore table
 */
class SinkConfig extends Config {

    constructor(config, Connector, Task, Converters = []){
        super(config, Connector, Task, Converters);
        this.config = config;

        this.consumer = null;
        this.connector = null;
        this.task = null;
    }

    run(){
        super.run();

        if(typeof this.config !== "object"){
            throw new Error("config must be a valid object.");
        }

        if(typeof this.config.kafka !== "object"){
            throw new Error("config.kafka must be a valid object.");
        }

        if(typeof this.config.connector !== "object"){
            throw new Error("config.connector must be a valid object.");
        }

        /*
         config = {
             kafka: {},
             topic: "topic",
             partitions: 30,
             maxTasks: 1,
             connector: {},
         }
         */

        this.consumer = new Consumer(this.config.topic, this.config.kafka);

        return this.consumer.connect().then(() => {
            return new Promise(resolve => {

                this.connector = new this.Connector();
                this.connector.start(this.config.connector, () => {
                    this.connector.taskConfigs(this.config.maxTasks, taskConfig => {

                        this.task = new this.Task();
                        this.task.start(taskConfig);

                        this.consumer.consume((_message, callback) => {

                            super.convertFrom(_message, (error, message) => {

                                if(error){
                                    return super.emit("error", error);
                                }

                                this.task.put([message], error => {

                                    //TODO pass message from kafka to task
                                    //TODO handle errors and retries

                                    callback();
                                });
                            });
                        }).catch(error => super.emit("error", error));
                        resolve();
                    });
                });
            });
        });
    }
}

module.exports = SinkConfig;