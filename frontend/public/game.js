var timerRunning = false;
var isGameMaster = false;
var currentRole;

function startCountdown(countdownTime) {
    if(!timerRunning) {
        var countdownVisualisation = document.getElementById("countdown");
        var intervalId = setInterval(secondExpired, 1000);
        timerRunning = true;

        function secondExpired() {
            if(countdownTime < 0) {
                clearInterval(intervalId);
                timerRunning = false;
                if(!isGameMaster)
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

window.onload = async function() {
    if(authorize()) {
        timerRunning = false;
        init();
    }
}

function init() {
    client = new Paho.MQTT.Client("localhost", 8080, "/mqtt/", "quizMatchClient");
    client.onMessageArrived = onMessageArrived;
    client.onMessageDelivered = onMessageDelivered;

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
        var questions = null;

        try {
            questions = JSON.parse(msg.payloadString);
        } catch (err) {
            console.log("payload is no proper JSON");
            console.log(msg.payloadString);
        }

        if(questions) 
            setQuestions(questions);
    }

    if(msg.destinationName == "quiz/match/roles") {
        if(msg.payloadString == "player"){ // TODO: Add check for username so that you know what role is yours
            setToPlayerView();
            subscribe("quiz/match/players", () => {
                publishMessage(0, "quiz/match/status", "sucessfully subscribed to players");
            })
        }
        if(msg.payloadString == "gameMaster") {
            setToGameMasterView();
            subscribe("quiz/match/gameMaster", () => {
                publishMessage(0, "quiz/match/status", "sucessfully subscribed to gameMaster");
            })
        }
    }
}

function onMessageDelivered(msg) {
    console.log("message has delivered: " + msg.payloadString);
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

function onConnectionSuccess() {
    console.log("sucessfully connected");
    subscribe("quiz/match/#", () => {
        publishMessage(0, "quiz/match/status", "Client ready");
    });
}

function onConnectionFailure(err) {
    console.log("connection failure: " + err);
    setTimeout(init, 2000);
}

function setToGameMasterView() {
    var questionParagraph = document.getElementById("question");
    questionParagraph.innerHTML = '';
    
    var header = document.createElement("h2");
    header.id = "questionDisplay";
    header.innerHTML = "Please select a question: ";
    questionParagraph.appendChild(header);
}

function setToPlayerView() {
    var chars = "abcd";

    var questionParagraph = document.getElementById("question");

    var questionDisplay = document.createElement("h2");
    questionDisplay.id = "questionDisplay";
    questionDisplay.innerHTML = "Question: Placeholder";
    questionParagraph.appendChild(questionDisplay);

    for(i=0; i<4; i++) {
        let choice = document.createElement("input");
        choice.id = "answer" + chars.charAt(i);
        choice.type = "radio";
        choice.name = "choices";
        questionParagraph.appendChild(choice);

        let label = document.createElement("label");
        label.for = choice.id;
        label.id = "question" + chars.charAt(i).toUpperCase();
        label.innerHTML = "placeholder";
        questionParagraph.appendChild(label);

        let br = document.createElement("br");
        questionParagraph.appendChild(br);
    }
}

function setQuestions(question) {
    document.getElementById("questionDisplay").innerHTML = "Question: " + JSON.stringify(question.text);
    document.getElementById("questionA").innerHTML = "A: " + JSON.stringify(question.a);
    document.getElementById("questionB").innerHTML = "B: " + JSON.stringify(question.b);
    document.getElementById("questionC").innerHTML = "C: " + JSON.stringify(question.c);
    document.getElementById("questionD").innerHTML = "D: " + JSON.stringify(question.d);
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

    publishMessage(0, "quiz/match", "client x answered: " + answer);
}