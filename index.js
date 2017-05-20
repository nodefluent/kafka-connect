"use strict";

//Sink = Kafka -> Datastore
//Source = Datastore -> Kafka

//1. connect to datastore
//2. connect to kafka
//3. pull from datastore / consume from kafka
//4. apply converter to key and value
//5. write to datastore / produce to kafka
//6. poll / stream

const SourceConnector = require("./source/SourceConnector.js");
const SinkConnector = require("./sink/SinkConnector.js");

const SourceTask = require("./source/SourceTask.js");
const SinkTask = require("./sink/SinkTask.js");

const Converter = require("./utils/Converter.js");

//const SourceConfig = require("./source/SourceConfig.js");
//const SinkConfig = require("./sink/SinkConfig.js");

// test implementation of a connector
// http://docs.confluent.io/current/connect/connect-jdbc/docs/source_connector.html#quickstart

class JsonConverter extends Converter {

    /**
     * Convert a Kafka Connect data object to a native object for serialization.
     * @param topic
     * @param schema
     * @param objectValue
     */
    fromConnectData(topic, schema, objectValue){
        //returns byte[]
    }

    /**
     * Convert a native object to a Kafka Connect data object.
     * @param topic
     * @param byteValue
     */
    toConnectData(topic, byteValue){
        //returns SchemaAndValue
    }
}

class SequelizeSourceConnector extends SourceConnector {

    start(properties){
        //reads config
        //opens db connection
        //tests initial connection
        //starts table monitor thread
    }

    taskConfigs(maxTasks){
        //reads config
        //reads tables from table monitor
        //returns a map of task properties
    }

    stop(){
        //kills table monitor thread
        //closes db connection
    }
}

class SequelizeSinkConnector extends SinkConnector {

    start(properties){
        //stores properties
    }

    taskConfigs(maxTasks){
        //reads config
        //returns map of task properties
    }

    stop(){
        //does nothing
    }
}

class SequelizeSourceTask extends SourceTask {

    start(properties){
        //reads config
        //opens db connection
        //reads offsets for table?
    }

    stop(){
        //close db connection
    }

    poll(){
        //polls the table
        //returns a list of SourceRecords
    }
}

class SequelizeSinkTask extends SinkTask {

    start(properties){
        //stores config
        //opens db connection
    }

    put(records){
        //upserts list of SinkRecords into table
        //retries on first fails
        //finally emits specific error to stop offset commits
    }

    stop(){
        //close db connection
    }
}