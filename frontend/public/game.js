// MQTT Ablauf
// Client stellt Verbindung her und teilt mit, dass er dem Spiel joint
// Server sendet Frage und Timer and Client
var timerRunning = false;

function startCountdown(countdownTime) {
        //var countdownTime = 10;
        if(!timerRunning) {
        var countdownVisualisation = document.getElementById("countdown");
        var intervalId = setInterval(secondExpired, 1000);
        timerRunning = true;

        function secondExpired() {
            if(countdownTime < 0) {
                clearInterval(intervalId);
                timerRunning = false;
                countdownVisualisation.innerHTML = "Round over";
            } 
            else {
                countdownVisualisation.innerHTML = countdownTime.toString();
                countdownTime -= 1;
            }
        }
    }
}


window.onload = function() {
    timerRunning = false;
    init();
}

function init() {
    client = new Paho.MQTT.Client("localhost", 8080, "/mqtt/", "quizMatchClient");
    client.onMessageArrived = onMessageArrived;

    client.connect(
        {onSuccess: onConnectionSuccess},
        {onFailure: onConnectionFailure}
    )
}

function onMessageArrived(msg) {
    console.log("received message: " + msg.destinationName);
    if(msg.destinationName == "quiz/match/timer") {
        let convertedMsg = parseInt(msg.payloadString);
        if(convertedMsg) {
            console.log("starting timer");
            startCountdown(convertedMsg);
        }
    }
}

function onConnectionSuccess() {
    console.log("sucessfully connected");
    client.subscribe("quiz/match/#");

    let message = new Paho.MQTT.Message("Client x joined match");
    message.destinationName = "quiz/match";
    client.send(message);
}

function onConnectionFailure(err) {
    console.log("connection failure: " + err);
    setTimeout(init, 2000);
}
