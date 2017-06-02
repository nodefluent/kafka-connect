"use strict";

const Connector = require("./../common/Connector.js");

/**
 * SourceConnectors implement the connector interface to pull data from another system and send it to Kafka.
 */
class SourceConnector extends Connector {

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

module.exports = SourceConnector;