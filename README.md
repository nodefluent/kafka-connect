# node-kafka-connect

[![Greenkeeper badge](https://badges.greenkeeper.io/nodefluent/kafka-connect.svg)](https://greenkeeper.io/)

[![Build Status](https://travis-ci.org/nodefluent/kafka-connect.svg?branch=master)](https://travis-ci.org/nodefluent/kafka-connect)

[![Coverage Status](https://coveralls.io/repos/github/nodefluent/kafka-connect/badge.svg?branch=master)](https://coveralls.io/github/nodefluent/kafka-connect?branch=master)

## Info

- node-kafka-connect is a framework to implement large
`kafka -> datastore` & `datastore -> kafka` data movements
- 

## Available Connector Implementations

* [Sequelize (MySQl, Postgres, SQLite)](https://github.com/nodefluent/sequelize-kafka-connect)
* [Google BigQuery](https://github.com/nodefluent/bigquery-kafka-connect)

## Creating custom Connectors

```
npm install --save kafka-connect
```

[Quick-Sample Implementation Overview](docs/sample.md)