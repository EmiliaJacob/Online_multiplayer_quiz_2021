var client;

// TODO: Make the client disconnect at the end

window.onload = function() {
    init();
    document.getElementById("findGame").addEventListener("click", () => {
            let message = new Paho.MQTT.Message("client with id xxx searches match");
            message.destinationName = "quiz/queue";
            client.send(message);
            document.getElementById("status").innerHTML = "Searching for match...";
        }
    )
}

function init() {
    client = new Paho.MQTT.Client("localhost", 8080, "/mqtt/", "quizHubClient");
    client.onMessageArrived = onMessageArrived;

    client.connect(
        {onSuccess: onConnectionSuccess},
        {onFailure: onConnectionFailure}
    )

}

function onMessageArrived(msg) {
    console.log("received message: " + msg.payloadString);
    
    if(msg.payloadString == "Found match") {
        client.disconnect();
        document.location.href = "http://localhost:3000/game";
    }
    else {
        document.getElementById("status").innerHTML = "Can't find a match. Please try again later";
    }

}

function onConnectionSuccess() {
    console.log("sucessfully connected");
    client.subscribe("quiz/availableMatches");
}

function onConnectionFailure(err) {
    console.log("connection failure: " + err);
    setTimeout(init, 2000);
}
