function publishMessage(qos, destination, payload) {
    try {
        let message = new Paho.MQTT.Message(payload);
        message.destinationName = destination;
        message.qos = qos;
        client.send(message)
    } catch  {
        console.log("client is not connected");
    }
}

function subscribe(topic, onSuccess) {
    client.subscribe(topic, {
        onSuccess: onSuccess,
        onFailure: function(err) {
            console.log("Couldn't subscribe to topic: " + JSON.stringify(err.errorMessage));
            setTimeout(2000, subscribe(topic, onSuccess));
        }
    });
}

function unsubscribe(topic, onSuccess) {
    client.unsubscribe(topic, {
        onSuccess: onSuccess,
        onFailure: function(err) {
            console.log("Couldn't subscribe to topic: " + JSON.stringify(err.errorMessage));
            setTimeout(2000, subscribe(topic, onSuccess));
        }
    });
}
