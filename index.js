"use strict";

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