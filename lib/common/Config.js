"use strict";

const EventEmitter = require("events");
const Promise = require("bluebird");
const async = require("async");
const express = require("express");
const bodyParser = require("body-parser");

const Interface = require("./../utils/Interface.js");
const Connector = require("./../common/Connector.js");
const Task = require("./../common/Task.js");
const Converter = require("./Converter.js");
const Metrics = require("./Metrics.js");
const pjson = require("./../../package.json");

const CONNECTOR_FUNCTIONS = [
    "start",
    "taskConfigs",
    "stop"
];

const TASK_FUNCTIONS = [
    "start",
    "stop"
];

const ADD_TASK_FUNCTIONS = [
    "poll",
    "put"
];

const CONVERTER_FUNCTIONS = [
    "fromConnectData",
    "toConnectData"
];

const ANY_STATS_EVENT = "any-stats";

class Config extends EventEmitter {

    constructor(config, Connector, Task, Converters) {
        super();

        this.config = config;

        this.Connector = Connector;
        this.Task = Task;
        this.Converters = Converters;
        this.composedToConverters = null;
        this.composedFromConverters = null;

        this.metrics = null;
        if (this.config.enableMetrics) {
            this.metrics = new Metrics(this);
        }

        this.aliveStatus = 1;
        this.webApp = express();
        this.webServer = this._buildWebServer(this.config.http);

        this._evaluate();
        super.on("error", () => {}); //dont throw
    }

    /**
     * js does not allow for interfaces
     * therefore we have to evaluate a few things
     * before running to give at least a little support
     * for connector developers
     * @private
     */
    _evaluate() {

        if (!(new this.Connector() instanceof Connector)) {
            throw new Error(`A Connector must inherit from SinkConnector or SourceConnector.`);
        }

        if (!(new this.Task() instanceof Task)) {
            throw new Error(`A Task must inherit from SinkTask or SourceTask.`);
        }

        const toConverters = [];
        const fromConverters = [];

        if (this.Converters.length > 0) {
            this.Converters.forEach(_Converter => {
                const converter = typeof _Converter === "object" ? _Converter : new _Converter();

                if (!(converter instanceof Converter)) {
                    throw new Error(`A Converter must inherit from Converter Base Class.`);
                }

                try {
                    Interface.validate(_Converter, CONVERTER_FUNCTIONS);
                } catch (error) {
                    throw new Error(`A Converter must have the following functions ${CONVERTER_FUNCTIONS.join(", ")}.`);
                }

                toConverters.push(converter.toConnectData.bind(converter));
                fromConverters.push(converter.fromConnectData.bind(converter));
            });

            toConverters.reverse();
            fromConverters.reverse();

            this.composedToConverters = async.compose.apply(async, toConverters);
            this.composedFromConverters = async.compose.apply(async, fromConverters);
        }

        try {
            Interface.validate(this.Connector, CONNECTOR_FUNCTIONS);
        } catch (error) {
            throw new Error(`A Connector must have the following functions ${CONNECTOR_FUNCTIONS.join(", ")}.`);
        }

        try {
            Interface.validate(this.Task, TASK_FUNCTIONS);
        } catch (error) {
            throw new Error(`A Task must have the following functions ${TASK_FUNCTIONS.join(", ")}.`);
        }

        let oneSet = false;

        try {
            Interface.validate(this.Task, [ADD_TASK_FUNCTIONS[0]]);
            oneSet = true;
        } catch (error) {
            //empty
        }

        try {
            Interface.validate(this.Task, [ADD_TASK_FUNCTIONS[1]]);
            oneSet = true;
        } catch (error) {
            //empty
        }

        if (!oneSet) {
            throw new Error(`A Task must have one of the following functions ${ADD_TASK_FUNCTIONS.join(", ")}.`);
        }
    }

    convertTo(message, callback) {

        if (!this.composedToConverters) {
            return callback(null, message);
        }

        this.composedToConverters(message, callback);
    }

    convertFrom(message, callback) {

        if (!this.composedFromConverters) {
            return callback(message);
        }

        this.composedFromConverters(message, callback);
    }

    run() {
        //empty
    }

    _buildWebServer(config = null) {

        if (config === null) {
            return; //no web-server
        }

        const { port, middlewares } = config;

        this.webApp.use(bodyParser.text());
        this.webApp.use(bodyParser.json());

        this.webApp.use((req, res, next) => {
            super.emit("request", {
                url: req.url,
                method: req.method,
                headers: req.headers,
                body: req.body
            });
            next();
        });

        this.webApp.get("/", (req, res) => {
            let base = req.headers.host;
            base = base.startsWith("http") ? base : "http://" + base;
            res.status(200).json({
                _: pjson.name,
                version: pjson.version,
                endpoints: {
                    "GET": {
                        [`${base}/`]: "self",
                        [`${base}/alive`]: "alive status",
                        [`${base}/admin/healthcheck`]: "health status",
                        [`${base}/admin/health`]: "descriptive health status",
                        [`${base}/admin/kafka`]: "descriptive kafka status",
                        [`${base}/admin/metrics`]: "prometheus text format metrics"
                    }
                }
            });
        });

        this.webApp.get("/alive", (req, res) => {
            res.status(this.aliveStatus ? 200 : 503).end(this.aliveStatus ? "alive" : "dead");
        });

        this.webApp.get("/admin/healthcheck", (req, res) => {
            res.status(this.aliveStatus ? 200 : 503).end(this.aliveStatus ? "up" : "down");
        });

        this.webApp.get("/admin/health", (req, res) => {
            res.status(this.aliveStatus ? 200 : 503).json({
                status: this.aliveStatus ? "UP" : "DOWN"
            });
        });

        this.webApp.get("/admin/stats", (req, res) => {
            this.getStats().then(stats => {
                res.status(200).json(stats);
            });
        });

        this.webApp.get("/admin/kafka", (req, res) => {
            this.getStats().then(stats => {
                res.status(200).json(stats);
            });
        });

        if (this.metrics) {
            this.webApp.get("/admin/metrics", (req, res) => {
                res.set("Content-Type", "text/plain; version=0.0.4");
                res.status(200).end(this.metrics.getMetricsAsText());
            });
        }

        if (middlewares && middlewares.length > 0) {
            middlewares.forEach(middleware => {
                if (typeof middleware === "function") {
                    this.webApp.use(middleware);
                } else {
                    super.emit("error", new Error("http middlewares must be functions."));
                }
            });
        }

        this.webApp.use((req, res, next, error) => {
            super.emit("error", error);
            res.status(500).send(error.message);
        });

        return this.webApp.listen(port);
    }

    close() {

        if (this.webServer) {
            this.webServer.close();
        }

        if (this.metrics) {
            this.metrics.close();
        }
    }

    getStats() {
        return new Promise(resolve => {

            let consumerStats = null;
            let producerStats = null;

            super.once("consumer-stats", stats => {
                consumerStats = stats;
            });

            super.once("producer-stats", stats => {
                producerStats = stats;
            });

            const other = {};
            const anyStatsEvent = function(key, value) {
                other[key] = value;
            };
            const boundEvent = anyStatsEvent.bind(this);
            super.on(ANY_STATS_EVENT, boundEvent);

            //trigger stats event and await 3 ticks to resolve
            super.emit("get-stats", true);
            setTimeout(() => {
                super.removeListener(ANY_STATS_EVENT, boundEvent);
                resolve({
                    kafka: { consumerStats, producerStats },
                    other
                });
            }, 25);
        });
    }
}

module.exports = Config;