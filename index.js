"use strict";

//Sink = Kafka -> Datastore
//Source = Datastore -> Kafka

//1. connect to datastore
//2. connect to kafka
//3. pull from datastore / consume from kafka
//4. apply converter to key and value
//5. write to datastore / produce to kafka
//6. poll / stream

const SourceConnector = require("./lib/source/SourceConnector.js");
const SinkConnector = require("./lib/sink/SinkConnector.js");

const SourceTask = require("./lib/source/SourceTask.js");
const SinkTask = require("./lib/sink/SinkTask.js");

const Converter = require("./lib/utils/Converter.js");

const SourceConfig = require("./lib/source/SourceConfig.js");
const SinkConfig = require("./lib/sink/SinkConfig.js");

module.exports = {
    SourceConnector,
    SinkConnector,
    SourceTask,
    SinkTask,
    Converter,
    SourceConfig,
    SinkConfig
};