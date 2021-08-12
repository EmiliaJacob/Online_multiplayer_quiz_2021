var client = new Paho.MQTT.Client("localhost", 8080, "/mqtt/", "helloworldclient");

function init() {
    console.log("init");
    client.onMessageArrived = onMessageArrived;
    client.connect(
        {onSuccess: onConnect}, // TODO: aus options eigenständiges objekt machen & timeout hinzufügen
        {onFailure: onFailure}
    );

}

function onConnect() {
    console.log("sucessfully connected to mosquitto broker");

    client.subscribe("topic1/a");

    var message = new Paho.MQTT.Message("Hallo mqtt");
    message.destinationName = "hallo/mqtt";
    client.send(message);
    //client.disconnect();

    var msgDisplay = document.getElementById("messageDisplay");
    msgDisplay.innerHTML = "connected";
}

function onFailure(err) { // TODO: Display error on webpage 
    console.log("cannot connect to Mosquitto broker: " + err);
    setTimeout(init, 2000); // TODO: Create variables for this
}

function onMessageArrived(msg) {
    console.log("received message");
    //var msgDisplay = document.getElementById("messageDisplay");
    //msgDisplay.innerHTML = "received messaged";
}

function publishMessage() {
    console.log("button was pressed")
    var message = new Paho.MQTT.Message("Button has been pressed");
    message.destinationName = "hallo/mqtt";
    client.send(message);
}

function initiateConnection() {
    client.connect({onSuccess:onConnect});
}

function disconnect() {
    client.disconnect();
}