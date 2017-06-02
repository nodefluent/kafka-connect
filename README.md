# node-kafka-connect

[![Greenkeeper badge](https://badges.greenkeeper.io/nodefluent/kafka-connect.svg)](https://greenkeeper.io/)

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

## Available Connector Implementations

* [Sequelize (MySQl, Postgres, SQLite, MSSQL)](https://github.com/nodefluent/sequelize-kafka-connect)
* [Google BigQuery](https://github.com/nodefluent/bigquery-kafka-connect)

## Creating custom Connectors

```
npm install --save kafka-connect
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