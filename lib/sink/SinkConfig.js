"use strict";

const Promise = require("bluebird");
const {Consumer} = require("sinek");

const Config = require("./../common/Config.js");

/**
 * starts consume process from kafka topic to datastore table
 */
class SinkConfig extends Config {

    constructor(config, Connector, Task, Converters = [], consumer = null){
        super(config, Connector, Task, Converters);
        this.config = config;

        this.maxRetries = this.config.maxRetries || 3;
        this.awaitRetry = this.config.awaitRetry || 10;

        this.consumer = consumer;
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
             maxRetries: 3,
             awaitRetry: 10,
             waitOnError: false,
             haltOnError: false
         }
         */

        this.consumer = this.consumer ||
            new Consumer(this.config.topic, this.config.kafka);

        return this.consumer.connect().then(() => {
            return new Promise(resolve => {

                this.connector = new this.Connector();
                this.connector.start(this.config.connector, () => {
                    this.connector.taskConfigs(this.config.maxTasks, taskConfig => {

                        this.task = new this.Task();
                        this.task.start(taskConfig, () => {

                            this.consumer.consume((_message, callback) => {

                                super.convertFrom(_message, (error, message) => {

                                    if (error) {
                                        return super.emit("error", error);
                                    }

                                    this._putMessage(message, callback);
                                });
                            }).catch(error => super.emit("error", error));
                            resolve();
                        });
                    });
                });
            });
        });
    }

    _putMessage(message, callback, attempts = 0){
        attempts++;

        try {
            this.task.put([message], error => {

                if (error) {
                    return this._onPutFail(error, message, callback, attempts);
                }

                callback(null);
            });
        } catch(error){
            this._onPutFail(error, message, callback, attempts);
        }
    }

    _onPutFail(error, message, callback, attempts){
        super.emit("error", error);

        if(attempts > this.maxRetries){

            if(this.config.haltOnError){
                super.emit("error", new Error("halting because of retry error."));
                return this.stop();
            }

            if(this.config.waitOnError){
                super.emit("error", new Error("waiting because of retry error."));
                return; //never calls callback
            }

            return callback(error);
        }

        setTimeout(() => {
            this._putMessage(message, callback, attempts);
        }, this.awaitRetry);
    }

    stop(shouldCommit = false){
        clearInterval(this._intv);
        this.consumer.close(shouldCommit);
        this.consumer = null;
        this.task.stop();
        this.connector.stop();
    }
}

module.exports = SinkConfig;