"use strict";

let client = null; //ugly prom-client module starts stuff on require..

const DEFAULT_METRICS_INTV = 5000;

class Metrics {

    constructor(parentConfig) {
        this.parentConfig = parentConfig;
        client = require("prom-client"); //require "on-demand" *sigh*
        this._init();
    }

    _init() {
        this.collectDefaultMetrics = client.collectDefaultMetrics(DEFAULT_METRICS_INTV);

        const producedCounter = new client.Counter({ name: "nkc_total_produced", help: "Total produced kafka messages" });
        const consumedCounter = new client.Counter({ name: "nkc_total_consumed", help: "Total consumed kafka messages" });

        const errorCounter = new client.Counter({ name: "nkc_total_errors", help: "Total error counts during kafka consumption" });
        const ignoredCounter = new client.Counter({ name: "nkc_total_ignored", help: "Total ignored kafka messages" });

        const upsertCounter = new client.Counter({ name: "nkc_total_upsert", help: "Total upserted models" });
        const deleteCounter = new client.Counter({ name: "nkc_total_delete", help: "Total deleted models" });
        const readCounter = new client.Counter({ name: "nkc_total_read", help: "Total read records" });

        this.parentConfig.on("produced", () => {
            producedCounter.inc();
        });

        this.parentConfig.on("consumed", () => {
            consumedCounter.inc();
        });

        this.parentConfig.on("error", () => {
            errorCounter.inc();
        });

        this.parentConfig.on("empty", () => {
            ignoredCounter.inc();
        });

        this.parentConfig.on("model-upsert", () => {
            upsertCounter.inc();
        });

        this.parentConfig.on("model-upsert", () => {
            deleteCounter.inc();
        });

        this.parentConfig.on("record-read", () => {
            readCounter.inc();
        });
    }

    getMetricsAsText() {
        if (client && client.register && client.register.metrics) {
            return client.register.metrics();
        }

        return "# Failed to get Metrics";
    }

    close() {
        clearInterval(this.collectDefaultMetrics);
    }
}

module.exports = Metrics;