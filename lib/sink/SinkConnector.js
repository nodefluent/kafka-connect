"use strict";

const Connector = require("./../common/Connector.js");

/**
 * SinkConnectors implement the Connector interface to send Kafka data to another system.
 */
class SinkConnector extends Connector {

    constructor() {
        super();
    }

    start() {
        //empty
    }

    taskConfigs() {
        //empty
    }

    stop() {
        //empty
    }
}

module.exports = SinkConnector;