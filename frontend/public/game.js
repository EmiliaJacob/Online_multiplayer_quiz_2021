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
                roundOver();
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

    if(msg.destinationName == "quiz/match/questions") {
        try {
            questions = JSON.parse(msg.payloadString);
            setQuestions(questions);
        } catch (err) {
            console.log("payload is no proper JSON");
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

function roundOver() {
    console.log("round over");

    var answer = "none";
    if(document.getElementById("answerA").checked) {
        answer = "a";
    } else if (document.getElementById("answerB").checked) {
        answer = "b"
    } else if (document.getElementById("answerC").checked) {
        answer = "c"
    } else if (document.getElementById("answerD").checked) {
        answer = "d"
    }

    let message = new Paho.MQTT.Message("client x answered: " + answer);
    message.destinationName = "quiz/match";
    client.send(message);
}

function setQuestions(questions) {
    document.getElementById("questionA").innerHTML = JSON.stringify(questions.a);
    document.getElementById("questionB").innerHTML = JSON.stringify(questions.b);
    document.getElementById("questionC").innerHTML = JSON.stringify(questions.c);
    document.getElementById("questionD").innerHTML = JSON.stringify(questions.d);
}