// declare type Buffer = any;

declare module "kafka-connect" {

    export interface Properties {
        kafka: {
            noptions: any;
            options: any;
        };
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