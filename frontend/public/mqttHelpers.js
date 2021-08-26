function publishMessage(qos, destination, command, content) {
    var message = {
        command: command,
        content: content
    };

    try {
        let messageMQTT = new Paho.MQTT.Message(JSON.stringify(message));
        messageMQTT.destinationName = destination;
        messageMQTT.qos = qos;
        client.send(messageMQTT)
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