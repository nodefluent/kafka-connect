// declare type Buffer = any;

declare module "kafka-connect" {

    export interface KafkaHealthConfig {
        thresholds?: {
            consumer?: {
                errors?: number;
                lag?: number;
                stallLag?: number;
                minMessages?: number;
            };
            producer?: {
                errors?: number;
                minMessages?: number;
            };
        };
    }

    export interface CommonKafkaOptions {
        "builtin.features"?: string;
        "client.id"?: string;
        "metadata.broker.list": string;
        "message.max.bytes"?: number;
        "message.copy.max.bytes"?: number;
        "receive.message.max.bytes"?: number;
        "max.in.flight.requests.per.connection"?: number;
        "metadata.request.timeout.ms"?: number;
        "topic.metadata.refresh.interval.ms"?: number;
        "metadata.max.age.ms"?: number;
        "topic.metadata.refresh.fast.interval.ms"?: number;
        "topic.metadata.refresh.fast.cnt"?: number;
        "topic.metadata.refresh.sparse"?: boolean;
        "topic.blacklist"?: string;
        "debug"?: string;
        "socket.timeout.ms"?: number;
        "socket.blocking.max.ms"?: number;
        "socket.send.buffer.bytes"?: number;
        "socket.receive.buffer.bytes"?: number;
        "socket.keepalive.enable"?: boolean;
        "socket.nagle.disable"?: boolean;
        "socket.max.fails"?: number;
        "broker.address.ttl"?: number;
        "broker.address.family"?: "any" | "v4" | "v6";
        "reconnect.backoff.jitter.ms"?: number;
        "statistics.interval.ms"?: number;
        "enabled_events"?: number;
        "log_level"?: number;
        "log.queue"?: boolean;
        "log.thread.name"?: boolean;
        "log.connection.close"?: boolean;
        "internal.termination.signal"?: number;
        "api.version.request"?: boolean;
        "api.version.fallback.ms"?: number;
        "broker.version.fallback"?: string;
        "security.protocol"?: "plaintext" | "ssl" | "sasl_plaintext" | "sasl_ssl";
        "ssl.cipher.suites"?: string;
        "ssl.key.location"?: string;
        "ssl.key.password"?: string;
        "ssl.certificate.location"?: string;
        "ssl.ca.location"?: string;
        "ssl.crl.location"?: string;
        "sasl.mechanisms"?: string;
        "sasl.kerberos.service.name"?: string;
        "sasl.kerberos.principal"?: string;
        "sasl.kerberos.kinit.cmd"?: string;
        "sasl.kerberos.keytab"?: string;
        "sasl.kerberos.min.time.before.relogin"?: number;
        "sasl.username"?: string;
        "sasl.password"?: string;
        "partition.assignment.strategy"?: string;
        "session.timeout.ms"?: number;
        "heartbeat.interval.ms"?: number;
        "group.protocol.type"?: string;
        "coordinator.query.interval.ms"?: number;
        "event_cb"?: boolean;
        "group.id": string;
        "enable.auto.commit"?: boolean;
        "auto.commit.interval.ms"?: number;
        "enable.auto.offset.store"?: boolean;
        "queued.min.messages"?: number;
        "queued.max.messages.kbytes"?: number;
        "fetch.wait.max.ms"?: number;
        "fetch.message.max.bytes"?: number;
        "fetch.min.bytes"?: number;
        "fetch.error.backoff.ms"?: number;
        "offset.store.method"?: "none" | "file" | "broker";
        "enable.partition.eof"?: boolean;
        "check.crcs"?: boolean;
        "queue.buffering.max.messages"?: number;
        "queue.buffering.max.kbytes"?: number;
        "queue.buffering.max.ms"?: number;
        "message.send.max.retries"?: number;
        "retry.backoff.ms"?: number;
        "compression.codec"?: "none" | "gzip" | "snappy" | "lz4";
        "batch.num.messages"?: number;
        "delivery.report.only.error"?: boolean;
    }

