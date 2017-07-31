## Framework Events

```es6
/*
    Since SourceConfig & SinkConfig inherit form common/Config they also both 
    inherit from EventEmitter.
*/

const config = new SourceConfig(..) || new SinkConfig(..);

// "error" -> when an error occures (has a default listener)
config.on("error", error => ..);

// "produced" -> when a kafka message is produced
config.on("produced", messageKey => ..);

// "consumed" -> when a kafka message is consumed
config.on("consumed", messageKey => ..);

// "empty" -> when a kafka message is ignored, because its record content was null or "null"
config.on("empty", messageKey => ..);

// "request" -> when a web request is received
config.on("request", ({method, url, headers, body}) => ..);

// others:
// "get-stats" -> whenever the base-config asks for the current kafka stats
// "consumer-stats" -> sink consumer kafka stats (when triggered by "get-stats")
// "producer-stats" -> source producer kafka stats (when triggered by "get-stats")
```

### Suggested Events for Connectors

```es6
/*
    Connectors and Tasks do receive a reference to the "parentConfig" instance
    (that inherits from EE) in the .start() methods as optional third parameter
    this instance can be used to subscripe and to publish events to the base EE.
    its suggest to emit the following events:
*/

// "model-upsert" -> whenever a model is to be upserted in a sink task
parentConfig.emit("model-upsert", "id");

// "model-delete" -> whenever a model is to be deleted in a sink task
parentConfig.emit("model-delete", "id");

// "record-read" -> whenever a record is polled from db in a source task
parentConfig.emit("record-read", "key");
```

## Adding Custom Stats to /admin/stats

```es6
//listen for a stats request
config.on("get-stats", () => {

    const statsKey = "postgres";
    const statsValue = {
        connections: 5,
        otherStuff: {}
    };

    //emit stats event with key and value
    config.emit("any-stats", statsKey, statsValue);
});
```
