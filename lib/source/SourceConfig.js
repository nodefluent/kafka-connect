"use strict";

const Promise = require("bluebird");
const { Producer } = require("sinek");
const async = require("async");

const Config = require("./../common/Config.js");
const SourceBaseConverter = require("./SourceBaseConverter.js");
const SourceRecord = require("./SourceRecord.js");

/**
 * starts poll process from datastore table to kafka topic
 */
class SourceConfig extends Config {

    constructor(config, Connector, Task, Converters = [], producer = null) {
        Converters.push(SourceBaseConverter); //push as it needs to run last
        super(config, Connector, Task, Converters);
        this.config = config;

        this.producer = producer;
        this.connector = null;
        this.task = null;
        this._intv = null;
    }

    run() {
        super.run();

        if (typeof this.config !== "object") {
            throw new Error("config must be a valid object.");
        }

        if (typeof this.config.kafka !== "object") {
            throw new Error("config.kafka must be a valid object.");
        }

        if (typeof this.config.connector !== "object") {
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

        this.producer = this.producer || new Producer(
            this.config.kafka, [this.config.topic],
            this.config.partitions);

        return this.producer.connect().then(() => {
            return new Promise((resolve, reject) => {

                this.connector = new this.Connector();
                this.connector.start(this.config.connector, error => {

                    if (error) {
                        return reject(error);
                    }

                    this.connector.taskConfigs(this.config.maxTasks, (error, taskConfig) => {

                        if (error) {
                            return reject(error);
                        }

                        this.task = new this.Task();
                        this.task.start(taskConfig, () => {

                            this._intv = setInterval(() => {
                                this.task.poll((error, records) => {

                                    if (error) {
                                        return super.emit("error", error);
                                    }

                                    if (!Array.isArray(records)) {
                                        return super.emit("error", new Error("records must be an array."));
                                    }

                                    let badRecords = false;
                                    records.forEach(record => {
                                        if (!(record instanceof SourceRecord)) {
                                            badRecords = true;
                                        }
                                    });

                                    if (badRecords) {
                                        return super.emit("error", new Error("records must inherit from SourceRecord."));
                                    }

                                    async.map(records, (_record, callback) => {
                                        super.convertFrom(_record, (error, record) => {

                                            if (error) {
                                                super.emit("error", error);
                                                return callback(null, false);
                                            }

                                            this.produce(record)
                                                .then(_ => callback(null, true))
                                                .catch(error => {
                                                    super.emit("error", error);
                                                    callback(null, false);
                                                });
                                        });
                                    }, error => {
                                        if (error) {
                                            super.emit("error", error);
                                        }
                                    });
                                });
                            }, this.config.pollInterval || 5000);

                            resolve(true);
                        });
                    });
                });
            });
        });
    }

    produce(record) {
        return this.producer.send(this.config.topic, record);
    }

    stop() {
        clearInterval(this._intv);
        this.producer.close();
        this.producer = null;
        this.task.stop();
        this.connector.stop();
    }
}

module.exports = SourceConfig;