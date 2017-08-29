"use strict";

const Promise = require("bluebird");
const { Producer, NProducer } = require("sinek");
const async = require("async");

const Config = require("./../common/Config.js");
const SourceBaseConverter = require("./SourceBaseConverter.js");
const SourceRecord = require("./SourceRecord.js");

/**
 * starts poll process from datastore table to kafka topic
 */
class SourceConfig extends Config {

    constructor(config, Connector, Task, Converters = [], producer = null) {

        if (Converters.length <= 0) {
            Converters.push(SourceBaseConverter);
        }

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

        if(this.config.kafka.noptions && typeof this.config.kafka.noptions === "object"){
            return this._runNative();
        }

        this.producer = this.producer || new Producer(
            this.config.kafka, [this.config.topic],
            this.config.partitions);

        //listen for parent class stats requests
        super.on("get-stats", () => {
            super.emit("producer-stats", this.producer.getStats());
        });

        this.producer.on("error", error => super.emit("error", error));

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

                        if (!taskConfig || typeof taskConfig !== "object") {
                            return reject(new Error("taskConfig must be a valid object."));
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
                                        super.emit("inc", true);
                                        //record must exist (null values will be skipped)
                                        if (record !== null && !(record instanceof SourceRecord)) {
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

                                            //simply return on null message
                                            if (record === null || record === "null") {
                                                super.emit("empty", true);
                                                return process.nextTick(() => {
                                                    callback(null);
                                                });
                                            }

                                            this.produce(record)
                                                .then(_ => {
                                                    super.emit("out", true);
                                                    callback(null, true);
                                                })
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
                        }, this);
                    });
                }, this); //passing config as optional reference
            });
        });
    }

    _runNative(){

        this.producer = this.producer || new NProducer(
            this.config.kafka, null,
            this.config.partitions);

        //listen for parent class stats requests
        super.on("get-stats", () => {
            super.emit("producer-stats", this.producer.getStats());
        });

        this.producer.on("error", error => super.emit("error", error));

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

                        if (!taskConfig || typeof taskConfig !== "object") {
                            return reject(new Error("taskConfig must be a valid object."));
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
                                        super.emit("inc", true);
                                        //record must exist (null values will be skipped)
                                        if (record !== null && !(record instanceof SourceRecord)) {
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

                                            //simply return on null message
                                            if (record === null || record === "null") {
                                                super.emit("empty", true);
                                                return process.nextTick(() => {
                                                    callback(null);
                                                });
                                            }

                                            this.produce(record)
                                                .then(_ => {
                                                    super.emit("out", true);
                                                    callback(null, true);
                                                })
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
                        }, this);
                    });
                }, this); //passing config as optional reference
            });
        });
    }

    produce(record) {

        if (!this.config.produceKeyed) {
            return this.producer.send(this.config.topic, record);
        }

        super.emit("produced", record.key);

        return this.producer.buffer(
            this.config.topic,
            record.key,
            record,
            this.config.produceCompressionType || 0
        );
    }

    stop() {

        if (this._intv) {
            clearInterval(this._intv);
        }

        if (this.producer) {
            this.producer.close();
            this.producer = null;
        }

        if (this.task) {
            this.task.stop();
        }

        if (this.connector) {
            this.connector.stop();
        }

        super.close();
    }
}

module.exports = SourceConfig;