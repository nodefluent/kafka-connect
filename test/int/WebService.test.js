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

    it("should be able to start web service", () => {

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

                        if (req.url === "/kiz") {
                            return res.status(201).end("abteilungsleiter");
                        }

                        next();
                    }
                ]
            }
        };

        config = new SourceConfig(properties, SourceConnector, SourceTask, []);

        config.on("request", console.log);
        config.on("error", _error => error = _error);

        config.run();
    });

    it("should await start of server", function(done) {
        setTimeout(done, 300);
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
        request(`http://localhost:${port}/kiz`, (error, response, body) => {
            assert.ifError(error);
            assert.equal(response.statusCode, 201);
            assert.equal(body, "abteilungsleiter");
            console.log(body);
            done();
        });
    });

    it("should be able to make a web request to the kafka endpoint", function(done) {
        request(`http://localhost:${port}/admin/kafka`, (error, response, body) => {
            assert.ifError(error);
            assert.equal(response.statusCode, 200);
            body = JSON.parse(body);
            assert.equal(body.kafka.producerStats.totalPublished, 0);
            console.log(body);
            done();
        });
    });

    it("should be able to close server", function() {
        assert.ifError(error);
        config.close();
    });
});