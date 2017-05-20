"use strict";

class Storage {

    constructor(producer, topic = "_nconnect"){
        this.topic = topic;
        this.producer = producer;
    }

    prepare(){
        return this.producer.refreshMetadata(this.topic);
    }
}

module.exports = Storage;