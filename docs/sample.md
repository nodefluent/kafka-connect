## Sample Connector/Task Implementation

```es6
class SequelizeSourceConnector extends SourceConnector {

    start(properties, callback){
        //reads config
        //opens db connection
        //tests initial connection
        //starts table monitor thread
        callback(null);
    }

    taskConfigs(maxTasks, callback){
        //reads config
        //reads tables from table monitor
        //returns a map of task properties
        callback(null, {});
    }

    stop(){
        //kills table monitor thread
        //closes db connection
    }
}

class SequelizeSinkConnector extends SinkConnector {

    start(properties, callback){
        //stores properties
        callback();
    }

    taskConfigs(maxTasks, callback){
        //reads config
        //returns map of task properties
        callback(null, {});
    }

    stop(){
        //does nothing
    }
}

class SequelizeSourceTask extends SourceTask {

    start(properties, callback){
        //reads config
        //opens db connection
        //reads offsets for table?
        callback();
    }

    stop(){
        //close db connection
    }

    poll(callback){
        //polls the table
        //returns a list of SourceRecords
        callback(null, records);
    }
}

class SequelizeSinkTask extends SinkTask {

    start(properties, callback){
        //stores config
        //opens db connection
        callback();
    }

    put(records, callback){
        //upserts list of SinkRecords into table
        //retries on first fails
        //finally emits specific error to stop offset commits
        callback(null);
    }

    stop(){
        //close db connection
    }
}
```

## Sample Converter Implementation

```es6
class JsonConverter extends Converter {

    /**
     * Convert a Kafka Connect data object to a native object for serialization.
     */
    fromConnectData(data, callback){
        const messageValue = JSON.stringify(data);
        callback(null, messageValue);
    }

    /**
     * Convert a native object to a Kafka Connect data object.
     */
    toConnectData(message, callback){
        message.value = JSON.parse(message.value);
        callback(null, message);
    }
}
```

## Configuration

```es6
const properties = {
    kafka: {
        //zkConStr: "localhost:2181/kafka",
        kafkaHost: "localhost:9092",
        logger: null,
        groupId: "nkc-test",
        clientName: "nkc-test-name",
        workerPerPartition: 1,
        options: {
            sessionTimeout: 8000,
            protocol: ["roundrobin"],
            fromOffset: "earliest", //latest
            fetchMaxBytes: 1024 * 100,
            fetchMinBytes: 1,
            fetchMaxWaitMs: 10,
            heartbeatInterval: 250,
            retryMinTimeout: 250,
            requireAcks: 1,
            ackTimeoutMs: 100,
            partitionerType: 3
        }
    },
    topic: "nkc_test_topic",
    partitions: 1,
    maxTasks: 1,
    pollInterval: 2000,
    produceKeyed: true,
    produceCompressionType: 0,
    connector: {},
    http: {
        port: 3484,
        middlewares: [
            (req, res ,next) => { next(); }
        ]
    },
    enableMetrics: true
};
```

## SSL Configuration

can be found [here](https://github.com/nodefluent/node-sinek/tree/master/ssl-example)

## Automatically exposed http endpoints

```
    GET /

    GET /alive
    GET /admin/healthcheck
    GET /admin/health

    GET /admin/kafka
    GET /admin/metrics
    GET /admin/stats
```
