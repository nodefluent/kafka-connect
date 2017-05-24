"use strict";

const assert = require("assert");

const {SourceConnector, SourceTask, SinkConnector,
    SinkTask, SourceConfig,
    SinkConfig, Converter} = require("./../../index.js");

describe("Common UNIT", function() {

    class TestSourceConfig extends SourceConfig {

        constructor(...args){ super(...args); }

        run(){
            return super.run();
        }
    }

    class TestSinkConfig extends SinkConfig {

        constructor(...args){ super(...args); }

        run(){
            return super.run();
        }
    }

    class TestSourceConnector extends SourceConnector {

        constructor(){ super(); }

        start(properties, callback){
            console.log("con start");
            callback();
        }

        taskConfigs(maxTasks, callback){
            console.log("con taskConfigs");
            callback({maxTasks});
        }

        stop(){
            console.log("con stop");
        }
    }

    class TestSinkConnector extends SinkConnector {

        constructor(){ super(); }

        start(properties, callback){
            console.log("con start");
            callback();
        }

        taskConfigs(maxTasks, callback){
            console.log("con taskConfigs");
            callback(null, {maxTasks});
        }

        stop(){
            console.log("con stop");
        }
    }

    class TestSourceTask extends SourceTask {

        constructor(){ super(); }

        start(properties, callback){
            console.log("task start");
            callback();
        }

        poll(callback){
            console.log("task poll");
            callback(null, [
                {id: 1, field: "123"},
                {id: 2, field: "456"}
            ]);
        }

        stop(){
            console.log("task stop");
        }
    }

    class RetryTestSinkTask extends SinkTask {

        constructor(){
            super();
            this.attempts = -1;
        }

        start(properties, callback){
            console.log("task start");
            callback();
        }

        put(records, callback){

            console.log("task put");
            console.log(records[0]);

            this.attempts++;

            if(this.attempts === 0){
                throw new Error("failed to sink 1");
            }

            if(this.attempts === 1){
                return callback(new Error("failed to sink 2"));
            }

            this.attempts = -1;
            callback();
        }

        stop(){
            console.log("task stop");
        }
    }

    class FailTestSinkTask extends SinkTask {

        constructor(){ super(); }

        start(properties, callback){
            console.log("task start");
            callback();
        }

        put(records, callback){
            console.log("task put");
            console.log(records[0]);
            throw new Error("sink fails");
        }

        stop(){
            console.log("task stop");
        }
    }

    class TestSinkTask extends SinkTask {

        constructor(){ super(); }

        start(properties, callback){
            console.log("task start");
            callback();
        }

        put(records, callback){
            console.log("task put");
            console.log(records[0]);
            callback();
        }

        stop(){
            console.log("task stop");
        }
    }

    class TestConverter extends Converter {

        constructor(){ super(); }

        toConnectData(data, callback){
            console.log("toConnectData");
            callback(null, data);
        }

        fromConnectData(data, callback){
            console.log("fromConnectData");
            callback(null, data);
        }
    }

    const config = {
        kafka: {},
        topic: "topic",
        partitions: 30,
        maxTasks: 1,
        connector: {},
        pollInterval: 5
    };

    describe("Inherit Interface", function(){

        class BadTestConverter extends Converter {
        }

        class BadTestConverter2{
            toConnectData(){
            }
            fromConnectData(){
            }
        }

        it("should be able to create source setup", function () {
            const source = new TestSourceConfig(config, TestSourceConnector, TestSourceTask, [TestConverter]);
            assert.doesNotThrow(source.run.bind(source));
        });

        it("should be able to create sink setup", function () {
            const sink = new TestSinkConfig(config, TestSinkConnector, TestSinkTask, [TestConverter]);
            assert.doesNotThrow(sink.run.bind(sink));
        });

        it("should throw on bad implementation", function () {
            assert.throws(() => {
                new TestSourceConfig(config, TestSourceConnector, TestSourceTask, [BadTestConverter])
            }, /functions/);
        });

        it("should throw on bad inheritance", function () {
            assert.throws(() => {
                new TestSourceConfig(config, TestSourceConnector, TestSourceTask, [BadTestConverter2]);
            }, /inherit/);
        });
    });

    describe("Inherit Interface Mock", function(){

        class FakeConsumer {

            constructor(){
                this.syncFunc = null;
            }

            connect(){
                return Promise.resolve();
            }

            consume(syncFunc){
                this.syncFunc = syncFunc;
                return Promise.resolve();
            }

            __consumeMessage(message, callback){
                this.syncFunc(message, callback);
            }

            close(){
                this.syncFunc = null;
            }
        }

        class FakeProducer {

            constructor(){
                this.offset = -1;
                this.sent = [];
            }

            connect(){
                return Promise.resolve();
            }

            send(topic, message){

                this.sent.push({
                    offset: this.offset += 1,
                    topic: topic,
                    value: JSON.stringify(message)
                });

                return Promise.resolve();
            }

            __getSentMessages(){
                return this.sent;
            }

            close(){
                this.sent = [];
            }
        }

        it("should be able to create and await source setup", function () {
            const producer = new FakeProducer();
            const source = new TestSourceConfig(config, TestSourceConnector, TestSourceTask, [TestConverter], producer);
            return source.run().then(_ => {
                source.stop();
                return true;
            })
        });

        it("should be able to create and await sink setup", function () {
            const consumer = new FakeConsumer();
            const sink = new TestSinkConfig(config, TestSinkConnector, TestSinkTask, [TestConverter], consumer);
            return sink.run().then(_ => {
                sink.stop();
                return true;
            });
        });

        it("should be able to run source setup", function (done) {
            const producer = new FakeProducer();
            const source = new TestSourceConfig(config, TestSourceConnector, TestSourceTask, [TestConverter], producer);
            //source.on("error", error => console.log(error));
            source.run().then(() => {
                setTimeout(() => {
                    console.log(producer.__getSentMessages());
                    source.stop();
                    done();
                }, 8);
            });
        });

        it("should be able to run sink setup", function (done) {
            const consumer = new FakeConsumer();
            const sink = new TestSinkConfig(config, TestSinkConnector, TestSinkTask, [TestConverter], consumer);
            //sink.on("error", error => console.log(error));
            sink.run().then(() => {
                consumer.__consumeMessage({
                    offset: 5,
                    topic: "test",
                    value: JSON.stringify({bla: "bla"})
                }, () => {
                    sink.stop();
                    done();
                });
            });
        });

        it("should be able to run retry sink setup", function () {
            const consumer = new FakeConsumer();
            const sink = new TestSinkConfig(config, TestSinkConnector, RetryTestSinkTask, [TestConverter], consumer);
            //sink.on("error", error => console.log(error));
            return sink.run().then(() => {
                return new Promise(resolve => {
                    consumer.__consumeMessage({
                        offset: 5,
                        topic: "test",
                        value: JSON.stringify({bla: "bla"})
                    }, error => {
                        assert.ifError(error);
                        sink.stop();
                        resolve();
                    });
                });
            });
        });

        it("should be able to fail gracefully on failing retry sink setup", function () {
            const consumer = new FakeConsumer();
            const sink = new TestSinkConfig(config, TestSinkConnector, FailTestSinkTask, [TestConverter], consumer);
            //sink.on("error", error => console.log(error));
            return sink.run().then(() => {
                return new Promise(resolve => {
                    consumer.__consumeMessage({
                        offset: 5,
                        topic: "test",
                        value: JSON.stringify({bla: "bla"})
                    }, error => {
                        assert.ok(error);
                        sink.stop();
                        resolve();
                    });
                });
            });
        });

    });
});