# node-kafka-connect

[![Build Status](https://travis-ci.org/nodefluent/kafka-connect.svg?branch=master)](https://travis-ci.org/nodefluent/kafka-connect)

[![Coverage Status](https://coveralls.io/repos/github/nodefluent/kafka-connect/badge.svg?branch=master)](https://coveralls.io/github/nodefluent/kafka-connect?branch=master)

## What can I do with this?
The framework can be used to build connectors,
that transfer data `to` and `from` Apache Kafka and Databases,
very easily. If you are looking for already implemented connectors
for you favorite datastore, take a look at the `Available Connector Implementations` below.

## Info

- node-kafka-connect is a framework to implement large
`kafka -> datastore` & `datastore -> kafka` data movements.
- it can be used to easily built connectors from/to kafka to any kind of
datastore/database.
- a connector might consist of a SourceConnector + SourceTask to
poll data from a datastore into a kafka topic.
- a connector might consist of a SinkConnector + SinkTask to put
data from a kafka topic into a datastore.
- Converters might be used to apply alteration to any data-stream.
- any operation in node-kafka-connect is asynchronous
- ships with auto http server (health-checks, kafka-stats)
- ships with auto metrics (prometheus)

## A note on native mode

If you are using the native mode (`config: { noptions: {} }`).
You will have to manually install `node-rdkafka` alongside kafka-connect.
(This requires a Node.js version between 9 and 12 and will not work with Node.js >= 13, last tested with 12.16.1)

On Mac OS High Sierra / Mojave:
`CPPFLAGS=-I/usr/local/opt/openssl/include LDFLAGS=-L/usr/local/opt/openssl/lib yarn add --frozen-lockfile node-rdkafka@2.7.4`

Otherwise:
`yarn add --frozen-lockfile node-rdkafka@2.7.4`

(Please also note: Doing this with npm does not work, it will remove your deps, `npm i -g yarn`)

## Available Connector Implementations

* [Sequelize (MySQL, Postgres, SQLite, MSSQL)](https://github.com/nodefluent/sequelize-kafka-connect)
* [Google BigQuery](https://github.com/nodefluent/bigquery-kafka-connect)
* [Salesforce](https://github.com/nodefluent/salesforce-kafka-connect)
* [Google PubSub](https://github.com/nodefluent/gcloud-pubsub-kafka-connect)

## Creating custom Connectors

```
yarn add kafka-connect
```

```es6
const source = new TestSourceConfig(config, 
    TestSourceConnector, 
    TestSourceTask, 
    [TestConverter]);
    
source.run().then();
```

```es6
const sink = new TestSinkConfig(config,
    TestSinkConnector, 
    TestSinkTask, 
    [TestConverter]);
 
sink.run().then();
```

## Docs

* [Implementation-Helper Overview](docs/sample.md)
* [Framework Events](docs/events.md)

## Debugging

* You can use `DEBUG=kafka-connect:*` to debug the sink configuration.

## FAQ

* Q: it is running slow / only synchronous / 1 by 1 messages ?
* A: just set the config.batch object [as it is described here](https://github.com/nodefluent/node-sinek/tree/master/lib/librdkafka#advanced-1n-consumer-mode)
