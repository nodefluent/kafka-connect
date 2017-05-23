"use strict";

const assert = require("assert");

const {SourceConnector, SourceTask, SinkConnector,
    SinkTask, SourceConfig,
    SinkConfig, Converter} = require("./../../index.js");

describe("Common UNIT", function() {

    describe("Inherit Interface", function(){

        class TestSourceConfig extends SourceConfig {
            constructor(...args){ super(...args); }
            run(){
                super.run();
            }
        }

        class TestSinkConfig extends SinkConfig {
            constructor(...args){ super(...args); }
            run(){
                super.run();
            }
        }

        class TestSourceConnector extends SourceConnector {
            constructor(){ super(); }
            start(properties){
            }
            taskConfigs(maxTasks){
            }
            stop(){
            }
        }

        class TestSinkConnector extends SinkConnector {
            constructor(){ super(); }
            start(properties){
            }
            taskConfigs(maxTasks){
            }
            stop(){
            }
        }

        class TestSourceTask extends SourceTask {
            constructor(){ super(); }
            start(properties){
            }
            stop(){
            }
            poll(){
            }
        }

        class TestSinkTask extends SinkTask {
            constructor(){ super(); }
            start(properties){
            }
            put(records){
            }
            stop(){
            }
        }

        class TestConverter extends Converter {
            constructor(){ super(); }
            toConnectData(){
            }
            fromConnectData(){
            }
        }

        const config = {
            kafka: {},
            topic: "topic",
            partitions: 30,
            maxTasks: 1,
            connector: {},
            pollInterval: 5000
        };

        it("should be able to create source setup", function () {
            const source = new TestSourceConfig(config, TestSourceConnector, TestSourceTask, [TestConverter]);
            source.run();
        });

        it("should be able to create sink setup", function () {
            const sink = new TestSinkConfig(config, TestSinkConnector, TestSinkTask, [TestConverter]);
            sink.run();
        });
    });
});