"use strict";

const Record = require("./../common/Record.js");

/**
 * SinkRecord is a ConnectRecord that has been read from Kafka and includes the kafkaOffset of the record in the Kafka
 * topic-partition in addition to the standard fields. This information should be used by the SinkTask to coordinate
 * kafkaOffset commits. It also includes the TimestampType, which may be TimestampType.NO_TIMESTAMP_TYPE, and the
 * relevant timestamp, which may be null.
 */
class SinkRecord extends Record {

    constructor(){
        super();
    }

}

/*
 public SinkRecord(String topic,
 int partition,
 Schema keySchema,
 Object key,
 Schema valueSchema,
 Object value,
 long kafkaOffset,
 Long timestamp,
 org.apache.kafka.common.record.TimestampType timestampType)
 */

module.exports = SinkRecord;