"use strict";

const assert = require("assert");

const {SourceConnector, SourceTask, SinkConnector,
    SinkTask, SourceConfig,
    SinkConfig} = require("./../../index.js");

describe("Common UNIT", function() {

    describe("Inherit Interface", function(){

        class TestSourceConfig extends SourceConfig {
            constructor(...args){ super(...args); }
            run(){
            }
        }

        class TestSinkConfig extends SinkConfig {
            constructor(...args){ super(...args); }
            run(){
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

        it("should be able to create source setup", function () {
            const config = new TestSourceConfig({}, TestSourceConnector, TestSourceTask);
            config.run();
        });

        it("should be able to create sink setup", function () {
            const config = new TestSinkConfig({}, TestSinkConnector, TestSinkTask);
            config.run();
        });
    });
});