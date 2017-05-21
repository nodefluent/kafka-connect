"use strict";

const Task = require("./../common/Task.js");

/**
 * SinkTask is a Task that takes records loaded from Kafka and sends them to another system. Each task instance is
 * assigned a set of partitions by the Connect framework and will handle all records received from those partitions.
 * As records are fetched from Kafka, they will be passed to the sink task using the put(Collection) API, which should
 * either write them to the downstream system or batch them for later writing. Periodically, Connect will call
 * flush(Map) to ensure that batched records are actually pushed to the downstream system.. Below we describe the lifecycle of a SinkTask.
 Initialization: SinkTasks are first initialized using initialize(SinkTaskContext) to prepare the task's context and
 start(Map) to accept configuration and start any services needed for processing.
 Partition Assignment: After initialization, Connect will assign the task a set of partitions using open(Collection).
 These partitions are owned exclusively by this task until they have been closed with close(Collection).
 Record Processing: Once partitions have been opened for writing, Connect will begin forwarding records from Kafka
 using the put(Collection) API. Periodically, Connect will ask the task to flush records using flush(Map) as described above.
 Partition Rebalancing: Occasionally, Connect will need to change the assignment of this task. When this happens,
 the currently assigned partitions will be closed with close(Collection) and the new assignment will be opened using open(Collection).
 Shutdown: When the task needs to be shutdown, Connect will close active partitions (if there are any) and stop the task using stop()
 */
class SinkTask extends Task {

    constructor(){
        super();
    }

}

module.exports = SinkTask;