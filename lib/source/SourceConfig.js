"use strict";

const Promise = require("bluebird");
const {Producer} = require("sinek");
const async = require("async");

const Config = require("./../common/Config.js");

/**
 * starts poll process from datastore table to kafka topic
 */
class SourceConfig extends Config {

    constructor(config, Connector, Task, Converters = []){
        super(config, Connector, Task, Converters);
        this.config = config;

        this.producer = null;
        this.connector = null;
        this.task = null;
        this._intv = null;
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
            pollInterval: 5000
        }
         */

        this.producer = new Producer(
            this.config.kafka,
            [this.config.topic],
            this.config.partitions);

        return this.producer.connect().then(() => {
            return new Promise(resolve => {

                this.connector = new this.Connector();
                this.connector.start(this.config.connector, () => {
                    this.connector.taskConfigs(this.config.maxTasks, taskConfig => {

                        this.task = new this.Task();
                        this.task.start(taskConfig);

                        this._intv = setInterval(() => {
                            this.task.poll((error, records) => {

                                if(error){
                                    return super.emit("error", error);
                                }

                                async.map(records, (_record, callback) => {
                                    super.convertTo(_record, (error, record) => {

                                        if(error){
                                            super.emit("error", error);
                                            return callback();
                                        }

                                        this.producer
                                            .send(this.config.topic, record) //TODO refine writing of record
                                            .then(_ => callback())
                                            .catch(error => {
                                                super.emit("error", error);
                                                callback();
                                            });
                                    });
                                }, error => {
                                    super.emit("erro", error);
                                });
                            });
                        }, this.config.pollInterval || 5000);

                        resolve(true);
                    });
                });
            });
        });
    }

    stop(){
        clearInterval(this._intv);
        this.producer.close();
        this.task.stop();
        this.connector.stop();
    }
}

module.exports = SourceConfig;