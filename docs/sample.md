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