    export interface CombinedKafkaConfig {
        kafkaHost?: string;
        clientName?: string;
        groupId?: string;
        workerPerPartition?: number;
        options?: {
          sessionTimeout?: number;
          protocol?: [string];
          fromOffset?: string;
          fetchMaxBytes?: number;
          fetchMinBytes?: number;
          fetchMaxWaitMs?: number;
          heartbeatInterval?: number;
          retryMinTimeout?: number;
          requireAcks?: number;
          ackTimeoutMs?: number;
          partitionerType?: number;
       };
       health?: KafkaHealthConfig;
       tconf?: {
            "auto.commit.enable"?: boolean;
            "auto.commit.interval.ms"?: number;
            "auto.offset.reset"?: "smallest" | "earliest" | "beginning" | "largest" | "latest" | "end" | "error";
            "offset.store.path"?: string;
            "offset.store.sync.interval.ms"?: number;
            "offset.store.method"?: "file" | "broker";
            "consume.callback.max.messages"?: number;
            "request.required.acks"?: number;
            "request.timeout.ms"?: number;
            "message.timeout.ms"?: number;
            "produce.offset.report"?: boolean;
       };
       noptions?: CommonKafkaOptions;
    }

    export interface Properties {
        kafka: CombinedKafkaConfig;
        topic: string;
        partitions: number;
        maxTasks: number;
        pollInterval: number;
        produceKeyed: boolean;
        produceCompressionType: number;
        connector: any;
        http: {
            port: number;
            middlewares: (req, res, next) => void[];
        };
        enableMetrics: boolean;
        batch: any;
    }

    export class Converter {
        fromConnectData(data: any, callback: (error: Error, data: any) => void);
        toConnectData(message: any, callback: (error: Error, message: any) => void);
    }

    export class SourceBaseConverter extends Converter {}
    export class SinkBaseConverter extends Converter {}
    export class InjectableConverter extends Converter {}

    export class ConverterFactory {
        static createSinkSchemaConverter(tableSchema: any, 
            etlFunction: (messageValue: any, callback: (error: Error, newValue: any) => void) => void, schemaAttributes: any);
    }

    export class Record {
        keySchema: any;
        key: string | Buffer | null;
        valueSchema: any;
        value: any;
        partition: number;
        timestamp: string | null;
    }

    export class Connector {}
    export class Task {}

    export class SourceRecord extends Record {
        topic: string;
    }

    export class SinkRecord extends Record {
        kafkaOffset: number | null;
        timestampType: string | null;
    }

    export class SourceConnector extends Connector {
        start(properties: Properties, callback: (error: Error) => void);
        taskConfigs(maxTasks: number, callback: (error: Error, taskConfig: any) => void);
        stop();
    }

    export class SourceTask extends Task {
        start(properties: any, callback: (error: Error) => void, parentConfig?: Properties);
        poll(callback: (error: Error, records: SourceRecord[]) => void);
        stop();
    }

    export class SinkConnector extends Connector {
        start(properties: Properties, callback: (error: Error) => void);
        taskConfigs(maxTasks: number, callback: (error: Error, taskConfig: any) => void);
        stop();
    }

    export class SinkTask extends Task {
        start(properties: any, callback: (error: Error) => void, parentConfig?: Properties);
        put(records: SinkRecord[], callback: (error: Error) => void);
        stop();
    }

    export interface ConfigStats {
        kafka: {
            consumerStats: any;
            producerStats: any;
        };
        other: any;
    }

    export class Config {
        constructor(config: Properties, Connector: new() => Connector, Task: new() => Task, Converters: new() => Converter[]);
        convertTo(message, callback);
        convertFrom(message, callback);
        run();
        close();
        getStats(): Promise<ConfigStats>;
    }

    export class SinkConfig extends Config {
        constructor(config: Properties, Connector: new() => Connector, Task: new() => Task, Converters: new() => Converter[], consumer: any);
        run(): Promise<void>;
        stop(shouldCommit: boolean): void;
    }

    export class SourceConfig extends Config {
        constructor(config: Properties, Connector: new() => Connector, Task: new() => Task, Converters: new() => Converter[], producer: any);
        run(): Promise<boolean>;
        produce(record: SourceRecord): Promise<any>;
        stop(): void;
    }
}