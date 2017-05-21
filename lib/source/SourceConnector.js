"use strict";

const Connector = require("./../common/Connector.js");

/**
 * SourceConnectors implement the connector interface to pull data from another system and send it to Kafka.
 */
class SourceConnector extends Connector {

    constructor(){
        super();
    }

}

module.exports = SourceConnector;