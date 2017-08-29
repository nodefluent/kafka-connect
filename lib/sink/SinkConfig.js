"use strict";

const Promise = require("bluebird");
const { Consumer, NConsumer } = require("sinek");

const Config = require("./../common/Config.js");
const SinkBaseConverter = require("./SinkBaseConverter.js");
const SinkRecord = require("./SinkRecord.js");

/**
 * starts consume process from kafka topic to datastore table
 */
class SinkConfig extends Config {

    constructor(config, Connector, Task, Converters = [], consumer = null) {

        if (Converters.length <= 0) {
            Converters.unshift(SinkBaseConverter);
        }

        super(config, Connector, Task, Converters);
        this.config = config;

        this.maxRetries = this.config.maxRetries || 3;
        this.awaitRetry = this.config.awaitRetry || 10;

        this.consumer = consumer;
        this.connector = null;
        this.task = null;
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

        if (!this.config.kafka.options) {
            this.config.kafka.options = {};
        }

        this.config.kafka.options.autoCommit = false; //always force manual drain commit
        const enableBackpressure = true; //and enable backpressure

        this.consumer = this.consumer ||
            new Consumer(this.config.topic, this.config.kafka);

        //listen for parent class stats requests
        super.on("get-stats", () => {
            super.emit("consumer-stats", this.consumer.getStats());
        });

        this.consumer.on("error", error => super.emit("error", error));

        return this.consumer.connect(enableBackpressure).then(() => {
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

                            this.consumer.consume((_message, callback) => {
                                super.emit("inc", true);

                                super.convertTo(_message, (error, message) => {

                                    if (error) {
                                        return super.emit("error", error);
                                    }

                                    super.emit("consumed", _message.key);

                                    //simply return on null message
                                    if (message === null || message === "null") {
                                        super.emit("empty", true);
                                        return process.nextTick(() => {
                                            callback(null);
                                        });
                                    }

                                    this._putMessage(SinkConfig._messageToRecord(message), callback);
                                });
                            }).catch(error => super.emit("error", error));

                            resolve();
                        }, this);
                    });
                }, this); //passing config as optional reference
            });
        });
    }

    _runNative(){

        this.config.kafka.options.autoCommit = false;

        this.consumer = this.consumer ||
            new NConsumer(this.config.topic, this.config.kafka);

        //listen for parent class stats requests
        super.on("get-stats", () => {
            super.emit("consumer-stats", this.consumer.getStats());
        });

        this.consumer.on("error", error => super.emit("error", error));

        return this.consumer.connect().then(() => {
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

                            this.consumer.consume((_message, callback) => {
                                super.emit("inc", true);

                                super.convertTo(_message, (error, message) => {

                                    if (error) {
                                        return super.emit("error", error);
                                    }

                                    super.emit("consumed", _message.key);

                                    //simply return on null message
                                    if (message === null || message === "null") {
                                        super.emit("empty", true);
                                        return process.nextTick(() => {
                                            callback();
                                        });
                                    }

                                    this._putMessage(SinkConfig._messageToRecord(message), callback);
                                });
                            }).catch(error => super.emit("error", error));

                            resolve();
                        }, this);
                    });
                }, this); //passing config as optional reference
            });
        });
    }

    static _messageToRecord(message) {

        //check if a converter has already turned this message into a record
        if (message && typeof message.value === "object" &&
            message instanceof SinkRecord) {
            return message;
        }

        try {
            const record = new SinkRecord();

            record.kafkaOffset = message.offset;
            record.key = message.key;
            record.partition = message.partition;

            record.keySchema = message.value.keySchema;
            record.timestamp = message.value.timestamp;
            record.value = message.value.value;
            record.valueSchema = message.value.valueSchema;

            return record;
        } catch (error) {
            super.emit("error", "Failed to turn message into SinkRecord: " + error.message);
            return message;
        }
    }

    _putMessage(message, callback, attempts = 0) {
        attempts++;

        try {
            this.task.put([message], error => {

                if (error) {
                    return this._onPutFail(error, message, callback, attempts);
                }

                super.emit("out", true);
                callback(null);
            });
        } catch (error) {
            this._onPutFail(error, message, callback, attempts);
        }
    }

    _onPutFail(error, message, callback, attempts) {
        super.emit("error", error);

        if (attempts > this.maxRetries) {

            if (this.config.haltOnError) {
                super.emit("error", new Error("halting because of retry error."));
                return this.stop();
            }

            if (this.config.waitOnError) {
                super.emit("error", new Error("waiting because of retry error."));
                return; //never calls callback
            }

            return callback(error);
        }

        setTimeout(() => {
            this._putMessage(message, callback, attempts);
        }, this.awaitRetry);
    }

    stop(shouldCommit = false) {

        if (this._intv) {
            clearInterval(this._intv);
        }

        if (this.consumer) {
            this.consumer.close(shouldCommit);
            this.consumer = null;
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

module.exports = SinkConfig;