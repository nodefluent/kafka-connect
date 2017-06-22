"use strict";

const assert = require("assert");
const request = require("request");

const {
    SourceConnector,
    SourceTask,
    SourceConfig,
} = require("./../../index.js");

describe("WebService INT", function() {

    let config = null;
    let port = 1337;
    let error = null;

    before(function(done) {

        const properties = {
            kafka: {},
            topic: "topic",
            partitions: 30,
            maxTasks: 1,
            connector: {},
            pollInterval: 5,
            http: {
                port,
                middlewares: [
                    function(req, res, next) {

                        if (req.url === "/xd") {
                            return res.status(201).end("xd");
                        }

                        next();
                    }
                ]
            },
            enableMetrics: true
        };

        config = new SourceConfig(properties, SourceConnector, SourceTask, []);

        config.on("request", console.log);
        config.on("error", _error => error = _error);

        config.run();
        setTimeout(done, 300);
    });

    after(function() {
        config.close();
    });

    it("should be able to make a web request to the health endpoint", function(done) {
        request(`http://localhost:${port}/admin/health`, (error, response, body) => {
            assert.ifError(error);
            assert.equal(response.statusCode, 200);
            console.log(body);
            done();
        });
    });

    it("should be able to make a web request to the middleware endpoint", function(done) {
        request(`http://localhost:${port}/xd`, (error, response, body) => {
            assert.ifError(error);
            assert.equal(response.statusCode, 201);
            assert.equal(body, "xd");
            console.log(body);
            done();
        });
    });

    it("should be able to make a web request to the kafka endpoint", function(done) {

        config.on("get-stats", () => {
            config.emit("any-stats", "my-stats", {
                test: "xd"
            });
        });

        request(`http://localhost:${port}/admin/kafka`, (error, response, body) => {
            assert.ifError(error);
            assert.equal(response.statusCode, 200);
            body = JSON.parse(body);
            assert.equal(body.kafka.producerStats.totalPublished, 0);
            assert.equal(body.other["my-stats"].test, "xd");
            console.log(body);
            done();
        });
    });

    it("should be able to make a web request to the metrics endpoint", function(done) {
        request(`http://localhost:${port}/admin/metrics`, (error, response, body) => {
            assert.ifError(error);
            assert.equal(response.statusCode, 200);
            assert.ok(body.includes("nodejs_heap_space_size_available_bytes"));
            assert.ok(body.includes("nkc_total_consumed"));
            assert.ok(body.includes("nkc_total_produced"));
            //console.log(body);
            done();
        });
    });

    it("should be able to make a web request to the root endpoint", function(done) {
        request(`http://localhost:${port}/`, (error, response, body) => {
            assert.ifError(error);
            assert.equal(response.statusCode, 200);
            body = JSON.parse(body);
            assert.ok(body);
            assert.equal(typeof body, "object");
            console.log(body);
            done();
        });
    });

    it("should not see any errors", function() {
        assert.ifError(error);
    });
});