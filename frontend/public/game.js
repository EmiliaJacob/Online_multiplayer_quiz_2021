// MQTT Ablauf
// Client stellt Verbindung her und teilt mit, dass er dem Spiel joint
// Server sendet Frage und Timer and Client
var timerRunning = false;
var isGameMaster = false;

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

window.onload = function() {
    timerRunning = false;
    //setToPlayerView();
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

    if(msg.destinationName == "quiz/match/setRoles") {
        if(msg.payloadString == "player"){
            //client.unsubscribe("quiz/match/player"); // TODO: Make the order of subscriptions more detailed
            //client.subscribe("quiz/match/gameMaster");
            setToPlayerView();
        } 
        if(msg.payloadString == "gameMaster") {
            client.subscribe("quiz/match/player"); // TODO: Make the order of subscriptions more detailed
            client.unsubscribe("quiz/match/gameMaster");
            setToGameMasterView();
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

function setQuestions(question) {
    document.getElementById("questionDisplay").innerHTML = "Question: " + JSON.stringify(question.text);
    document.getElementById("questionA").innerHTML = "A: " + JSON.stringify(question.a);
    document.getElementById("questionB").innerHTML = "B: " + JSON.stringify(question.b);
    document.getElementById("questionC").innerHTML = "C: " + JSON.stringify(question.c);
    document.getElementById("questionD").innerHTML = "D: " + JSON.stringify(question.d);
}

function setToGameMasterView() {
    console.log("   LDSKFSHHHHHHHHHHHHHHHHHHHHH");
    var questionParagraph = document.getElementById("question");
    questionParagraph.innerHTML = '';
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