# Sample Interface Implementation Overview

```es6
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
```